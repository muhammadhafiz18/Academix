import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { publishArticle } from '../services/api';
import MDEditor from '@uiw/react-md-editor';

interface PublishArticleProps {
  onArticlePublished?: () => void;
}

const PublishArticle: React.FC<PublishArticleProps> = ({ onArticlePublished }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(() => {
    // Auto-fill author from user profile
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.trim();
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name.trim()} ${user.user_metadata.last_name.trim()}`.trim();
    }
    return '';
  });
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      await publishArticle({
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
        contentType: 'markdown', // Always use markdown (supports plain text too)
        images: images.length > 0 ? images : undefined,
      });

      setSuccess(true);
      setTitle('');
      setAuthor('');
      setContent('');
      setImages([]);
      onArticlePublished?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish article');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select only image files');
      return;
    }
    
    setImages([file]); // Only one entry image
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="auth-required">
        <p>Please sign in to publish articles.</p>
      </div>
    );
  }

  return (
    <div className="publish-article">
      {error && <div className="message error">❌ {error}</div>}
      {success && <div className="message success">🎉 Article published successfully! Your knowledge is now live on EduPress!</div>}

      <form onSubmit={handleSubmit} className="publish-form">
        <div className="form-group">
          <label htmlFor="title">📝 Article Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What's your article about?"
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">👤 Author Name *</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            placeholder="Your name"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">🖼️ Entry Image</label>
          <div className="file-input-wrapper">
            <input
              id="images"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input-hidden"
            />
            <label htmlFor="images" className="file-input-button">
              📁 Choose Image
            </label>
          </div>
          
          {images.length > 0 && (
            <div className="image-preview-container">
              <div className="image-preview-item">
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(images[0])}
                    alt="Entry preview"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(0)}
                    title="Remove image"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">✍️ Article Content *</label>
          <div className="markdown-editor-container">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
              data-color-mode={isDark ? "dark" : "light"}
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                color: isDark ? '#f1f5f9' : '#000000'
              }}
              textareaProps={{
                placeholder: 'Write your article content here...',
                style: { 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  minHeight: '400px',
                  color: isDark ? '#f1f5f9 !important' : '#000000 !important',
                  backgroundColor: isDark ? '#1e293b !important' : '#ffffff !important',
                  background: isDark ? '#1e293b !important' : '#ffffff !important',
                  WebkitTextFillColor: isDark ? '#f1f5f9 !important' : '#000000 !important'
                }
              }}
            />
            <small className="char-count">{content.length}/50,000 characters</small>
          </div>
        </div>

        <button type="submit" disabled={loading || !title || !author || !content} className="btn btn-primary">
          {loading ? '🚀 Publishing...' : '✨ Publish Article'}
        </button>
      </form>
    </div>
  );
};

export default PublishArticle;
