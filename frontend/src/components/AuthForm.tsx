import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = mode === 'login' 
        ? await signIn(email, password)
        : await signUp(email, password, firstName, lastName);

      if (error) {
        setError(error.message);
      } else if (mode === 'register') {
        setError('Check your email for verification link');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{mode === 'login' ? '🔐 Welcome Back' : '🚀 Join EduPress'}</h2>
        
        {error && (
          <div className={`message ${mode === 'register' && error.includes('email') ? 'success' : 'error'}`}>
            {mode === 'register' && error.includes('email') ? '📧 ' : '❌ '}{error}
          </div>
        )}

        {mode === 'register' && (
          <>
            <div className="form-group">
              <label htmlFor="firstName">👤 First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={mode === 'register'}
                placeholder="Your first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">👥 Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required={mode === 'register'}
                placeholder="Your last name"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">📧 Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your.email@university.edu"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">🔒 Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter a secure password"
            minLength={6}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? '⏳ Processing...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
        </button>

        <p className="toggle-mode">
          {mode === 'login' ? "New to EduPress? " : "Already part of the community? "}
          <button type="button" onClick={onToggleMode} className="btn btn-link">
            {mode === 'login' ? '✨ Create Account' : '🔐 Sign In'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
