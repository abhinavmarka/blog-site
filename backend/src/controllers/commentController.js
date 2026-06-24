import { query } from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/comments
// Protected — Create a new comment or nested reply
// ─────────────────────────────────────────────────────────────────────────────
export const createComment = async (req, res) => {
  try {
    const { post_id, parent_id, content } = req.body;

    if (!post_id || !content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Post ID and comment content are required.',
      });
    }

    // Verify post exists
    const postCheck = await query('SELECT id FROM posts WHERE id = $1', [post_id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // If parent_id is provided, verify parent comment exists
    if (parent_id) {
      const parentCheck = await query('SELECT id FROM comments WHERE id = $1', [parent_id]);
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Parent comment not found.' });
      }
    }

    // Insert comment and return with author info
    const result = await query(
      `WITH inserted AS (
         INSERT INTO comments (post_id, author_id, parent_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING id, post_id, author_id, parent_id, content, created_at, updated_at
       )
       SELECT
         i.id, i.post_id, i.author_id, i.parent_id, i.content, i.created_at, i.updated_at,
         u.username AS author_username, u.avatar_url AS author_avatar
       FROM inserted i
       JOIN users u ON u.id = i.author_id`,
      [parseInt(post_id), req.user.id, parent_id ? parseInt(parent_id) : null, content.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('createComment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/comments/post/:postId
// Public — Get all comments for a post in flat list format ordered by creation
// ─────────────────────────────────────────────────────────────────────────────
export const getPostComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    // Verify post exists
    const postCheck = await query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const result = await query(
      `SELECT
         c.id, c.post_id, c.author_id, c.parent_id, c.content, c.created_at, c.updated_at,
         u.username AS author_username, u.avatar_url AS author_avatar
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('getPostComments error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/comments/:id
// Protected — Update a comment (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required.',
      });
    }

    // Verify comment exists and check ownership
    const existing = await query('SELECT author_id FROM comments WHERE id = $1', [commentId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (existing.rows[0].author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to edit this comment.',
      });
    }

    // Update comment
    const result = await query(
      `WITH updated AS (
         UPDATE comments
         SET content = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, post_id, author_id, parent_id, content, created_at, updated_at
       )
       SELECT
         up.id, up.post_id, up.author_id, up.parent_id, up.content, up.created_at, up.updated_at,
         u.username AS author_username, u.avatar_url AS author_avatar
       FROM updated up
       JOIN users u ON u.id = up.author_id`,
      [content.trim(), commentId]
    );

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('updateComment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/comments/:id
// Protected — Delete a comment (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    // Verify comment exists and check ownership
    const existing = await query('SELECT author_id FROM comments WHERE id = $1', [commentId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (existing.rows[0].author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to delete this comment.',
      });
    }

    await query('DELETE FROM comments WHERE id = $1', [commentId]);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    console.error('deleteComment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
