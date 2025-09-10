import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PublishArticle from '../components/PublishArticle';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Publish: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleArticlePublished = () => {
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="App">
        <Navbar />
        <div className="loading">🚀 Loading EduPress...</div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <Navbar />
        <div className="page-container">
          <div className="page-content">
            <div className="auth-required">
              <h2>🔐 Authentication Required</h2>
              <p>Please <Link to="/">sign in</Link> to start publishing your articles and sharing your knowledge with the world.</p>
              <div style={{ marginTop: '2rem' }}>
                <Link to="/" className="btn btn-primary">
                  🚀 Sign In Now
                </Link>
              </div>
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
      
      <div className="page-container">
        <div className="page-content">
          <div className="publish-section">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 className="publish-title">✍️ Share Your Knowledge</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                Share your research, insights, and academic discoveries with the global student community.
              </p>
            </div>
            <PublishArticle onArticlePublished={handleArticlePublished} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Publish;