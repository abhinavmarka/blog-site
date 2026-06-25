import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, clearError } from '../store/authSlice.js';
import { User, Mail, FileText, Link2, Calendar, Check, AlertCircle } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const dispatch = useDispatch();
  
  const { user, status, error } = useSelector((state) => state.auth);
  
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Synchronize local input state with Redux user state when it loads asynchronously
  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    
    dispatch(updateUserProfile({ bio, avatar_url: avatarUrl }))
      .unwrap()
      .then(() => {
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="profile-container animate-slide-up">
      <div className="profile-card glass-panel">
        
        {/* Profile Banner / Details */}
        <div className="profile-hero-section">
          <img 
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
            alt={user?.username} 
            className="profile-hero-avatar"
          />
          <div className="profile-hero-details">
            <h2>{user?.username}</h2>
            <p className="profile-joined">
              <Calendar size={14} /> Joined {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="profile-success-banner animate-fade-in">
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="profile-error-banner animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Profile settings form */}
        <form onSubmit={handleSubmit} className="profile-form">
          <h3 className="section-title-sub">Profile Information</h3>
          
          <div className="form-group readonly-group">
            <label className="form-label">
              <User size={14} /> Username (Read-Only)
            </label>
            <input 
              type="text" 
              value={user?.username}
              disabled
              className="form-input disabled-input"
            />
          </div>

          <div className="form-group readonly-group">
            <label className="form-label">
              <Mail size={14} /> Email Address (Read-Only)
            </label>
            <input 
              type="email" 
              value={user?.email}
              disabled
              className="form-input disabled-input"
            />
          </div>

          <h3 className="section-title-sub" style={{ marginTop: '12px' }}>Edit Custom Settings</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="avatarUrl">
              <Link2 size={14} /> Avatar Image URL
            </label>
            <input 
              type="url" 
              id="avatarUrl"
              placeholder="Paste a direct image link..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bio">
              <FileText size={14} /> Bio
            </label>
            <textarea 
              id="bio"
              placeholder="Tell other readers about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="form-input profile-textarea"
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="btn btn-primary profile-submit-btn"
          >
            {status === 'loading' ? 'Saving changes...' : 'Save Settings'}
          </button>
        </form>

      </div>
    </div>
  );
}
