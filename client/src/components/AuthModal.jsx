import React, { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../js/api';

/**
 * AuthModal
 * A glassmorphism login / register modal.
 *
 * Props:
 *  isOpen       {boolean}  – controls visibility
 *  onClose      {fn}       – called when modal should close
 *  onAuthSuccess{fn(user)} – called with user object after success
 *  defaultTab   {'login'|'register'} – which tab to open first
 */
export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setForm({ name: '', email: '', password: '' });
      setError('');
    }
  }, [isOpen, defaultTab]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let user;
      if (tab === 'login') {
        user = await loginUser(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required.'); setLoading(false); return; }
        user = await registerUser(form.name, form.email, form.password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={tab === 'login' ? 'Login' : 'Create Account'}
    >
      <div className="auth-modal">
        {/* Close Button */}
        <button className="auth-modal-close icon-btn" onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark" />
        </button>

        {/* Logo */}
        <div className="auth-modal-logo">
          <span className="logo-dot" />AURA
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Login
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {tab === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <div className="auth-input-wrap">
                <i className="fa-solid fa-user auth-input-icon" />
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <div className="auth-input-wrap">
              <i className="fa-solid fa-envelope auth-input-icon" />
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrap">
              <i className="fa-solid fa-lock auth-input-icon" />
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                placeholder={tab === 'register' ? 'Min. 6 characters' : '••••••••'}
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit"
            disabled={loading}
            id={tab === 'login' ? 'auth-login-btn' : 'auth-register-btn'}
          >
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> {tab === 'login' ? 'Signing In…' : 'Creating Account…'}</>
            ) : (
              tab === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>

          <p className="auth-switch">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
            >
              {tab === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
