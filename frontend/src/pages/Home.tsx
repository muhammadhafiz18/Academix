import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ArticlesList from '../components/ArticlesList';
import AuthForm from '../components/AuthForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleToggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    const fullName = user.user_metadata?.full_name;
    const firstName = user.user_metadata?.first_name;
    
    if (fullName) return fullName;
    if (firstName) return firstName;
    return user.email?.split('@')[0] || 'there';
  };

  if (loading) {
    return (
      <div className="App">
        <Navbar />
        <div className="loading">
          <div>🚀 Loading EduPress...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      
      {user ? (
        // Dashboard for authenticated users
        <main className="dashboard">
          <div className="dashboard-container">
            <div className="dashboard-header">
              <div>
                <h1 className="dashboard-title">Hello, {getUserDisplayName()}! 👋</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                  Ready to share your knowledge with the world?
                </p>
              </div>
            </div>

            <div className="articles-section">
              <ArticlesList />
            </div>
          </div>
        </main>
      ) : (
        // Hero section for non-authenticated users
        <>
          <section className="hero">
            <div className="hero-content">
              <h1 className="hero-title">EduPress</h1>
              <p className="hero-subtitle">
                Where university students share knowledge
              </p>
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'rgba(255, 255, 255, 0.8)', 
                marginBottom: '3rem',
                maxWidth: '600px',
                margin: '0 auto 3rem'
              }}>
                Join thousands of students worldwide sharing their research, insights, 
                and academic discoveries. Publish your articles and connect with brilliant minds.
              </p>
              <div className="hero-cta">
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-2xl)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  maxWidth: '450px',
                  width: '100%'
                }}>
                  <AuthForm mode={authMode} onToggleMode={handleToggleAuthMode} />
                </div>
              </div>
            </div>
          </section>

        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Home;