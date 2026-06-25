import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import { LogOut, User, BookOpen, Bookmark, Edit, ChevronDown, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="logo-icon">🔮</span>
          <span className="logo-text">AetherBlog</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links desktop-only">
          {isAuthenticated ? (
            <>
              <Link to="/bookmarks" className="nav-link">
                <Bookmark size={18} />
                Bookmarks
              </Link>
              <Link to="/create-post" className="btn btn-primary btn-write">
                <Edit size={16} />
                Write Post
              </Link>
              
              <div className="profile-dropdown-container" ref={dropdownRef}>
                <button 
                  className="profile-trigger" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img 
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'} 
                    alt={user?.username} 
                    className="avatar-small"
                  />
                  <span className="username">{user?.username}</span>
                  <ChevronDown size={14} className={dropdownOpen ? 'rotated' : ''} />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu glass-panel">
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <User size={16} />
                      Profile Settings
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="mobile-nav glass-panel animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <img 
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'} 
                  alt={user?.username} 
                  className="avatar-medium"
                />
                <div>
                  <div className="mobile-username">{user?.username}</div>
                  <div className="mobile-email">{user?.email}</div>
                </div>
              </div>
              <Link to="/bookmarks" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <Bookmark size={18} /> Bookmarks
              </Link>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <User size={18} /> Profile Settings
              </Link>
              <Link to="/create-post" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                <Edit size={16} /> Write Post
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary mobile-logout">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
