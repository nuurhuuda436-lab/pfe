import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiMail, FiPhone, FiMapPin, FiBriefcase, FiTool, FiFileText, FiCamera, FiUser, FiGlobe, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../api';
import SafeImage from '../components/ui/SafeImage';
import './Profil.css';

function Profil({ user }) {
  const { t } = useTranslation();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidatureCount, setCandidatureCount] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  useEffect(() => {
    fetchProfil();
    if (user?.role === 'artisan') {
      fetchCandidaturesCount();
      fetchSuggestions();
    }
  }, []);

  const fetchProfil = async () => {
    try {
      const res = await api.get('/profil');
      setProfil(res.data);
      if (res.data?.id) fetchPortfolioItems(res.data.id);
    } catch (err) {
      console.error('Erreur chargement profil', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidaturesCount = async () => {
    try {
      const res = await api.get('/candidatures');
      setCandidatureCount(Array.isArray(res.data) ? res.data.length : null);
    } catch (err) {
      setCandidatureCount(null);
    }
  };

  const fetchSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const res = await api.get('/offres/suggestions');
      setSuggestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const fetchPortfolioItems = async (profileId) => {
    setPortfolioLoading(true);
    try {
      const res = await api.get(`/portfolio?user_id=${profileId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPortfolioItems(res.data);
        return;
      }
      const all = await api.get('/portfolio');
      const list = Array.isArray(all.data) ? all.data.filter(it => {
        if (!it) return false;
        if (it.user_id && profileId && Number(it.user_id) === Number(profileId)) return true;
        if (it.user && it.user.id && profileId && Number(it.user.id) === Number(profileId)) return true;
        if (it.profil_id && profileId && Number(it.profil_id) === Number(profileId)) return true;
        return false;
      }) : [];
      setPortfolioItems(list);
    } catch (err) {
      setPortfolioItems([]);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const getFirstNameLastName = (fullName) => {
    const cleaned = (fullName || '').trim();
    if (!cleaned) return { firstName: '', lastName: '' };
    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  };

  const { firstName, lastName } = getFirstNameLastName(user?.nom);
  const isRecruteur = user?.role === 'recruteur';

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res = await api.post('/profil/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfil({ ...profil, photo_url: res.data.photo_url });
      window.dispatchEvent(new Event('profile-updated'));
    } catch (err) {
      alert(t('profil.photo_error'));
    }
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
        <div className="profile-sheet animate-in">
          <div className="profile-sheet-header">
            <h1>{t('profil.title')}</h1>
            {user?.role !== 'admin' && (
              <Link to="/profil/edit" className="btn btn-primary btn-lg">
                <FiEdit /> {t('profil.edit_btn')}
              </Link>
            )}
          </div>

          {!profil ? (
            <div className="empty-state">
              <div className="empty-icon"><FiUser /></div>
              <h3>{t('profil.incomplete_title')}</h3>
              <p>{isRecruteur ? t('profil.incomplete_desc_recruiter') : t('profil.incomplete_desc_artisan')}</p>
              <Link to="/profil/edit" className="btn btn-primary">
                <FiEdit /> {t('profil.complete_btn')}
              </Link>
            </div>
          ) : (
            <>
              <div className="profile-header">
                <div className="profile-avatar-wrap">
                  {profil.photo_url ? (
                    <SafeImage
                      className="profile-avatar-large"
                      src={profil.photo_url}
                      alt="Photo de profil"
                    />
                  ) : (
                    <div className="profile-avatar-large profile-avatar-placeholder"><FiUser size={40} /></div>
                  )}
                </div>
                <div className="profile-meta">
                  <div className="profile-name">{user?.nom || 'Utilisateur'}</div>
                  <div className="profile-role-badge">
                    {user?.role === 'admin' ? 'ADMINISTRATEUR' : (isRecruteur ? t('profil.badge_recruiter') : t('profil.badge_artisan'))}
                  </div>
                  <label className="btn btn-sm btn-outline" style={{ marginTop: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
                    <FiCamera /> {t('profil.change_photo_btn')}
                  </label>
                </div>
              </div>
              <div className="profile-grid">
                <div className="profile-field">
                  <div className="profile-label"><span className="profile-label-icon"><FiUser /></span> {t('profil.label_name')}</div>
                  <input className="profile-input" value={lastName || ''} readOnly />
                </div>

                <div className="profile-field">
                  <div className="profile-label"><span className="profile-label-icon"><FiUser /></span> {t('profil.label_firstname')}</div>
                  <input className="profile-input" value={firstName || ''} readOnly />
                </div>

                <div className="profile-field">
                  <div className="profile-label"><FiMail /> {t('profil.label_email')}</div>
                  <input className="profile-input" value={user?.email || ''} readOnly />
                </div>

                <div className="profile-field">
                  <div className="profile-label"><FiPhone /> {t('profil.label_phone')}</div>
                  <input className="profile-input" value={profil.telephone || ''} readOnly placeholder="—" />
                </div>

                {isRecruteur && (
                  <>
                    <div className="profile-field">
                      <div className="profile-label"><FiBriefcase /> Nom de l'entreprise</div>
                      <input className="profile-input" value={profil.nom_entreprise || ''} readOnly placeholder="—" />
                    </div>

                    <div className="profile-field">
                      <div className="profile-label"><FiBriefcase /> {t('profil.label_sector')}</div>
                      <input className="profile-input" value={profil.metier || ''} readOnly placeholder="—" />
                    </div>

                    <div className="profile-field">
                      <div className="profile-label"><FiMail /> Email de l'entreprise</div>
                      <input className="profile-input" value={profil.email_entreprise || ''} readOnly placeholder="—" />
                    </div>

                    <div className="profile-field">
                      <div className="profile-label"><FiPhone /> {t('profil.label_phone')}</div>
                      <input className="profile-input" value={profil.telephone || ''} readOnly placeholder="—" />
                    </div>

                    <div className="profile-field">
                      <div className="profile-label"><FiMapPin /> {t('profil.label_city')}</div>
                      <input className="profile-input" value={profil.ville || ''} readOnly placeholder="—" />
                    </div>

                    <div className="profile-field">
                      <div className="profile-label"><FiMapPin /> {t('profil.label_adresse')}</div>
                      <input className="profile-input" value={profil.adresse || ''} readOnly placeholder="—" />
                    </div>

                    <div className="profile-field">
                      <div className="profile-label"><FiGlobe /> {t('profil.label_site_web')}</div>
                      <input className="profile-input" value={profil.site_web || ''} readOnly placeholder="—" />
                    </div>


                    <div className="profile-field profile-field-wide">
                      <div className="profile-label"><FiFileText /> {t('profil.label_description')}</div>
                      <textarea className="profile-input" value={profil.description || ''} readOnly placeholder="—" rows={4} style={{ resize: 'none', background: 'var(--color-bg-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }} />
                    </div>
                  </>
                )}

                {user?.role === 'artisan' && (
                  <>
                    <div className="profile-field">
                      <div className="profile-label"><FiTool /> {t('profil.label_specialty')}</div>
                      <input className="profile-input" value={profil.specialite || profil.metier || ''} readOnly placeholder="—" />
                    </div>

                    <div className="profile-field">
                      <div className="profile-label"><FiMapPin /> {t('profil.label_city')}</div>
                      <input className="profile-input" value={profil.ville || ''} readOnly placeholder="—" />
                    </div>
                  </>
                )}
              </div>

              {user?.role === 'artisan' && (
                <div className="profile-account-card">
                  <div className="profile-account-title">{t('profil.jobs_for_you')}</div>
                  {suggestionsLoading ? (
                    <div style={{ color: '#64748b' }}>{t('profil.loading')}</div>
                  ) : suggestions.length === 0 ? (
                    <div style={{ color: '#64748b' }}>
                      {t('profil.no_suggestions')}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {suggestions.map((o) => (
                        <Link
                          key={o.id}
                          to={`/offres/${o.id}`}
                          className="btn btn-outline"
                          style={{
                            justifyContent: 'space-between',
                            width: '100%',
                            background: '#ffffff',
                            borderColor: '#d0d5dd',
                            color: '#0f172a',
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{o.titre}</span>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>{o.ville}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!portfolioLoading && user?.role === 'artisan' && (
                <div className="profile-account-card">
                  <div className="profile-account-title">{t('profil.portfolio_section')}</div>
                  {portfolioItems.length === 0 ? (
                    <div style={{ color: 'var(--color-text-secondary)' }}>{t('profil.no_portfolio_items')}</div>
                  ) : (
                    <div className="portfolio-grid">
                      {portfolioItems.map((it) => (
                        <div key={it.id} className="portfolio-card">
                          <SafeImage
                            className="portfolio-thumb"
                            src={it.image_url || (it.image_path ? `/storage/${it.image_path}` : '')}
                            alt={it.title || 'Portfolio'}
                          />
                          <div className="portfolio-card-body">
                            <div className="portfolio-card-title">{it.title || 'Projet'}</div>
                            <button className="btn btn-danger btn-sm delete-portfolio">{t('profil.delete_portfolio_btn')}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="profile-account-card">
                <div className="profile-account-title">{t('profil.account_info')}</div>
                <div className="profile-account-row">
                  <div>{t('profil.member_since')}</div>
                  <div className="profile-account-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString(t('lang.fr') === 'Français' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' }) : '—'}</div>
                </div>
                {user?.role === 'artisan' && (
                  <div className="profile-account-row">
                    <div>{t('profil.applications_sent')}</div>
                    <div className="profile-account-value">
                      {candidatureCount ?? '—'}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profil;
