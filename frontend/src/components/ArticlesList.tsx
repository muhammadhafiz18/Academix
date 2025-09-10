import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../services/api';
import { ArticleMetadata } from '../types';

interface ArticlesListProps {}

const ArticlesList: React.FC<ArticlesListProps> = () => {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const articlesData = await getArticles();
      // Sort by newest first
      const sortedArticles = articlesData.sort(
        (a, b) => new Date(b.PublishedAt).getTime() - new Date(a.PublishedAt).getTime()
      );
      setArticles(sortedArticles);
    } catch (err: any) {
      setError('Failed to load articles');
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={loadArticles} className="btn btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="no-articles">
        <h3>🌟 Be the Pioneer!</h3>
        <p>No articles have been published yet. Share your knowledge and be the first to contribute to our academic community!</p>
      </div>
    );
  }

  return (
    <div className="articles-list">
      <div className="articles-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 className="articles-title">📚 Published Articles</h2>
            <p className="articles-subtitle">{articles.length} {articles.length === 1 ? 'article' : 'articles'} published by our community</p>
          </div>
          <div className="articles-actions">
            <Link to="/publish" className="btn btn-primary">
              ✍️ Write Article
            </Link>
          </div>
        </div>
      </div>
      
      <div className="articles-grid">
        {articles.map((article) => (
          <article key={article.Id} className="article-card card">
            <h3 className="article-title">{article.Title}</h3>
            <div className="article-meta">
              <span className="author">✍️ {article.Author}</span>
              <span className="date">📅 {formatDate(article.PublishedAt)}</span>
            </div>
            <div className="article-actions">
              <Link 
                to={`/article/${article.Slug}`} 
                className="btn btn-outline"
                onClick={() => window.scrollTo(0, 0)}
              >
                📖 Read Full Article
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ArticlesList;
