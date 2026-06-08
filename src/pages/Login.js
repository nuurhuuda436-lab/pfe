import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import api from '../api';
import { getApiErrorMessage } from '../utils/apiErrors';
import './Auth.css';

function Login({ onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', {
        email: form.email.trim(),
        password: form.password,
      });
      onLogin(res.data.user, res.data.token);
      // Redirect based on role (case-insensitive)
      const role = res.data.user?.role ? res.data.user.role.toString().toLowerCase() : null;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'recruteur') {
        navigate('/candidatures-recues');
      } else {
        navigate('/offres');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t('login.error_message')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <h1>{t('login.title')}</h1>
        <p className="auth-subtitle">
          {t('login.subtitle')}
        </p>

        {error && <div className="alert alert-error"> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <FiMail style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {t('login.email_label')}
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              name="email"
              placeholder={t('login.email_placeholder')}
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <FiLock style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {t('login.password_label')}
            </label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? t('login.logging_in') : <><FiLogIn /> {t('login.login_button')}</>}
          </button>
        </form>

        <div className="auth-footer">
          {t('login.no_account')}{' '}
          <Link to="/register">{t('login.create_account')}</Link>
          <div style={{ marginTop: '10px' }}>
            <Link to="/forgot-password" className="forgot-link">{t('login.forgot_password')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;