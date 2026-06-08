import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiSend } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { getApiErrorMessage } from '../utils/apiErrors';
import './Auth.css';

function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/forgot-password', { email });
      setMessage(res.data.message || t('forgot_password.reset_success'));
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          t('forgot_password.reset_error')
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-split">
      <div className="auth-card-split animate-in">
        
        {/* Left Side: Form */}
        <div className="auth-form-side">
          <h1 className="auth-title-dark">{t('forgot_password.title')}</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {t('forgot_password.subtitle')}
          </p>

          {error && <div className="alert alert-error"> {error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="auth-form-clean">
            <div className="form-group-clean">
              <input
                id="forgot-email"
                className="form-input-clean"
                type="email"
                name="email"
                placeholder={t('forgot_password.email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-teal btn-block"
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? t('forgot_password.sending') : t('forgot_password.send_btn')}
            </button>
          </form>

          <div className="auth-divider" style={{ marginTop: '30px' }}>
            <span>{t('forgot_password.or')}</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" className="forgot-link">{t('forgot_password.back_login')}</Link>
          </div>
        </div>

        {/* Right Side: Image/Gif */}
        <div className="auth-image-side">
          <div className="auth-image-overlay">
            <h2>Reset<br/>Password</h2>
            <p>Get back to your account securely.</p>
            <Link to="/register" className="btn btn-outline-white">{t('nav.register')} →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
