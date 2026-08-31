import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import BrandLogo from '../components/BrandLogo';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

export default function EditLogin() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <div className="edit-login-page">
      <form className="edit-login-card" onSubmit={handleSubmit}>
        <div className="edit-login-mark">
          <BrandLogo size="md" color="#151415" />
        </div>

        <div className="edit-login-eyebrow">Sign in</div>
        <h1 className="edit-login-title">Edit <em>Console</em></h1>
        <p className="edit-login-subtitle">
          Sign in to manage the website content — categories, images, navigation labels and more.
        </p>

        {error && (
          <div className="edit-login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="edit-login-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            required
          />
        </div>

        <div className="edit-login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="edit-login-btn" disabled={loading}>
          {loading ? (
            <span className="edit-spinner" />
          ) : (
            <>
              <LogIn size={16} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
