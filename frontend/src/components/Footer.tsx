import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-simple">
          <div className="footer-brand-simple">
            <span className="footer-logo">🎓</span>
            <span className="footer-title-simple">EduPress</span>
            <span className="footer-subtitle-simple">Where university students share knowledge</span>
          </div>
          <p className="footer-copyright-simple">
            © 2025 EduPress. Made with ❤️ for students worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;