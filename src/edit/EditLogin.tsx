import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

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
    <div className="edit-login-wrapper">
      <form className="edit-login-card" onSubmit={handleSubmit}>
        <div className="edit-login-header">
          <div className="edit-login-icon"><Lock size={28} /></div>
          <h1>Edit Console</h1>
          <p>Sign in to manage your website content</p>
        </div>

        {error && (
          <div className="edit-login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="edit-login-field">
          <label htmlFor="username">
            <User size={16} />
            <span>Username</span>
          </label>
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
          <label htmlFor="password">
            <Lock size={16} />
            <span>Password</span>
          </label>
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
              <LogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
