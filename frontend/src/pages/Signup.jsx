import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice.js';
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, status, error } = useSelector((state) => state.auth);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState('');

  // Clear errors on load
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPassError('');
    
    if (!username || !email || !password) return;
    
    if (password.length < 6) {
      setPassError('Password must be at least 6 characters long');
      return;
    }

    dispatch(registerUser({ username, email, password }));
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel animate-slide-up">
        <div className="auth-header">
          <span className="auth-logo">🔮</span>
          <h2>Create your account</h2>
          <p>Join AetherBlog today to share your stories with the world</p>
        </div>

        {(error || passError) && (
          <div className="auth-error-banner animate-fade-in">
            <AlertCircle size={18} />
            <span>{error || passError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                id="username"
                placeholder="alice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                id="email"
                placeholder="alice@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                id="password"
                placeholder="•••••••• (Min. 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'} 
            className="btn btn-primary auth-submit-btn"
          >
            {status === 'loading' ? 'Creating Account...' : 'Get Started'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
