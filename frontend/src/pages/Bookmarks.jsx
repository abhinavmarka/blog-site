import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookmarks } from '../store/postsSlice.js';
import { ArrowLeft, Bookmark, Heart, MessageSquare } from 'lucide-react';
import './Bookmarks.css';

export default function Bookmarks() {
  const dispatch = useDispatch();
  const { bookmarks, status } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bookmarks-page-container animate-slide-up">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="page-header">
        <h1 className="page-title">Your Bookmarks</h1>
        <p className="page-subtitle">Access all the stories you've saved for later reading.</p>
      </header>

      {status === 'loading' ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="empty-state glass-panel">
          <span className="empty-state-icon">🔖</span>
          <h3>Your bookmark list is empty</h3>
          <p>Explore articles in the Global Feed and tap bookmark to save them here!</p>
          <Link to="/" className="btn btn-primary">Browse Global Feed</Link>
        </div>
      ) : (
        <div className="posts-grid grid grid-cols-3">
          {bookmarks.map((post) => (
            <article key={post.id} className="post-card glass-panel animate-fade-in">
              <Link to={`/posts/${post.slug}`} className="card-image-link">
                <img 
                  src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&h=350'} 
                  alt={post.title} 
                  className="card-image"
                />
              </Link>
              <div className="card-content">
                <h3 className="card-title">
                  <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="card-excerpt">{post.excerpt}</p>
                
                <div className="card-footer">
                  <div className="card-author">
                    <img 
                      src={post.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&h=60'} 
                      alt={post.author_username} 
                      className="author-avatar"
                    />
                    <div className="author-details">
                      <span className="author-name">{post.author_username}</span>
                      <span className="post-date">{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <div className="card-stats">
                    <span className="stat-item"><Heart size={14} /> {post.likes_count}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
