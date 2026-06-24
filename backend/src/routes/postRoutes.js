import { Router } from 'express';
import {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getUserPosts,
  getMyPosts,
  likePost,
  unlikePost,
  bookmarkPost,
  removeBookmark,
  getBookmarks,
} from '../controllers/postController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = Router();

// Public list posts
router.get('/', getAllPosts);

// Protected user-specific posts (must be declared before dynamic /:slug)
router.get('/my', protect, getMyPosts);
router.get('/bookmarks', protect, getBookmarks);
router.get('/user/:userId', getUserPosts);

// Public single post detail with optional auth (to retrieve is_liked/is_bookmarked status)
router.get('/:slug', optionalProtect, getPostBySlug);

// Protected write operations
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Protected action operations (likes and bookmarks)
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);
router.post('/:id/bookmark', protect, bookmarkPost);
router.delete('/:id/bookmark', protect, removeBookmark);

export default router;
