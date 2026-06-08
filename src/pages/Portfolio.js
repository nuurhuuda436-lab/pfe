import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiImage, FiPlus, FiTrash2, FiEye, FiX, FiCalendar, FiGrid, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import api from '../api';
import SafeImage from '../components/ui/SafeImage';
import './Portfolio.css';

export default function Portfolio({ user }) {
  const { t } = useTranslation();

  // Posts list
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Lightbox
  const [lightboxPost, setLightboxPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portfolio');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur chargement portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setFormError('');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setFormError(t('portfolio.no_image_error'));
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      if (titleInput) fd.append('title', titleInput);
      if (descInput) fd.append('description', descInput);

      await api.post('/portfolio', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowForm(false);
      setImageFile(null);
      setImagePreview(null);
      setTitleInput('');
      setDescInput('');
      fetchPosts();
    } catch (err) {
      setFormError(t('portfolio.post_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('portfolio.delete_confirm'))) return;
    try {
      await api.delete(`/portfolio/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erreur suppression portfolio:', err);
    }
  };

  const getImageSrc = (post) => {
    if (post.image_url) return post.image_url;
    if (post.image_path) return `http://localhost:8000/storage/${post.image_path}`;
    return '';
  };

  const getStatusBadge = (post) => {
    const status = post.status || post.statut || 'en_attente';
    if (status === 'approuve' || status === 'approved' || status === 'accepte') {
      return { key: 'approved', icon: <FiCheckCircle size={11} />, label: t('portfolio.status_approved', 'Approuvé') };
    }
    if (status === 'rejete' || status === 'rejected' || status === 'refuse') {
      return { key: 'rejected', icon: <FiAlertCircle size={11} />, label: t('portfolio.status_rejected') };
    }
    return { key: 'pending', icon: <FiClock size={11} />, label: t('portfolio.status_pending') };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loader-wrapper"><div className="loader"></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Page Header */}
        <div className="portfolio-page-header animate-in">
          <div>
            <h1><FiGrid /> {t('portfolio.title')}</h1>
            <p>{t('portfolio.subtitle', 'Gérez et publiez vos travaux pour montrer votre expertise aux recruteurs.')}</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? <><FiX /> {t('common.cancel', 'Annuler')}</> : <><FiPlus /> {t('portfolio.add_post')}</>}
          </button>
        </div>

        {/* Stats removed: simplified header as requested */}

        {/* Add Form */}
        {showForm && (
          <div className="portfolio-add-card animate-in">
            <h2><FiPlus /> {t('portfolio.add_post')}</h2>
            <form onSubmit={handleSubmit}>
              {/* Image upload */}
              <div className="form-group">
                <label className="form-label">{t('portfolio.image')} *</label>
                {!imagePreview ? (
                  <div className="portfolio-upload-zone">
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <span className="portfolio-upload-icon"><FiImage /></span>
                    <div className="portfolio-upload-text">{t('portfolio.upload_click', 'Cliquez ou glissez une image ici')}</div>
                    <div className="portfolio-upload-hint">PNG, JPG, WebP — max 10 Mo</div>
                  </div>
                ) : (
                  <div className="portfolio-preview-wrap">
                    <img src={imagePreview} alt="Prévisualisation" className="portfolio-preview-img" />
                    <button type="button" className="portfolio-preview-remove" onClick={handleRemoveImage} aria-label="Supprimer">×</button>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="portfolio-form-row">
                <div className="form-group">
                  <label className="form-label">{t('portfolio.title_optional')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('portfolio.title_placeholder')}
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('portfolio.description_optional')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('portfolio.description_placeholder')}
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                  />
                </div>
              </div>

              {formError && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                  <FiAlertCircle /> {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  {t('common.cancel', 'Annuler')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? t('portfolio.publishing') : <><FiImage /> {t('portfolio.publish')}</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts Gallery */}
        <div className="portfolio-posts-header animate-in">
          <h2><FiGrid /> {t('portfolio.my_works', 'Mes travaux')}</h2>
          {posts.length > 0 && (
            <span className="portfolio-posts-count">{posts.length} {posts.length === 1 ? t('portfolio.post_singular', 'travail') : t('portfolio.post_plural', 'travaux')}</span>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="portfolio-empty animate-in">
            <div className="portfolio-empty-icon"><FiImage /></div>
            <h3>{t('portfolio.no_posts')}</h3>
            <p>{t('portfolio.no_posts_message')}</p>
          </div>
        ) : (
          <div className="portfolio-gallery animate-in">
            {posts.map((post) => {
              const badge = getStatusBadge(post);
              const imgSrc = getImageSrc(post);
              return (
                <div key={post.id} className="portfolio-post-card">
                  {/* Image */}
                  <div className="portfolio-post-img-wrap">
                    {imgSrc ? (
                      <SafeImage
                        src={imgSrc}
                        alt={post.title || t('portfolio.image_alt')}
                        className="portfolio-post-img"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                        <FiImage size={40} />
                      </div>
                    )}

                    {/* Status Badge - show only for approved/rejected, hide pending */}
                    {badge && badge.key !== 'pending' && (
                      <div className="portfolio-status-overlay">
                        <span className={`portfolio-status-badge ${badge.key}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="portfolio-img-overlay">
                      <button
                        className="portfolio-view-btn"
                        onClick={() => setLightboxPost(post)}
                      >
                        <FiEye /> {t('common.view', 'Voir')}
                      </button>
                    </div>
                  </div>

                    {/* Card Body overlay (title/desc on hover) */}
                    <div className="portfolio-post-body">
                      <div className="portfolio-post-title">{post.title || post.titre || t('portfolio.default_title')}</div>
                      {(post.description || post.contenu) && (
                        <p className="portfolio-post-desc">{post.description || post.contenu}</p>
                      )}
                      <div className="portfolio-post-footer">
                        <span className="portfolio-post-date"><FiCalendar size={11} /> {formatDate(post.created_at)}</span>
                        <button className="portfolio-delete-btn" onClick={() => handleDelete(post.id)}>
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightboxPost && (
        <div className="portfolio-lightbox" onClick={() => setLightboxPost(null)}>
          <div className="portfolio-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="portfolio-lightbox-close" onClick={() => setLightboxPost(null)}>×</button>
            <SafeImage
              src={getImageSrc(lightboxPost)}
              alt={lightboxPost.title || ''}
              className="portfolio-lightbox-img"
            />
            <div className="portfolio-lightbox-info">
              <div className="portfolio-lightbox-title">
                {lightboxPost.title || lightboxPost.titre || t('portfolio.default_title')}
              </div>
              {(lightboxPost.description || lightboxPost.contenu) && (
                <p className="portfolio-lightbox-desc">{lightboxPost.description || lightboxPost.contenu}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
