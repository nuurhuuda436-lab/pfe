import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../api';

function ProfilForm({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isRecruteur = user?.role === 'recruteur';

  // État du formulaire selon le rôle
  const [form, setForm] = useState(
    isRecruteur
      ? {
          nom_entreprise: '',
          secteur: '',
          email_entreprise: '',
          telephone: '',
          ville: '',
          adresse: '',
          site_web: '',
          description: '',
        }
      : {
          specialite: '',
          ville: '',
          telephone: '',
          description: '',
        }
  );
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const res = await api.get('/profil');
      if (res.data) {
        if (isRecruteur) {
          setForm({
            nom_entreprise: res.data.nom_entreprise || '',
            secteur: res.data.metier || '',
            email_entreprise: res.data.email_entreprise || '',
            telephone: res.data.telephone || '',
            ville: res.data.ville || '',
            adresse: res.data.adresse || '',
            site_web: res.data.site_web || '',
            description: res.data.description || '',
          });
        } else {
          setForm({
            specialite: res.data.metier || '',
            ville: res.data.ville || '',
            telephone: res.data.telephone || '',
            description: res.data.description || '',
          });
        }
        setHasExisting(true);
      }
    } catch (err) {
      // Pas de profil existant
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/profil', form);

      if (photo) {
        const fd = new FormData();
        fd.append('photo', photo);
        await api.post('/profil/photo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/profil');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du profil.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
        <div className="offre-form-page animate-in">
          <Link to="/profil" className="back-link">
            <FiArrowLeft /> Retour au profil
          </Link>

          <div className="offre-form-card">
            <h1>{hasExisting ? 'Modifier mon profil' : 'Compléter mon profil'}</h1>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>

              {/* ====== CHAMPS RECRUTEUR ====== */}
              {isRecruteur && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-nom-entreprise">
                      Nom de l'entreprise
                    </label>
                    <input
                      id="profil-nom-entreprise"
                      className="form-input"
                      type="text"
                      name="nom_entreprise"
                      placeholder="Ex: Plomberie Martin"
                      value={form.nom_entreprise}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-secteur">
                      Secteur d'activité
                    </label>
                    <select
                      id="profil-secteur"
                      className="form-select"
                      name="secteur"
                      value={form.secteur}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Choisir un secteur --</option>
                      <option value="Beauté & Esthétique">💅 Beauté & Esthétique</option>
                      <option value="Artisanat & Création">🎨 Artisanat & Création</option>
                      <option value="Bâtiment & Travaux">🏗️ Bâtiment & Travaux</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-email-entreprise">
                      Email de l'entreprise
                    </label>
                    <input
                      id="profil-email-entreprise"
                      className="form-input"
                      type="email"
                      name="email_entreprise"
                      placeholder="Ex: contact@plomberie-martin.fr"
                      value={form.email_entreprise}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-telephone">
                      {t('profil.label_telephone')}
                    </label>
                    <input
                      id="profil-telephone"
                      className="form-input"
                      type="text"
                      name="telephone"
                      placeholder="Ex: 06 12 34 56 78"
                      value={form.telephone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-ville">
                      {t('profil.label_city')}
                    </label>
                    <input
                      id="profil-ville"
                      className="form-input"
                      type="text"
                      name="ville"
                      placeholder="Ex: Casablanca"
                      value={form.ville}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-adresse">
                      {t('profil.label_adresse')}
                    </label>
                    <input
                      id="profil-adresse"
                      className="form-input"
                      type="text"
                      name="adresse"
                      placeholder="Ex: 15 Rue de la République, 75001 Paris"
                      value={form.adresse}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-site-web">
                      {t('profil.label_site_web')}
                    </label>
                    <input
                      id="profil-site-web"
                      className="form-input"
                      type="text"
                      name="site_web"
                      placeholder="Ex: www.plomberie-martin.fr"
                      value={form.site_web}
                      onChange={handleChange}
                    />
                  </div>


                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-description">
                      Description de l'entreprise
                    </label>
                    <textarea
                      id="profil-description"
                      className="form-textarea"
                      name="description"
                      placeholder="Décrivez votre entreprise, vos activités..."
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>
                </>
              )}

              {/* ====== CHAMPS ARTISAN ====== */}
              {!isRecruteur && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-specialite">
                      Spécialité
                    </label>
                    <select
                      id="profil-specialite"
                      className="form-select"
                      name="specialite"
                      value={form.specialite}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Choisir une spécialité --</option>
                      <option value="Esthéticienne">Esthéticienne</option>
                      <option value="Menuiserie">Menuiserie</option>
                      <option value="Électricien">Électricien</option>
                      <option value="Plombier"> Plombier</option>
                      <option value="Peintre"> Peintre</option>
                      <option value="Mécanicien"> Mécanicien</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-ville">
                      Ville
                    </label>
                    <input
                      id="profil-ville"
                      className="form-input"
                      type="text"
                      name="ville"
                      placeholder="Ex: Casablanca"
                      value={form.ville}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-telephone">
                      {t('profil.label_telephone')} (optionnel)
                    </label>
                    <input
                      id="profil-telephone"
                      className="form-input"
                      type="text"
                      name="telephone"
                      placeholder="Ex: 06 12 34 56 78"
                      value={form.telephone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profil-description">
                      {t('profil.label_description')} (optionnel)
                    </label>
                    <textarea
                      id="profil-description"
                      className="form-textarea"
                      name="description"
                      placeholder="Décrivez-vous en quelques mots..."
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="profil-photo">
                  Photo de profil (optionnel)
                </label>
                <input
                  id="profil-photo"
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : <><FiSave /> Enregistrer</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilForm;
