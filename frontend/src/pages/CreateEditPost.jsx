import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createNewPost, updateExistingPost, fetchAllPosts } from '../store/postsSlice.js';
import { ArrowLeft, Save, FileText, CheckCircle, Tag, Image, Type } from 'lucide-react';
import './CreateEditPost.css';

export default function CreateEditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isEditMode = !!id;
  const { myPosts, status, error } = useSelector((state) => state.posts);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // If in edit mode, load existing values
  useEffect(() => {
    if (isEditMode) {
      const existingPost = myPosts.find(p => p.id === parseInt(id));
      if (existingPost) {
        setTitle(existingPost.title);
        // Wait, postController's getMyPosts returns excerpt, tags, is_published, but content is retrieved only when fetching single post by slug?
        // Actually, let's check: does getMyPosts query return content?
        // Looking back at postController.js getMyPosts:
        // `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.tags, p.is_published, p.created_at, p.updated_at`
        // Content is not returned by getMyPosts to save bandwidth.
        // Therefore, we need to fetch the post content if it's missing!
        // We can hit the backend or we can do a query, but since we are editing a post, let's fetch it by its slug, or retrieve it.
        // Wait! We can fetch the post content by loading it from the backend.
        // Let's call the API directly inside this component to fetch the edit details, which is extremely robust and ensures we have the full content!
        const fetchEditPost = async () => {
          try {
            const token = localStorage.getItem('blog_token');
            // Since we need to get drafts too, we send authorization
            const slug = existingPost.slug;
            const res = await fetch(`http://localhost:5000/api/posts/${slug}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
              const fullPost = result.data;
              setTitle(fullPost.title);
              setContent(fullPost.content);
              setExcerpt(fullPost.excerpt || '');
              setCoverImage(fullPost.cover_image || '');
              setTagsInput(fullPost.tags ? fullPost.tags.join(', ') : '');
              setIsPublished(fullPost.is_published);
            }
          } catch (err) {
            console.error('Error fetching post details for editing:', err);
          }
        };

        fetchEditPost();
      } else {
        // Fallback: if not in myPosts, redirect home
        navigate('/');
      }
    }
  }, [id, isEditMode, myPosts, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Parse comma-separated tags
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');

    const postData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || null,
      cover_image: coverImage.trim() || null,
      tags,
      is_published: isPublished
    };

    if (isEditMode) {
      dispatch(updateExistingPost({ id: parseInt(id), postData }))
        .unwrap()
        .then(() => {
          navigate('/');
        });
    } else {
      dispatch(createNewPost(postData))
        .unwrap()
        .then(() => {
          navigate('/');
        });
    }
  };

  return (
    <div className="composer-container animate-slide-up">
      <button onClick={() => navigate(-1)} className="btn btn-secondary back-btn">
        <ArrowLeft size={16} /> Cancel and Go Back
      </button>

      <div className="composer-card glass-panel">
        <header className="composer-header">
          <h2>{isEditMode ? 'Edit Your Story' : 'Write a New Story'}</h2>
          <p>Express your ideas, add styling, and publish draft or live articles.</p>
        </header>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="composer-form">
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              <Type size={16} /> Story Title
            </label>
            <input 
              type="text" 
              id="title"
              placeholder="Enter a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input title-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="coverImage">
              <Image size={16} /> Cover Image URL
            </label>
            <input 
              type="url" 
              id="coverImage"
              placeholder="https://images.unsplash.com/photo-..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="excerpt">
              <FileText size={16} /> Article Excerpt
            </label>
            <input 
              type="text" 
              id="excerpt"
              placeholder="Brief summary of the article (visible on grids)..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tags">
              <Tag size={16} /> Tags (comma-separated)
            </label>
            <input 
              type="text" 
              id="tags"
              placeholder="coding, react, tech, tutorial"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="content">Story Content</label>
            <textarea 
              id="content"
              placeholder="Tell your story... supports line breaks and detailed content formatting"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="form-input composer-textarea"
            />
          </div>

          <div className="publish-toggle-container glass-panel">
            <div className="publish-toggle-details">
              <span className="toggle-title">Publish immediately</span>
              <p className="toggle-sub">If disabled, this post will be saved as a Draft only visible to you.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="btn btn-primary composer-submit-btn"
          >
            <Save size={18} />
            {status === 'loading' ? 'Saving Story...' : isEditMode ? 'Update Story' : 'Save Story'}
          </button>
        </form>
      </div>
    </div>
  );
}
