import { query } from '../config/db.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from a title, appended with a short unique suffix
 * to avoid collisions (e.g. "my-post-title-a1b2c3").
 */
const generateSlug = (title) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts
// Public — paginated list of published posts
// Query params: page, limit, tag, search, author_id
// ─────────────────────────────────────────────────────────────────────────────
export const getAllPosts = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { tag, search, author_id } = req.query;

    // Build dynamic WHERE clauses
    const conditions = ['p.is_published = TRUE'];
    const params     = [];
    let   paramIndex = 1;

    if (tag) {
      conditions.push(`$${paramIndex} = ANY(p.tags)`);
      params.push(tag);
      paramIndex++;
    }

    if (search) {
      conditions.push(
        `(p.title ILIKE $${paramIndex} OR p.excerpt ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (author_id) {
      conditions.push(`p.author_id = $${paramIndex}`);
      params.push(parseInt(author_id));
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Count total matching posts
    const countResult = await query(
      `SELECT COUNT(*) FROM posts p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch paginated posts with author info + like/bookmark counts
    const postsResult = await query(
      `SELECT
         p.id, p.title, p.slug, p.excerpt, p.cover_image,
         p.tags, p.created_at, p.updated_at,
         u.id   AS author_id,
         u.username AS author_username,
         u.avatar_url AS author_avatar,
         (SELECT COUNT(*) FROM likes     l WHERE l.post_id = p.id)::INT AS likes_count,
         (SELECT COUNT(*) FROM comments  c WHERE c.post_id = p.id)::INT AS comments_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: postsResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('getAllPosts error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts/:slug
// Public — single post with full content, author, like/bookmark status
// ─────────────────────────────────────────────────────────────────────────────
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId   = req.user?.id || null;

    const result = await query(
      `SELECT
         p.id, p.title, p.slug, p.content, p.excerpt,
         p.cover_image, p.tags, p.is_published,
         p.created_at, p.updated_at,
         u.id         AS author_id,
         u.username   AS author_username,
         u.bio        AS author_bio,
         u.avatar_url AS author_avatar,
         (SELECT COUNT(*) FROM likes    l WHERE l.post_id = p.id)::INT AS likes_count,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)::INT AS comments_count,
         ${userId
           ? `EXISTS(SELECT 1 FROM likes     WHERE user_id = $2 AND post_id = p.id) AS is_liked,
              EXISTS(SELECT 1 FROM bookmarks WHERE user_id = $2 AND post_id = p.id) AS is_bookmarked`
           : `FALSE AS is_liked, FALSE AS is_bookmarked`
         }
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.slug = $1`,
      userId ? [slug, userId] : [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = result.rows[0];

    // Non-published posts are only visible to their author
    if (!post.is_published && post.author_id !== userId) {
      return res.status(403).json({ success: false, message: 'This post is not published.' });
    }

    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('getPostBySlug error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/posts
// Protected — create a new post
// ─────────────────────────────────────────────────────────────────────────────
export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, cover_image, tags, is_published } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required.',
      });
    }

    const slug = generateSlug(title);

    const result = await query(
      `INSERT INTO posts
         (author_id, title, slug, content, excerpt, cover_image, tags, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING
         id, title, slug, excerpt, cover_image, tags, is_published, created_at`,
      [
        req.user.id,
        title,
        slug,
        content,
        excerpt   || null,
        cover_image || null,
        tags        || [],
        is_published === true,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/posts/:id
// Protected — update own post
// ─────────────────────────────────────────────────────────────────────────────
export const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    // Verify ownership
    const existing = await query(
      'SELECT author_id FROM posts WHERE id = $1',
      [postId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (existing.rows[0].author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to edit this post.',
      });
    }

    const { title, content, excerpt, cover_image, tags, is_published } = req.body;

    const result = await query(
      `UPDATE posts SET
         title        = COALESCE($1, title),
         content      = COALESCE($2, content),
         excerpt      = COALESCE($3, excerpt),
         cover_image  = COALESCE($4, cover_image),
         tags         = COALESCE($5, tags),
         is_published = COALESCE($6, is_published),
         updated_at   = NOW()
       WHERE id = $7
       RETURNING id, title, slug, excerpt, cover_image, tags, is_published, updated_at`,
      [
        title        ?? null,
        content      ?? null,
        excerpt      ?? null,
        cover_image  ?? null,
        tags         ?? null,
        is_published ?? null,
        postId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('updatePost error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/posts/:id
// Protected — delete own post
// ─────────────────────────────────────────────────────────────────────────────
export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const existing = await query(
      'SELECT author_id FROM posts WHERE id = $1',
      [postId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (existing.rows[0].author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to delete this post.',
      });
    }

    await query('DELETE FROM posts WHERE id = $1', [postId]);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts/user/:userId
// Public — all published posts by a specific user
// ─────────────────────────────────────────────────────────────────────────────
export const getUserPosts = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const page         = Math.max(1, parseInt(req.query.page)  || 1);
    const limit        = Math.min(50, parseInt(req.query.limit) || 10);
    const offset       = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM posts WHERE author_id = $1 AND is_published = TRUE',
      [targetUserId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT
         p.id, p.title, p.slug, p.excerpt, p.cover_image,
         p.tags, p.created_at,
         (SELECT COUNT(*) FROM likes    l WHERE l.post_id = p.id)::INT AS likes_count,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)::INT AS comments_count
       FROM posts p
       WHERE p.author_id = $1 AND p.is_published = TRUE
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [targetUserId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getUserPosts error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts/my
// Protected — all posts (published + drafts) by the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
export const getMyPosts = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM posts WHERE author_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT
         p.id, p.title, p.slug, p.excerpt, p.cover_image,
         p.tags, p.is_published, p.created_at, p.updated_at,
         (SELECT COUNT(*) FROM likes    l WHERE l.post_id = p.id)::INT AS likes_count,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)::INT AS comments_count
       FROM posts p
       WHERE p.author_id = $1
       ORDER BY p.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getMyPosts error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/posts/:id/like     — toggle like on a post
// DELETE /api/posts/:id/like
// Protected
// ─────────────────────────────────────────────────────────────────────────────
export const likePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    // Upsert: silently ignore if already liked
    await query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [req.user.id, postId]
    );

    const count = await query(
      'SELECT COUNT(*)::INT AS likes_count FROM likes WHERE post_id = $1',
      [postId]
    );

    return res.status(200).json({
      success: true,
      message: 'Post liked.',
      likes_count: count.rows[0].likes_count,
    });
  } catch (error) {
    console.error('likePost error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    await query(
      'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
      [req.user.id, postId]
    );

    const count = await query(
      'SELECT COUNT(*)::INT AS likes_count FROM likes WHERE post_id = $1',
      [postId]
    );

    return res.status(200).json({
      success: true,
      message: 'Post unliked.',
      likes_count: count.rows[0].likes_count,
    });
  } catch (error) {
    console.error('unlikePost error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST   /api/posts/:id/bookmark  — bookmark a post
// DELETE /api/posts/:id/bookmark  — remove bookmark
// Protected
// ─────────────────────────────────────────────────────────────────────────────
export const bookmarkPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    await query(
      `INSERT INTO bookmarks (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [req.user.id, postId]
    );

    return res.status(200).json({ success: true, message: 'Post bookmarked.' });
  } catch (error) {
    console.error('bookmarkPost error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    await query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2',
      [req.user.id, postId]
    );

    return res.status(200).json({ success: true, message: 'Bookmark removed.' });
  } catch (error) {
    console.error('removeBookmark error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts/bookmarks
// Protected — get all bookmarked posts for current user
// ─────────────────────────────────────────────────────────────────────────────
export const getBookmarks = async (req, res) => {
  try {
    const result = await query(
      `SELECT
         p.id, p.title, p.slug, p.excerpt, p.cover_image,
         p.tags, p.created_at,
         u.username AS author_username, u.avatar_url AS author_avatar,
         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id)::INT AS likes_count
       FROM bookmarks b
       JOIN posts p ON p.id = b.post_id
       JOIN users u ON u.id = p.author_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getBookmarks error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
