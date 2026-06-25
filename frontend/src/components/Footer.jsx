import { Link } from 'react-router-dom';
import { Globe, Mail, Send } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to AetherBlog!');
  };

  return (
    <footer className="footer-wrapper glass-panel">
      <div className="footer-container">
        
        {/* Brand Section */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">🔮</span>
            <span className="logo-text">AetherBlog</span>
          </Link>
          <p className="brand-description">
            A premium, high-performance canvas for digital creators. Read, write, and inspire your thoughts with the rest of the universe.
          </p>
          <div className="social-links">
            <a href="https://github.com/abhinavmarka" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="https://aetherblog.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Website">
              <Globe size={18} />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer-links-group">
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-links">
            <li><Link to="/">Explore Feed</Link></li>
            <li><Link to="/bookmarks">Saved Bookmarks</Link></li>
            <li><Link to="/create-post">Write a Story</Link></li>
          </ul>
        </div>

        {/* Resources Links */}
        <div className="footer-links-group">
          <h4 className="footer-heading">Technology</h4>
          <ul className="footer-links">
            <li><a href="https://react.dev" target="_blank" rel="noopener noreferrer">React 19</a></li>
            <li><a href="https://vite.dev" target="_blank" rel="noopener noreferrer">Vite 8</a></li>
            <li><a href="https://redux-toolkit.js.org" target="_blank" rel="noopener noreferrer">Redux Toolkit</a></li>
            <li><a href="https://expressjs.com" target="_blank" rel="noopener noreferrer">Express API</a></li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <h4 className="footer-heading">Subscribe to updates</h4>
          <p className="newsletter-text">Get notified when new articles are published in our open tech feed.</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email..." 
              required 
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>

      {/* Footer Bottom copyright */}
      <div className="footer-bottom">
        <div className="copyright">
          © {new Date().getFullYear()} AetherBlog. Built with React & Redux. All rights reserved.
        </div>
        <div className="footer-meta-links">
          <a href="#privacy">Privacy Policy</a>
          <span className="dot">•</span>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
