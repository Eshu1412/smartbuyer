import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiArrowRight, FiShield, FiAlertCircle, FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi';
import './AdminDashboard.css';

export default function AdminLogin({ onLoginSuccess, theme = 'light', onToggleTheme, onNavigateHome }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed. Please check credentials.');
      }

      // Save token and user details to localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container" data-theme={theme}>
      {/* Top right theme toggle */}
      {onToggleTheme && (
        <div className="admin-login-theme-toggle">
          <button 
            className="admin-theme-toggle-btn" 
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <FiMoon className="admin-theme-icon" style={{ color: '#6366f1' }} />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <FiSun className="admin-theme-icon" style={{ color: '#f59e0b' }} />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
      )}

      <motion.div
        className="admin-login-box"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-brand-header">
          <div className="admin-logo-sq">SQ</div>
          <div className="admin-brand-title">
            Smart<span>Quote</span>Hub
          </div>
        </div>

        <div className="admin-login-badge">
          Admin Portal Access
        </div>
        
        <p className="admin-login-subtitle">
          Secure sign-in for platform managers and quote specialists.
        </p>

        {error && (
          <div className="admin-error-banner">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Username</label>
            <div className="admin-input-wrapper">
              <FiUser className="admin-input-icon" />
              <input
                type="text"
                className="admin-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Password</label>
            <div className="admin-input-wrapper">
              <FiLock className="admin-input-icon" />
              <input
                type="password"
                className="admin-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Dashboard <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {onNavigateHome && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              className="admin-btn-secondary"
              style={{ border: 'none', background: 'transparent', color: 'var(--md-on-surface-variant)', fontSize: '0.85rem' }}
              onClick={onNavigateHome}
            >
              <FiArrowLeft /> Return to Consumer Site
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
