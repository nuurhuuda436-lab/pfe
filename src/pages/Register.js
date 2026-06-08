import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiBriefcase, FiMonitor } from 'react-icons/fi';
import api from '../api';
import './Auth.css';

const EMPTY_FORM = {
  nom: '',
  email: '',
  password: '',
  role: 'artisan',
  nom_entreprise: '',
  secteur_activite: '',
  specialite: '',
  email_entreprise: '',
  telephone: '',
  adresse: '',
  site_web: '',
  effectif: '',
  description: '',
};

function Register({ onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const isArtisan = roleParam === 'artisan';
  const isRecruteur = roleParam === 'recruteur';
  const hasFixedRole = isArtisan || isRecruteur;

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    role: isRecruteur ? 'recruteur' : 'artisan',
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasFixedRole) {
      setForm((prev) => ({
        ...prev,
        role: roleParam,
        nom_entreprise: '',
        secteur_activite: '',
        specialite: '',
        email_entreprise: '',
        telephone: '',
        adresse: '',
        site_web: '',
        effectif: '',
        description: '',
      }));
      setStep(1);
    }
  }, [roleParam, hasFixedRole]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.password) {
      setError("Veuillez remplir tous les champs d'inscription.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSend = {
      nom: form.nom,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    if (form.role === 'recruteur') {
      dataToSend.nom_entreprise = form.nom_entreprise;
      dataToSend.secteur_activite = form.secteur_activite;
      dataToSend.email_entreprise = form.email_entreprise;
      dataToSend.telephone = form.telephone;
      dataToSend.adresse = form.adresse;
      dataToSend.site_web = form.site_web;
      dataToSend.effectif = form.effectif;
      dataToSend.description = form.description;
    } else {
      dataToSend.specialite = form.specialite;
    }

    try {
      const res = await api.post('/register', dataToSend);
      onLogin(res.data.user, res.data.token);
      const role = res.data.user?.role ? res.data.user.role.toString().toLowerCase() : null;
      if (role === 'admin') {
        navigate('/admin');
      } else if (form.role === 'recruteur') {
        navigate('/candidatures-recues');
      } else {
        navigate('/offres');
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(err.response?.data?.message || t('register.error_default'));
      }
    } finally {
      setLoading(false);
    }
  };

  const pickRole = (role) => {
    navigate(`/register?role=${role}`);
  };

  if (!hasFixedRole) {
    return (
      <div className="upw-role-page">
        <div className="upw-role-page-inner">
          <h1 className="upw-role-page-title">{t('role_selection.title')}</h1>
          <p className="upw-role-page-subtitle">
            {t('role_selection.subtitle')}
          </p>

          <div className="upw-role-cards">
            <button type="button" className="upw-role-pick-card" onClick={() => pickRole('recruteur')}>
              <div className="upw-role-pick-icon upw-role-pick-icon--client">
                <FiBriefcase size={36} strokeWidth={1.5} />
              </div>
              <h2 className="upw-role-pick-label">
                {t('role_selection.recruiter_title')} <FiArrowRight className="upw-role-pick-arrow" />
              </h2>
              <p className="upw-role-pick-desc">{t('role_selection.recruiter_desc_full')}</p>
            </button>

            <button type="button" className="upw-role-pick-card" onClick={() => pickRole('artisan')}>
              <div className="upw-role-pick-icon upw-role-pick-icon--freelancer">
                <FiMonitor size={36} strokeWidth={1.5} />
              </div>
              <h2 className="upw-role-pick-label">
                {t('role_selection.artisan_title')} <FiArrowRight className="upw-role-pick-arrow" />
              </h2>
              <p className="upw-role-pick-desc">{t('role_selection.artisan_desc_full')}</p>
            </button>
          </div>

          <p className="upw-role-page-login">
            {t('register.already_registered')}{' '}
            <Link to="/login">{t('register.login_link')}</Link>
          </p>
        </div>
      </div>
    );
  }

  const roleLabel = isRecruteur ? t('role_selection.recruiter_title') : t('role_selection.artisan_title');
  const title = isRecruteur ? `${t('register.title')} ${t('role_selection.recruiter_title')}` : `${t('register.title')} ${t('role_selection.artisan_title')}`;
  const subtitle = isRecruteur
    ? (step === 1 ? "Étape 1 : Création de votre compte" : "Étape 2 : Informations de votre entreprise")
    : t('aide.links.profile_artisan_desc');

  return (
    <div className="auth-page-split">
      <div className="auth-card-split animate-in">
        <div className="auth-form-side" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
          <h1 className="auth-title-dark">{title}</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{subtitle}</p>

          {step === 1 && (
            <button
              type="button"
              className="register-change-role"
              onClick={() => navigate('/register')}
            >
              {t('role_selection.change_profile')}
            </button>
          )}

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={isRecruteur && step === 1 ? handleNextStep : handleSubmit} className="auth-form-clean">
            {step === 1 && (
              <>
                <div className="form-group-clean">
                  <input
                    id="register-nom"
                    className="form-input-clean"
                    type="text"
                    name="nom"
                    placeholder={t('register.full_name')}
                    value={form.nom}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <input
                    id="register-email"
                    className="form-input-clean"
                    type="email"
                    name="email"
                    placeholder={t('register.email')}
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <input
                    id="register-password"
                    className="form-input-clean"
                    type="password"
                    name="password"
                    placeholder={t('register.password')}
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                {isArtisan && (
                  <>
                    <div className="register-form-section-label">{t('register.specialty')}</div>
                    <div className="form-group-clean">
                      <select
                        id="register-specialite"
                        className="form-input-clean"
                        name="specialite"
                        value={form.specialite}
                        onChange={handleChange}
                        required
                      >
                        <option value="">{t('register.select_specialty')}</option>
                        <option value="Esthéticienne">{t('register.specialty_aesthetician')}</option>
                        <option value="Menuiserie">{t('register.specialty_carpentry')}</option>
                        <option value="Électricien">{t('register.specialty_electrician')}</option>
                        <option value="Plombier">{t('register.specialty_plumber')}</option>
                        <option value="Peintre">{t('register.specialty_painter')}</option>
                        <option value="Mécanicien">{t('register.specialty_mechanic')}</option>
                      </select>
                    </div>
                  </>
                )}

                {isRecruteur && (
                  <button
                    type="submit"
                    className="btn btn-teal btn-block"
                    style={{ marginTop: '20px' }}
                  >
                    Continuer vers l'étape 2 →
                  </button>
                )}

                {!isRecruteur && (
                  <button
                    type="submit"
                    className="btn btn-teal btn-block"
                    disabled={loading}
                    style={{ marginTop: '20px' }}
                  >
                    {loading ? t('register.creating') : `${t('register.create_account')} (${roleLabel.toLowerCase()})`}
                  </button>
                )}
              </>
            )}

            {isRecruteur && step === 2 && (
              <>
                <div className="register-form-section-label">Votre Entreprise</div>

                <div className="form-group-clean">
                  <input
                    id="register-entreprise"
                    className="form-input-clean"
                    type="text"
                    name="nom_entreprise"
                    placeholder="Nom de l'entreprise"
                    value={form.nom_entreprise}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-clean">
                  <select
                    id="register-secteur"
                    className="form-input-clean"
                    name="secteur_activite"
                    value={form.secteur_activite}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('register.select_sector')}</option>
                    <option value="Beauté & Esthétique">{t('register.sector_beauty')}</option>
                    <option value="Artisanat & Création">{t('register.sector_craft')}</option>
                    <option value="Bâtiment & Travaux">{t('register.sector_construction')}</option>
                  </select>
                </div>

                <div className="form-group-clean">
                  <input
                    id="register-email-entreprise"
                    className="form-input-clean"
                    type="email"
                    name="email_entreprise"
                    placeholder="Email de l'entreprise (optionnel)"
                    value={form.email_entreprise}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group-clean">
                  <input
                    id="register-telephone"
                    className="form-input-clean"
                    type="text"
                    name="telephone"
                    placeholder={t('profil.placeholder_telephone')}
                    value={form.telephone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group-clean">
                  <input
                    id="register-adresse"
                    className="form-input-clean"
                    type="text"
                    name="adresse"
                    placeholder={t('profil.placeholder_adresse')}
                    value={form.adresse}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group-clean">
                  <input
                    id="register-site-web"
                    className="form-input-clean"
                    type="text"
                    name="site_web"
                    placeholder={t('profil.placeholder_site_web')}
                    value={form.site_web}
                    onChange={handleChange}
                  />
                </div>


                <div className="form-group-clean">
                  <textarea
                    id="register-description"
                    className="form-input-clean"
                    name="description"
                    placeholder="Description de l'entreprise (optionnel)"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    style={{ padding: '12px', minHeight: '100px', width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(1)}
                    style={{ flex: 1 }}
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    className="btn btn-teal"
                    disabled={loading}
                    style={{ flex: 2 }}
                  >
                    {loading ? t('register.creating') : "Finaliser l'inscription"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className={`auth-image-side ${isRecruteur ? 'auth-image-side--recruteur' : 'auth-image-side--artisan'}`}>
          <div className="auth-image-overlay">
            {isRecruteur ? (
              <>
                <h2>
                  {t('home.hero_title_start_recruiter')}
                  <br />
                  {t('home.hero_title_highlight_recruiter')}
                </h2>
                <p>{t('aide.links.publish_desc')}</p>
              </>
            ) : (
              <>
                <h2>
                  {t('home.hero_title_start_artisan')}
                  <br />
                  {t('home.hero_title_highlight_artisan')}
                </h2>
                <p>{t('aide.links.candidatures_art_desc')}</p>
              </>
            )}
            <Link to="/login" className="btn btn-outline-white">
              {t('register.already_registered')} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
