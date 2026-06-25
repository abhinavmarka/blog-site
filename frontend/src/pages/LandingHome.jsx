import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllPosts } from '../store/postsSlice.js';
import { Heart, MessageSquare, Search, ArrowRight, Sparkles, Zap, Globe, BookOpen } from 'lucide-react';
import './LandingHome.css';

export default function LandingHome() {
  const dispatch = useDispatch();
  const { posts, status, pagination } = useSelector((state) => state.posts);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllPosts({ page, limit: 9, search: searchQuery }));
  }, [dispatch, page, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchAllPosts({ page: 1, limit: 9, search: searchQuery }));
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
      {/* Background elements */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
      </div>
      <div className="grid-overlay"></div>

      <div className="landing-container">
        {/* Hero Section */}
        <header className="hero animate-slide-up">
          <div className="hero-badge">
            <Sparkles size={13} className="sparkle-icon" /> 
            <span>Read, Write, and Inspire</span>
          </div>
          <h1 className="hero-title">
            Share Your Thoughts with the <span className="text-gradient">Universe</span>.
          </h1>
          <p className="hero-subtitle">
            Welcome to AetherBlog, a clean, modern, and high-performance writing canvas built to publish stories, connect with readers, and express yourself.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#stories" className="btn btn-secondary btn-lg">
              Explore Stories
            </a>
          </div>
        </header>

        {/* Platform Pillars Section */}
        <section className="features-section animate-slide-up">
          <div className="section-header text-center">
            <div className="section-badge">Platform Pillars</div>
            <h2 className="section-title">Designed for modern publishing</h2>
            <p className="section-subtitle">A minimal, beautiful, and distraction-free workspace for your mind.</p>
          </div>
          <div className="features-grid grid grid-cols-3">
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Zap size={22} className="feature-icon" />
              </div>
              <h3 className="feature-title">High-Performance Canvas</h3>
              <p className="feature-description">
                Experience liquid-smooth page loading, optimized caching, and state synchronization.
              </p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <BookOpen size={22} className="feature-icon" />
              </div>
              <h3 className="feature-title">Beautiful Markdown Editor</h3>
              <p className="feature-description">
                Compose clean articles with code blocks, headings, blockquotes, and instant side-by-side previews.
              </p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Globe size={22} className="feature-icon" />
              </div>
              <h3 className="feature-title">Global Creator Network</h3>
              <p className="feature-description">
                Interact with authors, bookmark favorites, and grow your audience in an open tech ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="stats-section glass-panel animate-slide-up">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Active Authors</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number">500k+</div>
              <div className="stat-label">Monthly Reads</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number">150+</div>
              <div className="stat-label">Countries Exchanged</div>
            </div>
          </div>
        </section>

        {/* Public Stories Feed */}
        <section id="stories" className="stories-section">
          <div className="section-header">
            <div className="section-badge">Publication Feed</div>
            <h2 className="section-title">Latest Publications</h2>
            <p className="section-subtitle">Read thoughts and tutorials written by writers across the globe.</p>
          </div>

          {/* Search input field */}
          <div className="search-filter-bar glass-panel">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search articles by title or keywords..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
          </div>

          {/* Feed Cards */}
          {status === 'loading' ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Loading fresh blogs...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state glass-panel">
              <span className="empty-state-icon">✍️</span>
              <h3>No articles found</h3>
              <p>We couldn't find any articles matching your search query. Try typing something else!</p>
            </div>
          ) : (
            <>
              <div className="posts-grid grid grid-cols-3">
                {posts.map((post) => (
                  <article key={post.id} className="post-card glass-panel animate-fade-in">
                    <Link to={`/posts/${post.slug}`} className="card-image-link">
                      <img 
                        src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&h=350'} 
                        alt={post.title} 
                        className="card-image"
                      />
                    </Link>
                    <div className="card-content">
                      <div className="card-tags">
                        {post.tags.slice(0, 3).map((tag, idx) => (
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="page-indicator">Page {page} of {pagination.totalPages}</span>
                  <button 
                    disabled={!pagination.hasNextPage} 
                    onClick={() => setPage(page + 1)}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* CTA Footer Section */}
        <section className="cta-section glass-panel animate-slide-up">
          <div className="cta-content">
            <h2 className="cta-title">Ready to share your own stories?</h2>
            <p className="cta-subtitle">Join thousands of creators and publish your thoughts with AetherBlog today.</p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Free Account <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
