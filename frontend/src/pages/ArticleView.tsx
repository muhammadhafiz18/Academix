import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticle } from '../services/api';
import { Article } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ArticleView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const loadArticle = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const articleData = await getArticle(slug);
        setArticle(articleData);
      } catch (err: any) {
        setError('Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="App">
        <Navbar />
        <div className="loading">
          <div>📖 Loading article...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="App">
        <Navbar />
        <div className="page-container">
          <div className="page-content">
            <div className="error-state">
              <h2>❌ Article Not Found</h2>
              <p>The article you're looking for doesn't exist or has been removed.</p>
              <Link to="/" className="btn btn-primary">
                🏠 Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      
      <div className="article-page">
        {/* Article Header */}
        <div className="article-header-section">
          <div className="article-header-container">
            <div className="article-breadcrumb">
              <Link to="/" className="breadcrumb-link">🏠 Home</Link>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">Article</span>
            </div>
            
            <h1 className="article-main-title">{article.Title}</h1>
            
            <div className="article-meta-section">
              <div className="article-author-info">
                <div className="author-avatar">
                  <span className="author-initials">
                    {article.Author.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="author-details">
                  <div className="author-name">{article.Author}</div>
                  <div className="article-date">
                    📅 {formatDate(article.PublishedAt)} • ⏱️ {getReadingTime(article.Content)}
                  </div>
                </div>
              </div>
              
              <div className="article-actions">
                <button className="action-btn" title="Share">
                  📤
                </button>
                <button className="action-btn" title="Bookmark">
                  🔖
                </button>
                <button className="action-btn" title="Like">
                  ❤️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="article-content-section">
          <div className="article-content-container">
            <div className="article-body">
              <div className="article-text">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({node, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !className?.includes('language-');
                      
                      if (!isInline && match) {
                        const language = match[1];
                        const languageDisplayName = {
                          'js': 'JavaScript',
                          'javascript': 'JavaScript',
                          'ts': 'TypeScript',
                          'typescript': 'TypeScript',
                          'jsx': 'React JSX',
                          'tsx': 'React TSX',
                          'python': 'Python',
                          'py': 'Python',
                          'java': 'Java',
                          'csharp': 'C#',
                          'cs': 'C#',
                          'cpp': 'C++',
                          'c': 'C',
                          'php': 'PHP',
                          'ruby': 'Ruby',
                          'go': 'Go',
                          'rust': 'Rust',
                          'swift': 'Swift',
                          'kotlin': 'Kotlin',
                          'dart': 'Dart',
                          'html': 'HTML',
                          'css': 'CSS',
                          'scss': 'SCSS',
                          'sass': 'Sass',
                          'json': 'JSON',
                          'xml': 'XML',
                          'yaml': 'YAML',
                          'yml': 'YAML',
                          'sql': 'SQL',
                          'bash': 'Bash',
                          'sh': 'Shell',
                          'powershell': 'PowerShell',
                          'dockerfile': 'Docker',
                          'makefile': 'Makefile',
                          'markdown': 'Markdown',
                          'md': 'Markdown'
                        }[language.toLowerCase()] || language.toUpperCase();
                        
                        return (
                          <pre data-language={languageDisplayName}>
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      }
                      
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    img({node, alt, ...props}) {
                      return (
                        <img
                          {...props}
                          alt={alt || 'Article image'}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            margin: '16px 0',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                          loading="lazy"
                        />
                      );
                    },
                    blockquote({node, children, ...props}) {
                      return (
                        <blockquote
                          style={{
                            borderLeft: '4px solid #007acc',
                            paddingLeft: '16px',
                            margin: '16px 0',
                            fontStyle: 'italic',
                            color: '#666'
                          }}
                          {...props}
                        >
                          {children}
                        </blockquote>
                      );
                    }
                  }}
                >
                  {article.Content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default ArticleView;