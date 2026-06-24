-- ============================================================
-- Blog Platform – PostgreSQL Schema
-- Run this once to initialise the database
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Posts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  author_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(300) UNIQUE NOT NULL,
  content       TEXT         NOT NULL,
  excerpt       TEXT,
  cover_image   TEXT,
  tags          TEXT[]       DEFAULT '{}',
  is_published  BOOLEAN      DEFAULT FALSE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Comments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL PRIMARY KEY,
  post_id     INT  NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
  author_id   INT  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  parent_id   INT           REFERENCES comments(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Likes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

-- ─── Bookmarks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_author     ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug       ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published  ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_comments_post    ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author  ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent  ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_likes_post       ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user       ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user   ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post   ON bookmarks(post_id);
