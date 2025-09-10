import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './ConfirmationModal';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  // Safe theme access with fallback
  let isDark = false;
  let toggleTheme = () => {};
  
  try {
    const themeContext = useTheme();
    isDark = themeContext.isDark;
    toggleTheme = themeContext.toggleTheme;
  } catch {
    // Theme context not available, use defaults
  }

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    setShowSignOutModal(false);
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    
    const fullName = user.user_metadata?.full_name;
    const firstName = user.user_metadata?.first_name;
    
    if (fullName) return fullName;
    if (firstName) return firstName;
    return user.email?.split('@')[0] || '';
  };

  const getUserInitials = () => {
    if (!user) return '?';
    
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return user.email?.[0].toUpperCase() || '?';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <span className="brand-emoji">🎓</span>
            <div className="brand-text">
              <span className="brand-name">EduPress</span>
              <span className="brand-tagline">Knowledge Hub</span>
            </div>
          </div>
        </Link>

        <div className="navbar-left">
          {user && (
            <div className="nav-links">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Home</span>
              </Link>
              <Link 
                to="/publish" 
                className={`nav-link ${isActive('/publish') ? 'active' : ''}`}
              >
                <span className="nav-icon">✍️</span>
                <span className="nav-text">Write</span>
              </Link>
            </div>
          )}
        </div>

        <div className="navbar-right">
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            <span className="theme-icon">
              {isDark ? '☀️' : '🌙'}
            </span>
          </button>

          {user ? (
            <div className="user-menu">
              <button 
                className="user-avatar"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="avatar-text">
                  {getUserInitials()}
                </span>
              </button>
              
              {isMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="user-email">{getUserDisplayName()}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={handleSignOut}
                    className="dropdown-item logout"
                  >
                    <span>👋</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <span className="welcome-text">Welcome to EduPress</span>
            </div>
          )}

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {user && (
            <>
              <Link 
                to="/" 
                className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">🏠</span>
                Home
              </Link>
              <Link 
                to="/publish" 
                className={`mobile-nav-link ${isActive('/publish') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">✍️</span>
                Write Article
              </Link>
              <div className="mobile-divider"></div>
              <button 
                onClick={handleSignOut}
                className="mobile-nav-link logout"
              >
                <span className="nav-icon">👋</span>
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
      
      <ConfirmationModal
        isOpen={showSignOutModal}
        onClose={cancelSignOut}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </nav>
  );
};

export default Navbar;
