import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiTool, FiUser, FiSend, FiStar, FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiEdit, FiImage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../api';
import SafeImage from '../components/ui/SafeImage';
import './ProfilPublic.css';

const STORAGE_BASE = 'http://localhost:8000/storage';
const PREVIEW_COUNT = 8;

function getPortfolioImageSrc(item) {
  if (item.image_url) return item.image_url;
  if (item.image_path) return `${STORAGE_BASE}/${item.image_path}`;
  return '';
}

// ====== Composant sélecteur d'étoiles interactif ======
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px', cursor: 'pointer', fontSize: '32px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ====== Affichage étoiles lecture seule ======
function StarDisplay({ rating, size = '18px' }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: size, letterSpacing: '2px' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

function ProfilPublic({ user: currentUser }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [profil, setProfil] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsAverage, setReviewsAverage] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [canEditReview, setCanEditReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewOffreId, setReviewOffreId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const [portfolioPreview, setPortfolioPreview] = useState([]);
  const [portfolioTotal, setPortfolioTotal] = useState(0);

  useEffect(() => {
    fetchProfilPublic();
    fetchReviews();
    checkCanReview();
    fetchPortfolioPreview();
  }, [id]);

  const fetchProfilPublic = async () => {
    try {
      const res = await api.get(`/profil/${id}`);
      // Support both response shapes
      setProfil(res.data.profil || res.data);
      setUserData(res.data.user || res.data);
    } catch (err) {
      setError(t('profil_public.profile_not_found'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioPreview = async () => {
    try {
      const res = await api.get(`/portfolio/public/${id}`, {
        params: { page: 1, per_page: PREVIEW_COUNT },
      });
      const payload = res.data;
      if (payload?.data) {
        setPortfolioPreview(payload.data);
        setPortfolioTotal(payload.total || payload.data.length);
      } else {
        const list = Array.isArray(payload) ? payload : [];
        setPortfolioPreview(list.slice(0, PREVIEW_COUNT));
        setPortfolioTotal(list.length);
      }
    } catch (err) {
      setPortfolioPreview([]);
      setPortfolioTotal(0);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/artisan/${id}`);
      setReviews(res.data.reviews || []);
      setReviewsAverage(res.data.average || 0);
      setReviewsCount(res.data.count || 0);
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
    }
  };

  const checkCanReview = async () => {
    try {
      const res = await api.get(`/reviews/can-review/${id}`);
      if (res.data.can_review) {
        setCanReview(true);
        setCanEditReview(false);
        setReviewOffreId(res.data.offre_id);
      } else if (res.data.can_edit && res.data.review) {
        setCanReview(false);
        setCanEditReview(true);
        setEditingReviewId(res.data.review.id);
        setReviewOffreId(res.data.offre_id);
      }
    } catch (err) {
      // Pas recruteur ou pas de permission
    }
  };

  const openEditReviewForm = () => {
    const myReview = reviews.find((r) => r.id === editingReviewId);
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || '');
    }
    setShowReviewForm(true);
    setReviewError('');
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setReviewError('');
    if (!canEditReview) {
      setRating(5);
      setComment('');
    }
  };

  const submitReview = async () => {
    if (!rating) return;
    setReviewError('');
    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, { rating, comment });
        setReviewSuccess(t('profil_public.review_updated'));
      } else {
        const res = await api.post('/reviews', {
          offre_id:   reviewOffreId,
          artisan_id: parseInt(id),
          rating:     rating,
          comment:    comment,
        });
        setEditingReviewId(res.data.id);
        setCanReview(false);
        setCanEditReview(true);
        setReviewSuccess(t('profil_public.review_success'));
      }
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      fetchReviews();
      checkCanReview();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getFirstNameLastName = (fullName) => {
    const cleaned = (fullName || '').trim();
    if (!cleaned) return { firstName: '', lastName: '' };
    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
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

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state animate-in">
            <div className="empty-icon"><FiAlertCircle /></div>
            <h3>{error}</h3>
            <Link to="/candidatures-recues" className="btn btn-primary">{t('profil_public.back')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const nom = userData?.nom || profil?.nom || '';
  const { firstName, lastName } = getFirstNameLastName(nom);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="profile-sheet animate-in">

          {/* Lien retour (sans accent dans l'URL) */}
          <button className="back-link" style={{ marginBottom: '20px', display: 'inline-flex', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => {
            const from = location.state?.from;
            if (from) {
              navigate(from);
            } else {
              navigate(-1);
            }
          }}>
            <FiArrowLeft /> {t('profil_public.back')}
          </button>

          <div className="profile-sheet-header">
            <h1><FiUser style={{ marginRight: '10px' }} /> {t('profil_public.profile_of')} {firstName || ""}</h1>
          </div>

          {/* Photo */}
          {profil?.photo_url && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <SafeImage
                src={profil.photo_url}
                alt="Photo de profil"
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '9999px',
                  objectFit: 'cover',
                  border: '3px solid #ffffff',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
                }}
              />
            </div>
          )}

          {/* Badge note moyenne */}
          {reviewsCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '20px',
            }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#92400e' }}>{reviewsAverage}</span>
              <div>
                <StarDisplay rating={reviewsAverage} size="20px" />
                <div style={{ fontSize: '13px', color: '#78350f', marginTop: '2px' }}>
                  {t('profil_public.rating_based_on', { count: reviewsCount })}
                </div>
              </div>
            </div>
          )}

          {/* Champs profil */}
          <div className="profile-grid">
            <div className="profile-field">
              <div className="profile-label"><span className="profile-label-icon"><FiUser /></span> {t('profil_public.label_name')}</div>
              <input className="profile-input" value={lastName || '—'} readOnly />
            </div>

            <div className="profile-field">
              <div className="profile-label"><span className="profile-label-icon"><FiUser /></span> {t('profil_public.label_firstname')}</div>
              <input className="profile-input" value={firstName || '—'} readOnly />
            </div>

            <div className="profile-field">
              <div className="profile-label"><FiMail /> {t('profil_public.label_email')}</div>
              <input className="profile-input" value={userData?.email || '—'} readOnly />
            </div>

            <div className="profile-field">
              <div className="profile-label"><FiPhone /> {t('profil_public.label_phone')}</div>
              <input className="profile-input" value={profil?.telephone || '—'} readOnly />
            </div>

            <div className="profile-field">
              <div className="profile-label"><FiTool /> {t('profil_public.label_specialty')}</div>
              <input className="profile-input" value={profil?.specialite || profil?.metier || '—'} readOnly />
            </div>

            <div className="profile-field">
              <div className="profile-label"><FiMapPin /> {t('profil_public.label_city')}</div>
              <input className="profile-input" value={profil?.ville || '—'} readOnly />
            </div>

            {profil?.description && (
              <div className="profile-field profile-field-wide">
                <div className="profile-label">{t('profil_public.label_description')}</div>
                <input className="profile-input" value={profil.description} readOnly />
              </div>
            )}
          </div>

          {/* ====== SECTION AVIS & ÉVALUATIONS ====== */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ margin: 0 }}>
                <FiStar style={{ color: '#f59e0b', marginRight: '8px' }} />
                {t('profil_public.reviews_section')}
              </h2>
              {/* Bouton "Laisser un avis" visible seulement si recruteur autorisé */}
              {canReview && !showReviewForm && (
                <button className="btn btn-primary" onClick={() => { setEditingReviewId(null); setRating(5); setComment(''); setShowReviewForm(true); }}>
                  <FiStar /> {t('profil_public.leave_review_btn')}
                </button>
              )}
              {canEditReview && !showReviewForm && (
                <button className="btn btn-primary" onClick={openEditReviewForm}>
                  <FiEdit /> {t('profil_public.edit_review_btn')}
                </button>
              )}
            </div>

            {/* Messages de succès / erreur */}
            {reviewSuccess && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' }}><FiCheckCircle /> {reviewSuccess}</div>
            )}

            {/* Formulaire de notation */}
            {showReviewForm && (
              <div style={{
                background: 'var(--color-bg-secondary)',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px',
                border: '1px solid var(--color-border)',
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiEdit /> {t('profil_public.your_evaluation')}</h3>

                {reviewError && (
                  <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' }}><FiAlertTriangle /> {reviewError}</div>
                )}

                <div className="form-group">
                  <label className="form-label">{t('profil_public.rating_label')}</label>
                  <StarPicker value={rating} onChange={setRating} />
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    {rating === 5 ? t('profil_public.excellent') : rating === 4 ? t('profil_public.very_good') : rating === 3 ? t('profil_public.good') : rating === 2 ? t('profil_public.fair') : t('profil_public.poor')}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">{t('profil_public.comment_label')} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>{t('profil_public.comment_optional')}</span></label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('profil_public.comment_placeholder')}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={submitReview} disabled={submittingReview}>
                    {submittingReview ? t('profil_public.sending') : (
                      <><FiSend /> {editingReviewId ? t('profil_public.update_review') : t('profil_public.publish_review')}</>
                    )}
                  </button>
                  <button className="btn btn-outline" onClick={closeReviewForm}>
                    {t('profil_public.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Résumé note globale */}
            {reviewsCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--color-text)' }}>{reviewsAverage}</div>
                <div>
                  <StarDisplay rating={reviewsAverage} size="22px" />
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    {t('profil_public.rating_based_on', { count: reviewsCount })}
                  </div>
                </div>
              </div>
            )}

            {/* Liste des avis */}
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                {t('profil_public.no_reviews')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {review.recruteur?.profil?.photo_url && (
                          <SafeImage
                            src={review.recruteur.profil.photo_url}
                            alt=""
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        )}
                        {review.recruteur?.nom || 'Recruteur'}
                      </strong>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                        {new Date(review.created_at).toLocaleDateString(t('lang.fr') === 'Français' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <StarDisplay rating={review.rating} size="18px" />
                    </div>

                    {review.comment && (
                      <p style={{
                        margin: 0,
                        color: 'var(--color-text)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        borderLeft: '3px solid var(--color-primary)',
                        paddingLeft: '12px',
                        fontStyle: 'italic',
                      }}>
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ====== SECTION PORTFOLIO (miniatures) ====== */}
          {portfolioPreview.length > 0 && (
            <div className="profil-public-portfolio">
              <div className="profil-public-portfolio-header">
                <h2>
                  <FiImage /> {t('profil.portfolio_section')}
                </h2>
                {portfolioTotal > PREVIEW_COUNT && (
                  <Link
                    to={`/portfolio/public/${id}`}
                    state={{ from: location.pathname, userName: nom }}
                    className="profil-public-portfolio-link"
                  >
                    {t('profil_public.view_all_portfolio', { count: portfolioTotal })}
                  </Link>
                )}
              </div>
              <div className="profil-public-portfolio-grid">
                {portfolioPreview.map((item) => (
                  <Link
                    key={item.id}
                    to={`/portfolio/public/${id}`}
                    state={{ from: location.pathname, userName: nom }}
                    className="profil-public-portfolio-thumb"
                    title={item.title || item.titre || ''}
                  >
                    <SafeImage
                      src={getPortfolioImageSrc(item)}
                      alt={item.title || item.titre || t('portfolio.image_alt')}
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProfilPublic;
