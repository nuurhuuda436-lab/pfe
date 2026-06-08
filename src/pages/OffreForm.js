import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiMapPin, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import api from '../api';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Composant pour recentrer la carte
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function OffreForm({ user }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    titre: '',
    description: '',
    ville: '',
    temps: '',
    prix: '',
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Position sur la carte
  const [mapPosition, setMapPosition] = useState(null);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchOffre();
    }
  }, [id]);

  const fetchOffre = async () => {
    try {
      const res = await api.get(`/offres/${id}`);
      setForm({
        titre: res.data.titre || '',
        description: res.data.description || '',
        ville: res.data.ville || '',
        temps: res.data.temps || '',
        prix: res.data.prix || '',
      });
      // Si l'offre a une adresse, on cherche la position
      if (res.data.ville) {
        geocodeAddress(res.data.ville);
        if (res.data.latitude && res.data.longitude) {
          setForm(prev => ({ ...prev, latitude: res.data.latitude, longitude: res.data.longitude }));
        }
      }
    } catch (err) {
      navigate('/offres');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Géocodage : convertir l'adresse en coordonnées GPS
  const geocodeAddress = async (address) => {
    if (!address || address.trim().length < 2) return;

    setSearchingAddress(true);
    setMapError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapPosition([lat, lon]);
        setForm(prev => ({ ...prev, latitude: lat, longitude: lon }));
        setMapError('');
        // make sure the map container is visible to the user
        setTimeout(() => {
          const el = document.querySelector('.map-container-offre');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 250);
      } else {
        setMapError(t('offre_form.address_not_found'));
        setMapPosition(null);
      }
    } catch (err) {
      setMapError(t('offre_form.address_error'));
      setMapPosition(null);
    } finally {
      setSearchingAddress(false);
    }
  };

  // Lancer la recherche quand on clique sur le bouton
  const handleSearchAddress = () => {
    geocodeAddress(form.ville);
  };

  const handleConfirmPosition = () => {
    // maybe show toast or simply close map - here we just scroll to the form
    const el = document.querySelector('.offre-form-card');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Lancer la recherche avec Entrée dans le champ adresse
  const handleAdresseKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      geocodeAddress(form.ville);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/offres/${id}`, form);
      } else {
        await api.post('/offres', form);
      }
      navigate('/offres');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Only recruteurs can post
  if (user?.role !== 'recruteur') {
    navigate('/offres');
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="offre-form-page animate-in">
          <Link to="/offres" className="back-link">
            <FiArrowLeft /> {t('offre_form.back_to_offers')}
          </Link>

          <div className="offre-form-card">
            <h1>{isEdit ? t('offre_form.title_edit') : t('offre_form.title_new')}</h1>

            {error && <div className="alert alert-error"><FiAlertTriangle style={{marginRight: '6px'}} /> {error}</div>}

            <form onSubmit={handleSubmit}>

              {/* === Titre === */}
              <div className="form-group">
                <label className="form-label" htmlFor="offre-titre">
                  {t('offre_form.label_title')}
                </label>
                <input
                  id="offre-titre"
                  className="form-input"
                  type="text"
                  name="titre"
                  placeholder={t('offre_form.placeholder_title')}
                  value={form.titre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* === Description === */}
              <div className="form-group">
                <label className="form-label" htmlFor="offre-description">
                  {t('offre_form.label_description')}
                </label>
                <textarea
                  id="offre-description"
                  className="form-textarea"
                  name="description"
                  placeholder={t('offre_form.placeholder_description')}
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={5}
                />
              </div>


              {/* === Temps === */}
              <div className="form-group">
                <label className="form-label" htmlFor="offre-temps">
                  {t('offre_form.label_time')}
                </label>
                <select
                  id="offre-temps"
                  className="form-input"
                  name="temps"
                  value={form.temps}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('offre_form.select_time')}</option>
                  <option value="Plein temps">{t('offre_form.fulltime')}</option>
                  <option value="Temps partiel">{t('offre_form.parttime')}</option>
                  <option value="Flexible">{t('offre_form.flexible')}</option>
                </select>
              </div>

              {/* === Prix / Salaire === */}
              <div className="form-group">
                <label className="form-label" htmlFor="offre-prix">
                  {t('offre_form.label_salary')}
                </label>
                <input
                  id="offre-prix"
                  className="form-input"
                  type="number"
                  name="prix"
                  placeholder={t('offre_form.placeholder_salary')}
                  value={form.prix}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* === Ville === */}
              <div className="form-group">
                <label className="form-label" htmlFor="offre-ville">
                  <FiMapPin style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  {t('offre_form.label_location')}
                </label>
                <div className="adresse-search-row">
                  <input
                    id="offre-ville"
                    className="form-input"
                    type="text"
                    name="ville"
                    placeholder={t('offre_form.placeholder_location')}
                    value={form.ville}
                    onChange={handleChange}
                    onKeyDown={handleAdresseKeyDown}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-localiser"
                    onClick={handleSearchAddress}
                    disabled={searchingAddress || !form.ville.trim()}
                  >
                    {searchingAddress ? <FiLoader className="spin" /> : <FiMapPin />} {t('offre_form.locate_btn')}
                  </button>
                </div>
              </div>

              {/* === Map === */}
              {mapError && (
                <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                  <FiAlertTriangle style={{marginRight: '6px'}} /> {mapError}
                </div>
              )}

              <div className="map-container-offre">
                {mapPosition ? (
                  <MapContainer
                    center={mapPosition}
                    zoom={15}
                    className="offre-map"
                  >
                    <MapUpdater center={mapPosition} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker
                      position={mapPosition}
                      draggable={true}
                      eventHandlers={{
                        dragend: (e) => {
                          const latlng = e.target.getLatLng();
                          setMapPosition([latlng.lat, latlng.lng]);
                          setForm(prev => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }));
                        }
                      }}
                    >
                      <Popup><FiMapPin /> {form.ville}</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="map-placeholder">
                    <FiMapPin size={40} />
                    <p>{t('offre_form.map_placeholder_text')}</p>
                  </div>
                )}
              </div>

              {mapPosition && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button type="button" className="btn btn-outline" onClick={() => { setMapPosition(null); setForm(prev => ({ ...prev, latitude: null, longitude: null })); }}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleConfirmPosition}>
                    Confirmer la position
                  </button>
                  <div style={{ marginLeft: 'auto', color: 'var(--color-text-secondary)' }}>
                    {form.latitude && form.longitude ? `Lat: ${form.latitude.toFixed(6)}, Lng: ${form.longitude.toFixed(6)}` : ''}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
                style={{ marginTop: '24px' }}
              >
                {loading ? t('offre_form.saving') : <><FiSave /> {isEdit ? t('offre_form.save_changes') : t('offre_form.publish')}</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OffreForm;
