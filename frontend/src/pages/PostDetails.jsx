import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPostBySlug, toggleLikePost, toggleBookmarkPost, clearCurrentPost } from '../store/postsSlice.js';
import { fetchPostComments, addComment, updateCommentContent, removeComment, clearComments } from '../store/commentsSlice.js';
import { Heart, Bookmark, Calendar, ArrowLeft, MessageSquare, Reply, Edit, Trash2, Send, Clock } from 'lucide-react';
import './PostDetails.css';

export default function PostDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentPost, status: postStatus } = useSelector((state) => state.posts);
  const { comments, status: commentStatus } = useSelector((state) => state.comments);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Local state for comments
  const [rootCommentText, setRootCommentText] = useState('');
  const [replyTargetId, setReplyTargetId] = useState(null); // ID of comment being replied to
  const [replyText, setReplyText] = useState('');
  const [editTargetId, setEditTargetId] = useState(null); // ID of comment being edited
  const [editText, setEditText] = useState('');

  // Fetch post and comments
  useEffect(() => {
    dispatch(fetchPostBySlug(slug));
    return () => {
      dispatch(clearCurrentPost());
      dispatch(clearComments());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentPost?.id) {
      dispatch(fetchPostComments(currentPost.id));
    }
  }, [dispatch, currentPost?.id]);

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleLikePost({ postId: currentPost.id, isLiked: currentPost.is_liked }));
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleBookmarkPost({ postId: currentPost.id, isBookmarked: currentPost.is_bookmarked }));
  };

  const handleAddRootComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (rootCommentText.trim() === '') return;
    dispatch(addComment({ post_id: currentPost.id, parent_id: null, content: rootCommentText }));
    setRootCommentText('');
  };

  const handleAddReply = (parentId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (replyText.trim() === '') return;
    dispatch(addComment({ post_id: currentPost.id, parent_id: parentId, content: replyText }));
    setReplyText('');
    setReplyTargetId(null);
  };

  const handleEditCommentSubmit = (commentId) => {
    if (editText.trim() === '') return;
    dispatch(updateCommentContent({ commentId, content: editText }));
    setEditText('');
    setEditTargetId(null);
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment? Sub-replies will also be removed.')) {
      dispatch(removeComment(commentId));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Convert flat comments list into a hierarchical tree
  const buildCommentsTree = (flatComments) => {
    const map = {};
    flatComments.forEach(c => {
      map[c.id] = { ...c, replies: [] };
    });
    
    const roots = [];
    flatComments.forEach(c => {
      if (c.parent_id) {
        if (map[c.parent_id]) {
          map[c.parent_id].replies.push(map[c.id]);
        }
      } else {
        roots.push(map[c.id]);
      }
    });
    
    return roots;
  };

  if (postStatus === 'loading' || !currentPost) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading post details...</p>
      </div>
    );
  }

  const commentsTree = buildCommentsTree(comments);

  // Recursive comment node renderer
  const renderCommentNode = (node, depth = 0) => {
    const isOwner = user?.id === node.author_id;
    const isEditing = editTargetId === node.id;
    const isReplying = replyTargetId === node.id;

    return (
      <div 
        key={node.id} 
        className="comment-node animate-fade-in" 
        style={{ marginLeft: `${Math.min(depth * 24, 96)}px` }}
      >
        <div className="comment-card glass-panel">
          <div className="comment-header">
            <div className="comment-author-info">
              <img 
                src={node.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&h=60'} 
                alt={node.author_username} 
                className="comment-avatar"
              />
              <div>
                <span className="comment-author-name">{node.author_username}</span>
                <span className="comment-date">{formatDate(node.created_at)}</span>
              </div>
            </div>
            
            <div className="comment-controls">
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    setReplyTargetId(isReplying ? null : node.id);
                    setReplyText('');
                    setEditTargetId(null);
                  }}
                  className="btn-icon-text"
                  title="Reply"
                >
                  <Reply size={14} /> Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button 
                    onClick={() => {
                      setEditTargetId(isEditing ? null : node.id);
                      setEditText(node.content);
                      setReplyTargetId(null);
                    }}
                    className="btn-icon-text"
                    title="Edit"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteComment(node.id)}
                    className="btn-icon-text text-danger"
                    title="Delete"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="comment-body">
            {isEditing ? (
              <div className="comment-edit-form">
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="form-input text-area-edit"
                  rows={2}
                />
                <div className="comment-edit-actions">
                  <button 
                    onClick={() => setEditTargetId(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleEditCommentSubmit(node.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <p className="comment-text">{node.content}</p>
            )}
          </div>
        </div>

        {/* Inline Reply input */}
        {isReplying && (
          <div className="reply-input-box glass-panel animate-slide-up">
            <textarea 
              placeholder={`Reply to @${node.author_username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="form-input text-area-reply"
              rows={2}
            />
            <div className="reply-box-controls">
              <button onClick={() => setReplyTargetId(null)} className="btn btn-secondary btn-sm">Cancel</button>
              <button onClick={() => handleAddReply(node.id)} className="btn btn-primary btn-sm">Post Reply</button>
            </div>
          </div>
        )}

        {/* Recursive rendering for replies */}
        {node.replies && node.replies.map(reply => renderCommentNode(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="post-detail-container animate-slide-up">
      {/* Back to Home link */}
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <article className="post-article">
        {/* Cover Image */}
        <div className="post-cover-container glass-panel">
          <img 
            src={currentPost.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&h=600'} 
            alt={currentPost.title} 
            className="post-cover"
          />
        </div>

        {/* Meta Header */}
        <header className="post-header-details">
          <div className="post-meta-row">
            <span className="post-meta-item">
              <Calendar size={16} /> {formatDate(currentPost.created_at)}
            </span>
            <span className="post-meta-item">
              <Clock size={16} /> 5 min read
            </span>
          </div>

          <h1 className="post-detail-title">{currentPost.title}</h1>

          <div className="post-meta-tags">
            {currentPost.tags.map((tag, idx) => (
              <span key={idx} className="post-tag">#{tag}</span>
            ))}
          </div>

          {/* Author Header */}
          <div className="post-detail-author glass-panel">
            <img 
              src={currentPost.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'} 
              alt={currentPost.author_username} 
              className="author-detail-avatar"
            />
            <div className="author-detail-meta">
              <span className="author-detail-name">Written by {currentPost.author_username}</span>
              <p className="author-detail-bio">{currentPost.author_bio || 'Writer, creator and developer sharing ideas on AetherBlog.'}</p>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <section className="post-body-content">
          {currentPost.content.split('\n').map((para, idx) => (
            <p key={idx} className="post-paragraph">{para}</p>
          ))}
        </section>

        {/* Bottom Actions (Likes and Bookmarks) */}
        <div className="post-actions-panel glass-panel">
          <button 
            onClick={handleLike} 
            className={`btn-action-trigger ${currentPost.is_liked ? 'liked' : ''}`}
          >
            <Heart size={20} className={currentPost.is_liked ? 'pulse-heart' : ''} />
            <span>{currentPost.likes_count} Likes</span>
          </button>
          
          <button 
            onClick={handleBookmark} 
            className={`btn-action-trigger ${currentPost.is_bookmarked ? 'bookmarked' : ''}`}
          >
            <Bookmark size={20} />
            <span>{currentPost.is_bookmarked ? 'Bookmarked' : 'Save Story'}</span>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <section className="comments-section-container">
        <div className="comments-sec-header">
          <MessageSquare size={20} />
          <h3>Discussion ({comments.length} comments)</h3>
        </div>

        {/* Add comment Form */}
        <form onSubmit={handleAddRootComment} className="comment-root-form glass-panel">
          <textarea 
            placeholder={isAuthenticated ? "Join the discussion... write your thoughts here" : "Sign in to join the conversation and comment!"}
            disabled={!isAuthenticated}
            value={rootCommentText}
            onChange={(e) => setRootCommentText(e.target.value)}
            className="form-input text-area-root"
            rows={3}
          />
          <div className="comment-root-form-footer">
            {isAuthenticated ? (
              <>
                <div className="user-indicator">
                  Commenting as <strong>{user?.username}</strong>
                </div>
                <button type="submit" className="btn btn-primary">
                  Post Comment <Send size={16} />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">Sign in to Comment</Link>
            )}
          </div>
        </form>

        {/* Comments List */}
        <div className="comments-tree">
          {commentStatus === 'loading' ? (
            <p>Loading comments...</p>
          ) : comments.length === 0 ? (
            <div className="empty-comments-state">
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            commentsTree.map(rootNode => renderCommentNode(rootNode))
          )}
        </div>
      </section>
    </div>
  );
}
