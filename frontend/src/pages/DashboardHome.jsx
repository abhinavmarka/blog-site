import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllPosts, fetchMyPosts, fetchBookmarks, deleteExistingPost } from '../store/postsSlice.js';
import { Edit2, Trash2, Search, Heart, MessageSquare, Plus, BookOpen, FileText, Bookmark } from 'lucide-react';
import './DashboardHome.css';

export default function DashboardHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { posts, myPosts, bookmarks, status } = useSelector((state) => state.posts);
  
  // Tabs: 'feed' | 'my-posts' | 'bookmarks'
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Sync tab loading
  useEffect(() => {
    if (activeTab === 'feed') {
      dispatch(fetchAllPosts({ page, limit: 9, search: searchQuery }));
    } else if (activeTab === 'my-posts') {
      dispatch(fetchMyPosts());
    } else if (activeTab === 'bookmarks') {
      dispatch(fetchBookmarks());
    }
  }, [dispatch, activeTab, page, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchAllPosts({ page: 1, limit: 9, search: searchQuery }));
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deleteExistingPost(id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="landing-wrapper">
      {/* Background ambient blobs */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
      </div>
      <div className="grid-overlay"></div>

      <div className="dashboard-container">
        {/* Dashboard Top Header */}
        <header className="dashboard-header animate-slide-up">
          <div className="header-text">
            <h1 className="dashboard-welcome">
              Welcome, <span className="text-gradient">{user?.username}</span>
            </h1>
            <p className="dashboard-sub">Explore the canvas or curate your publications.</p>
          </div>
          <Link to="/create-post" className="btn btn-primary write-story-btn">
            <Plus size={18} /> Write a Story
          </Link>
        </header>

        {/* Asymmetrical Layout Grid: Main Content + Sidebar */}
        <div className="dashboard-grid animate-slide-up">
          
          {/* Main Feed Column */}
          <main className="dashboard-main">
            {/* Flat Tabs Navigator */}
            <div className="tabs-header-flat">
              <button 
                className={`tab-btn-flat ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('feed');
                  setPage(1);
                }}
              >
                Global Feed
              </button>
              <button 
                className={`tab-btn-flat ${activeTab === 'my-posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-posts')}
              >
                My Articles
              </button>
              <button 
                className={`tab-btn-flat ${activeTab === 'bookmarks' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookmarks')}
              >
                Bookmarks
              </button>
            </div>

            {/* Dynamic Content Views */}
            <section className="dashboard-content">
              {activeTab === 'feed' && (
                <div className="feed-view animate-fade-in">
                  {/* Search bar inside feed */}
                  <form onSubmit={handleSearchSubmit} className="search-form dashboard-search glass-panel">
                    <Search size={20} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search articles globally..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    <kbd className="search-shortcut">⌘K</kbd>
                  </form>

                  {status === 'loading' ? (
                    <div className="spinner-container">
                      <div className="spinner"></div>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <span className="empty-state-icon">📡</span>
                      <h3>No articles found</h3>
                      <p>Try searching another keyword.</p>
                    </div>
                  ) : (
                    <div className="posts-grid-asym">
                      {posts.map((post) => (
                        <article key={post.id} className="post-card glass-panel">
                          <Link to={`/posts/${post.slug}`} className="card-image-link">
                            <img 
                              src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&h=350'} 
                              alt={post.title} 
                              className="card-image"
                            />
                          </Link>
                          <div className="card-content">
                            <div className="card-tags">
                              {post.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="card-tag">#{tag}</span>
                              ))}
                            </div>
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
                                <span className="stat-item"><MessageSquare size={14} /> {post.comments_count}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'my-posts' && (
                <div className="my-posts-view animate-fade-in">
                  {myPosts.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <span className="empty-state-icon">✍️</span>
                      <h3>You haven't written any articles yet</h3>
                      <p>Click "Write a Story" above to share your thoughts!</p>
                      <Link to="/create-post" className="btn btn-primary" style={{ marginTop: '16px' }}>Start Writing</Link>
                    </div>
                  ) : (
                    <div className="posts-grid-asym">
                      {myPosts.map((post) => (
                        <article key={post.id} className="post-card glass-panel">
                          <Link to={`/posts/${post.slug}`} className="card-image-link">
                            <img 
                              src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&h=350'} 
                              alt={post.title} 
                              className="card-image"
                            />
                          </Link>
                          <div className="card-content">
                            <div className="card-meta">
                              <span className={`status-badge ${post.is_published ? 'published' : 'draft'}`}>
                                {post.is_published ? 'Published' : 'Draft'}
                              </span>
                              <span className="post-date">{formatDate(post.created_at)}</span>
                            </div>
                            <h3 className="card-title">
                              <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                            </h3>
                            <p className="card-excerpt">{post.excerpt}</p>
                            
                            <div className="card-actions-row">
                              <div className="card-stats">
                                <span className="stat-item"><Heart size={14} /> {post.likes_count}</span>
                                <span className="stat-item"><MessageSquare size={14} /> {post.comments_count}</span>
                              </div>
                              <div className="card-edit-controls">
                                <button 
                                  onClick={() => navigate(`/edit-post/${post.id}`)} 
                                  className="btn-icon text-primary-color"
                                  title="Edit Article"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)} 
                                  className="btn-icon text-danger-color"
                                  title="Delete Article"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="bookmarks-view animate-fade-in">
                  {bookmarks.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <span className="empty-state-icon">🔖</span>
                      <h3>No bookmarked articles</h3>
                      <p>Explore articles in the feed and bookmark them to read later!</p>
                      <button onClick={() => setActiveTab('feed')} className="btn btn-secondary" style={{ marginTop: '16px' }}>Explore Feed</button>
                    </div>
                  ) : (
                    <div className="posts-grid-asym">
                      {bookmarks.map((post) => (
                        <article key={post.id} className="post-card glass-panel">
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
                                <span className="stat-item"><MessageSquare size={14} /> {post.comments_count}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>

          {/* Sidebar Column */}
          <aside className="dashboard-sidebar">
            
            {/* User Profile Info Card */}
            <div className="profile-glass-card glass-panel">
              <div className="profile-header-info">
                <img 
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'} 
                  alt={user?.username} 
                  className="profile-avatar-large"
                />
                <h3 className="profile-name">{user?.username}</h3>
                <p className="profile-email">{user?.email}</p>
              </div>
              
              <div className="profile-stats-grid">
                <div className="profile-stat-box">
                  <span className="profile-stat-num">{myPosts.length}</span>
                  <span className="profile-stat-lbl">Stories</span>
                </div>
                <div className="profile-stat-box">
                  <span className="profile-stat-num">{bookmarks.length}</span>
                  <span className="profile-stat-lbl">Bookmarks</span>
                </div>
                <div className="profile-stat-box">
                  <span className="profile-stat-num">
                    {myPosts.reduce((acc, curr) => acc + (curr.likes_count || 0), 0)}
                  </span>
                  <span className="profile-stat-lbl">Likes</span>
                </div>
              </div>
              
              <Link to="/profile" className="btn btn-secondary edit-profile-btn">
                Edit Settings
              </Link>
            </div>

            {/* Platform Insights */}
            <div className="insights-glass-card glass-panel">
              <h4 className="insights-heading">Writing Insights</h4>
              <div className="insight-item">
                <span className="insight-dot positive"></span>
                <p>
                  Your stories reached <strong>{myPosts.reduce((acc, curr) => acc + (curr.likes_count || 0), 0)} total likes</strong>.
                </p>
              </div>
              <div className="insight-item">
                <span className="insight-dot info"></span>
                <p>
                  You saved <strong>{bookmarks.length} post{bookmarks.length === 1 ? '' : 's'}</strong> to read.
                </p>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
