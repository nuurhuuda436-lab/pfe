import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiClock, FiArrowLeft, FiSend, FiEdit, FiTrash2, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import api from '../api';
import './OffreDetail.css';

function OffreDetail({ user }) {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Formulaire de candidature
  const [showCandidatureForm, setShowCandidatureForm] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    fetchOffre();
    if (user?.role === 'artisan') {
      checkIfApplied();
    }
  }, [id]);

  const fetchOffre = async () => {
    try {
      const res = await api.get(`/offres/${id}`);
      setOffre(res.data);
    } catch (err) {
      navigate('/offres');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await api.get('/candidatures');
      const alreadyApplied = res.data.some(
        (c) => c.offre_id === parseInt(id)
      );
      setApplied(alreadyApplied);
    } catch (err) {
      // Ignore
    }
  };

  const handleApply = async () => {
    // Vérifier que les champs sont remplis
    if (!motivation.trim()) {
      setError(t('job_detail.val_motivation_error'));
      return;
    }
    if (!experience || parseInt(experience) < 0) {
      setError(t('job_detail.val_experience_error'));
      return;
    }

    setApplying(true);
    setError('');
    try {
      await api.post('/candidatures', {
        offre_id: parseInt(id),
        motivation: motivation,
        experience: parseInt(experience),
      });
      setApplied(true);
      setShowCandidatureForm(false);
      setMessage(t('job_detail.apply_success'));
    } catch (err) {
      setError(err.response?.data?.message || t('job_detail.apply_error'));
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('job_detail.delete_confirm'))) return;
    try {
      await api.delete(`/offres/${id}`);
      navigate('/offres');
    } catch (err) {
      setError(t('job_detail.delete_error'));
    }
  };

  const handleComplete = async () => {
    if (!window.confirm(t('job_detail.complete_confirm'))) return;
    try {
      await api.put(`/offres/${id}/complete`);
      setOffre({ ...offre, status: 'completed' });
      setMessage(t('job_detail.complete_success'));
    } catch (err) {
      setError(t('job_detail.complete_error'));
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

  const translateTemps = (tempsVal) => {
    if (!tempsVal) return '';
    const key = tempsVal.toLowerCase().replace(' ', '');
    if (key === 'pleintemps') return t('jobs.filter_fulltime');
    if (key === 'tempspartiel') return t('jobs.filter_parttime');
    if (key === 'flexible') return t('jobs.filter_flexible');
    return tempsVal;
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

  if (!offre) return null;

  const userRole = user?.role?.toString().toLowerCase();
  const isAdmin = userRole === 'admin';
  const isOwner = user && offre.user_id === user.id;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="offre-detail animate-in">
          <Link to="/offres" className="back-link">
            <FiArrowLeft /> {t('job_detail.back')}
          </Link>

          <div className="offre-detail-card">
            {message && <div className="alert alert-success"><FiCheckCircle /> {message}</div>}
            {error && <div className="alert alert-error"> {error}</div>}

            <h1>{offre.titre || offre.domaine} {offre.status === 'completed' && <span className="badge badge-success" style={{ marginLeft: '10px', fontSize: '14px', verticalAlign: 'middle', background: 'var(--color-success)', color: 'white' }}>{t('job_detail.status_completed')}</span>}</h1>

            <div className="detail-meta" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span className="badge badge-primary"><FiMapPin /> {offre.ville || offre.adresse}</span>
              {offre.type_contrat && <span className="badge badge-secondary" style={{ padding: '6px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{offre.type_contrat}</span>}
              {offre.temps && <span className="badge badge-secondary" style={{ padding: '6px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{translateTemps(offre.temps)}</span>}
              {(offre.prix || offre.salaire) && <span className="badge badge-secondary" style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)' }}><FiDollarSign /> {offre.prix || offre.salaire} DH</span>}
              <span className="badge badge-secondary" style={{ padding: '6px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}><FiClock /> {formatDate(offre.created_at)}</span>
            </div>

            <div className="detail-description">
              {offre.description}
            </div>

            <div className="detail-actions">
              {user?.role === 'artisan' && !isOwner && offre.status !== 'completed' && (
                applied ? (
                  <button className="btn btn-secondary" disabled>
                    <FiCheckCircle /> {t('job_detail.already_applied')}
                  </button>
                ) : !showCandidatureForm ? (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowCandidatureForm(true)}
                  >
                    <FiSend /> {t('job_detail.apply_btn')}
                  </button>
                ) : null
              )}

              {isOwner && (
                <>
                  <Link to={`/offres/${id}/edit`} className="btn btn-secondary">
                    <FiEdit /> {t('job_detail.edit_btn')}
                  </Link>
                  {offre.status !== 'completed' && (
                    <button className="btn btn-success" onClick={handleComplete} style={{ background: 'var(--color-success)', color: 'white', border: 'none' }}>
                      <FiCheckCircle /> {t('job_detail.mark_completed_btn')}
                    </button>
                  )}
                </>
              )}

              {canDelete && (
                <button className="btn btn-danger" onClick={handleDelete}>
                  <FiTrash2 /> {t('job_detail.delete_btn')}
                </button>
              )}
            </div>

            {/* ====== Formulaire de candidature ====== */}
            {showCandidatureForm && !applied && (
              <div className="candidature-form-section">
                <h3>{t('job_detail.motivation_title')}</h3>

                <div className="form-group">
                  <label className="form-label" htmlFor="candidature-motivation">
                    {t('job_detail.motivation_label')}
                  </label>
                  <textarea
                    id="candidature-motivation"
                    className="form-textarea"
                    placeholder={t('job_detail.motivation_placeholder')}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    required
                    rows={5}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="candidature-experience">
                    {t('job_detail.experience_label')}
                  </label>
                  <input
                    id="candidature-experience"
                    className="form-input"
                    type="number"
                    placeholder={t('job_detail.experience_placeholder')}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    min={0}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleApply}
                    disabled={applying}
                  >
                    {applying ? t('job_detail.sending') : <><FiSend /> {t('job_detail.send_application')}</>}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowCandidatureForm(false)}
                  >
                    {t('job_detail.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OffreDetail;
