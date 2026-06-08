import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiSend, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../api';

export default function ContactAdminModal({ isOpen, onClose, user }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: user?.nom || '',
    email: user?.email || '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/contact-admin', formData);
      setStatus({ type: 'success', message: t('contact_admin.success') });
      setTimeout(() => {
        onClose();
        setFormData(prev => ({ ...prev, message: '' }));
        setStatus({ type: '', message: '' });
      }, 2500);
    } catch (err) {
      console.error('Erreur contact admin:', err);
      setStatus({ type: 'error', message: t('contact_admin.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-in" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('contact_admin.modal_title')}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>
            <FiX />
          </button>
        </div>
        
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          {t('contact_admin.modal_subtitle')}
        </p>

        {status.message && (
          <div className={`alert alert-${status.type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            {status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('contact_admin.name_label')}</label>
            <input 
              type="text" 
              className="form-input" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder={t('contact_admin.name_placeholder')}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('contact_admin.email_label')}</label>
            <input 
              type="email" 
              className="form-input" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder={t('contact_admin.email_placeholder')}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('contact_admin.message_label')}</label>
            <textarea 
              className="form-textarea" 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              placeholder={t('contact_admin.message_placeholder')}
              rows={5}
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              {t('contact_admin.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !formData.message.trim()}>
              {loading ? t('contact_admin.sending') : <><FiSend /> {t('contact_admin.send_btn')}</>}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: var(--color-bg);
          padding: 30px;
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
