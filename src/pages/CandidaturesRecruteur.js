import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { FiMail, FiUser, FiCheck, FiX, FiImage, FiEye, FiPhone, FiCalendar, FiStar, FiSend, FiEdit } from 'react-icons/fi';
import SafeImage from '../components/ui/SafeImage';
import './CandidaturesRecruteur.css';

const STORAGE_BASE = 'http://localhost:8000/storage';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={star <= (hovered || value) ? 'star-filled' : 'star-empty'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = '18px' }) {
  return (
    <span className="star-display" style={{ fontSize: size }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

function ratingLabel(rating, t) {
  if (rating === 5) return t('recruiter_apps.excellent');
  if (rating === 4) return t('recruiter_apps.very_good');
  if (rating === 3) return t('recruiter_apps.good');
  if (rating === 2) return t('recruiter_apps.fair');
  return t('recruiter_apps.poor');
}

export default function CandidaturesRecruteur() {
  const { t } = useTranslation();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffre, setSelectedOffre] = useState('all');
  const [reviewFormId, setReviewFormId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/candidatures-recues');
        if (mounted) setCandidatures(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (selectedOffre === 'all') return candidatures;
    return candidatures.filter(c => c.offre_id === parseInt(selectedOffre, 10));
  }, [candidatures, selectedOffre]);

  const stats = useMemo(() => ({
    total: filtered.length,
    en_attente: filtered.filter(c => !c.status || c.status === 'en_attente').length,
    acceptee: filtered.filter(c => c.status === 'acceptee').length,
    refusee: filtered.filter(c => c.status === 'refusee').length,
  }), [filtered]);

  const uniqueOffres = useMemo(() => {
    const map = new Map();
    candidatures.forEach(c => {
      if (c.offre?.id) map.set(c.offre.id, c.offre);
    });
    return Array.from(map.values());
  }, [candidatures]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/candidatures/${id}/status`, { status });
      setCandidatures(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
    } catch (err) {
      console.error('Erreur update status candidature:', err);
      alert(t('recruiter_apps.update_error'));
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'acceptee') return t('recruiter_apps.status_accepted');
    if (status === 'refusee') return t('recruiter_apps.status_skipped');
    return t('recruiter_apps.stat_pending');
  };

  const getStatusClass = (status) => {
    if (status === 'acceptee') return 'badge-success';
    if (status === 'refusee') return 'badge-danger';
    return 'badge-warning';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const closeReviewForm = () => {
    setReviewFormId(null);
    setEditingReviewId(null);
    setReviewError('');
    setRating(5);
    setComment('');
  };

  const openReviewForm = (candidatureId) => {
    setReviewFormId(candidatureId);
    setEditingReviewId(null);
    setRating(5);
    setComment('');
    setReviewError('');
  };

  const openEditReviewForm = (candidature) => {
    setReviewFormId(candidature.id);
    setEditingReviewId(candidature.review.id);
    setRating(candidature.review.rating);
    setComment(candidature.review.comment || '');
    setReviewError('');
  };

  const submitReview = async (candidature) => {
    if (!rating) return;
    setReviewError('');
    setSubmittingReview(true);
    try {
      const res = editingReviewId
        ? await api.put(`/reviews/${editingReviewId}`, { rating, comment })
        : await api.post('/reviews', {
            offre_id: candidature.offre_id,
            artisan_id: candidature.user_id,
            rating,
            comment,
          });
      setCandidatures((prev) =>
        prev.map((c) => (c.id === candidature.id ? { ...c, review: res.data } : c))
      );
      closeReviewForm();
    } catch (err) {
      setReviewError(err.response?.data?.message || t('recruiter_apps.review_error'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loader-wrapper"><div className="loader" /></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper recruiter-dashboard">
      <div className="container">
        <div className="recruiter-layout">
          <div className="recruiter-content">
            <div className="page-header">
              <h1>{t('recruiter_apps.title')}</h1>
              <p className="page-subtitle">{t('recruiter_apps.subtitle')}</p>
            </div>

            <div className="stats-row">
              <div className="stat-tile stat-total">
                <div className="num">{stats.total}</div>
                <div className="label">{t('recruiter_apps.stat_total')}</div>
              </div>
              <div className="stat-tile stat-pending">
                <div className="num">{stats.en_attente}</div>
                <div className="label">{t('recruiter_apps.stat_pending')}</div>
              </div>
              <div className="stat-tile stat-accepted">
                <div className="num">{stats.acceptee}</div>
                <div className="label">{t('recruiter_apps.stat_accepted')}</div>
              </div>
              <div className="stat-tile stat-rejected">
                <div className="num">{stats.refusee}</div>
                <div className="label">{t('recruiter_apps.stat_rejected')}</div>
              </div>
            </div>

            <div className="filter-row">
              <select
                className="form-select offre-filter"
                value={selectedOffre}
                onChange={(e) => setSelectedOffre(e.target.value)}
              >
                <option value="all">Toutes les offres</option>
                {uniqueOffres.map(o => (
                  <option key={o.id} value={o.id}>{o.titre}</option>
                ))}
              </select>
            </div>

            <div className="candidatures-list">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <FiUser size={40} />
                  <p>{t('recruiter_apps.empty_desc')}</p>
                </div>
              ) : (
                filtered.map(c => {
                  const u = c.user;
                  const p = u?.profil;
                  const o = c.offre;
                  const isPending = !c.status || c.status === 'en_attente';
                  const isAccepted = c.status === 'acceptee';
                  const hasReview = Boolean(c.review);
                  const showReviewForm = reviewFormId === c.id;

                  return (
                    <div key={c.id} className="card candidature-card">
                      <div className="card-top">
                        <div className="left">
                          {p?.photo_path ? (
                            <SafeImage
                              src={`${STORAGE_BASE}/${p.photo_path}`}
                              alt={u?.nom}
                              className="avatar"
                            />
                          ) : (
                            <div className="avatar avatar-placeholder">
                              {u?.nom?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="candidate-info">
                            <div className="name">{u?.nom}</div>
                            <div className="meta"><strong>Offre:</strong> {o?.titre || t('recruiter_apps.job_not_specified')}</div>
                            <div className="meta">
                              <strong>{t('recruiter_apps.experience_label')}</strong>{' '}
                              {c.experience ? t('recruiter_apps.experience_years', { count: c.experience }) : t('recruiter_apps.job_not_specified')}
                            </div>
                            <div className="meta">
                              <strong>{t('recruiter_apps.city_label')}</strong> {p?.ville || t('recruiter_apps.city_not_specified')}
                            </div>
                          </div>
                        </div>
                        <span className={`badge-status ${getStatusClass(c.status)}`}>
                          {getStatusLabel(c.status).toUpperCase()}
                        </span>
                      </div>

                      <div className="candidature-contact-bar">
                        <div className="contact-item">
                          <FiMail />
                          <span><strong>Email:</strong> {u?.email}</span>
                        </div>
                        <div className="contact-item">
                          <FiPhone />
                          <span><strong>Téléphone:</strong> {p?.telephone || t('recruiter_apps.job_not_specified')}</span>
                        </div>
                        <div className="contact-item">
                          <FiCalendar />
                          <span><strong>Date:</strong> {formatDate(c.created_at)}</span>
                        </div>
                      </div>

                      {c.motivation && (
                        <div className="motivation-block">
                          <div className="motivation-title">{t('recruiter_apps.motivation_label')}</div>
                          <div className="motivation-text">&quot;{c.motivation}&quot;</div>
                        </div>
                      )}

                      {isAccepted && hasReview && !showReviewForm && (
                        <div className="review-block review-block-published">
                          <div className="review-block-header">
                            <div className="review-block-title">
                              <FiStar /> {t('recruiter_apps.your_review')}
                            </div>
                            <button
                              type="button"
                              className="btn-edit-review"
                              onClick={() => openEditReviewForm(c)}
                            >
                              <FiEdit /> {t('recruiter_apps.edit_review_btn')}
                            </button>
                          </div>
                          <StarDisplay rating={c.review.rating} size="20px" />
                          {c.review.comment && (
                            <p className="review-comment">&quot;{c.review.comment}&quot;</p>
                          )}
                        </div>
                      )}

                      {isAccepted && showReviewForm && (
                        <div className="review-block review-block-form">
                          <div className="review-block-title">
                            <FiStar /> {t('recruiter_apps.your_review')}
                          </div>
                          {reviewError && <div className="alert alert-error">{reviewError}</div>}
                          <div className="form-group">
                            <label className="form-label">{t('recruiter_apps.rating_label')}</label>
                            <StarPicker value={rating} onChange={setRating} />
                            <div className="rating-hint">{ratingLabel(rating, t)}</div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">
                              {t('recruiter_apps.comment_label')}{' '}
                              <span className="label-muted">{t('recruiter_apps.comment_optional')}</span>
                            </label>
                            <textarea
                              className="form-input"
                              rows="3"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder={t('recruiter_apps.comment_placeholder')}
                            />
                          </div>
                          <div className="review-form-actions">
                            <button
                              type="button"
                              className="btn btn-primary btn-action"
                              onClick={() => submitReview(c)}
                              disabled={submittingReview}
                            >
                              {submittingReview ? t('recruiter_apps.sending') : (
                                <><FiSend /> {editingReviewId ? t('recruiter_apps.update_review') : t('recruiter_apps.publish_review')}</>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-action"
                              onClick={closeReviewForm}
                            >
                              {t('recruiter_apps.cancel')}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="card-actions">
                        <Link to={`/profil/${u?.id}`} className="btn btn-primary btn-action">
                          <FiEye /> {t('recruiter_apps.view_profile')}
                        </Link>
                        <Link
                          to={`/portfolio/public/${u?.id}`}
                          state={{ from: '/candidatures-recues', userName: u?.nom }}
                          className="btn btn-outline btn-action"
                        >
                          <FiImage /> {t('recruiter_apps.view_portfolio')}
                        </Link>
                        {isAccepted && !hasReview && !showReviewForm && (
                          <button
                            type="button"
                            className="btn btn-warning btn-action"
                            onClick={() => openReviewForm(c.id)}
                          >
                            <FiStar /> {t('recruiter_apps.leave_review_btn')}
                          </button>
                        )}
                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success btn-action"
                              onClick={() => handleStatusChange(c.id, 'acceptee')}
                            >
                              <FiCheck /> {t('recruiter_apps.accept_btn')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-action"
                              onClick={() => handleStatusChange(c.id, 'refusee')}
                            >
                              <FiX /> {t('recruiter_apps.skip_btn')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
