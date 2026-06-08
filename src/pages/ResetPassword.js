import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import api from '../api';
import { getApiErrorMessage } from '../utils/apiErrors';
import './Auth.css';

function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [form, setForm] = useState({
    password: '',
    password_confirmation: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError(t('reset_password.invalid_link'));
    }
  }, [token, email, t]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.password !== form.password_confirmation) {
      setError(t('reset_password.mismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/reset-password', {
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation
      });
      setMessage(res.data.message || t('reset_password.success'));
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          t('reset_password.error')
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
          <h1 className="auth-title-dark">{t('reset_password.title')}</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {t('reset_password.subtitle')}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success"> {message}</div>}

          {!message && token && email && (
            <form onSubmit={handleSubmit} className="auth-form-clean">
              <div className="form-group-clean">
                <input
                  id="reset-password"
                  className="form-input-clean"
                  type="password"
                  name="password"
                  placeholder={t('reset_password.password_placeholder')}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-clean">
                <input
                  id="reset-password-confirm"
                  className="form-input-clean"
                  type="password"
                  name="password_confirmation"
                  placeholder={t('reset_password.confirm_placeholder')}
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-teal btn-block"
                disabled={loading}
                style={{ marginTop: '20px' }}
              >
                {loading ? t('reset_password.resetting') : t('reset_password.reset_btn')}
              </button>
            </form>
          )}

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
            <h2>Secure your<br/>account</h2>
            <p>Update your password to continue.</p>
            <Link to="/login" className="btn btn-outline-white">{t('nav.login')} →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;
