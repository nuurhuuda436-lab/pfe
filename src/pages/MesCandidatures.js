import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiClock, FiExternalLink, FiFileText, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import api from '../api';
import './MesCandidatures.css';

function MesCandidatures({ user }) {
  const { t, i18n } = useTranslation();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const fetchCandidatures = async () => {
    try {
      const res = await api.get('/candidatures');
      setCandidatures(res.data);
    } catch (err) {
      console.error('Erreur chargement candidatures', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const localeMap = { ar: 'ar-EG', en: 'en-US', fr: 'fr-FR' };
    const locale = localeMap[i18n.language] || 'fr-FR';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-in">
          <div>
            <h1>{t('my_applications.title')}</h1>
            <p>
              {candidatures.length === 1
                ? t('my_applications.count_one')
                : t('my_applications.count_many', { count: candidatures.length })}
            </p>
          </div>
        </div>

        {candidatures.length === 0 ? (
          <div className="empty-state animate-in">
            <div className="empty-icon"><FiFileText /></div>
            <h3>{t('my_applications.empty_title')}</h3>
            <p>{t('my_applications.empty_desc')}</p>
            <Link to="/offres" className="btn btn-primary">
              {t('my_applications.view_jobs')}
            </Link>
          </div>
        ) : (
          <div className="candidatures-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {candidatures.map((candidature, index) => {
              const isAccepted = candidature.status === 'acceptee';
              const isRejected = candidature.status === 'refusee';
              
              const statusKey = isAccepted ? 'my_applications.status_accepted' : 
                                isRejected ? 'my_applications.status_rejected' : 'my_applications.status_sent';
                                
              const badgeClass = isAccepted ? 'badge-success' : 
                                 isRejected ? 'badge-danger' : 'badge-primary';

              return (
                <div
                  key={candidature.id}
                  className={`candidature-card animate-in animate-in-delay-${Math.min(index, 4)}`}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '15px', 
                    border: isAccepted ? '2px solid var(--color-success)' : undefined 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div className="candidature-info">
                      <h3>{candidature.offre?.titre || t('my_applications.deleted_offer')}</h3>
                      <p>
                        {candidature.offre && (
                          <>
                            <FiMapPin style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            {candidature.offre.ville}
                          </>
                        )}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span className={`badge ${badgeClass}`}>{t(statusKey)}</span>
                      <span className="candidature-date">
                        <FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {formatDate(candidature.created_at)}
                      </span>
                      {candidature.offre && (
                        <Link
                          to={`/offres/${candidature.offre.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          <FiExternalLink /> {t('my_applications.view_offer')}
                        </Link>
                      )}
                    </div>
                  </div>

                  {isAccepted && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '15px', 
                      background: 'var(--color-bg-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      borderLeft: '4px solid var(--color-success)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 'bold' }}>
                        <FiCheckCircle size={20} />
                        {t('my_applications.accepted_notice')}
                      </div>
                      <div>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate('/messages')}
                        >
                          <FiMessageSquare /> {t('my_applications.contact_recruiter')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MesCandidatures;
