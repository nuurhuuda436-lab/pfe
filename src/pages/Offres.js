import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiClock, FiSearch, FiPlusCircle, FiFilter, FiDollarSign, FiFileText, FiCalendar } from 'react-icons/fi';
import api from '../api';
import './Offres.css';

export default function Offres({ user }) {
  const { t, i18n } = useTranslation();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterTemps, setFilterTemps] = useState('');
  const [filterPrixMin, setFilterPrixMin] = useState('');
  const [filterVille, setFilterVille] = useState('');

  useEffect(() => {
    fetchOffres();
  }, []);

  const fetchOffres = async () => {
    try {
      const res = await api.get('/offres');
      setOffres(res.data);
    } catch (err) {
      console.error('Erreur chargement offres', err);
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

  const translateTemps = (tempsVal) => {
    if (!tempsVal) return '';
    const key = tempsVal.toLowerCase().replace(' ', '');
    if (key === 'pleintemps') return t('jobs.filter_fulltime');
    if (key === 'tempspartiel') return t('jobs.filter_parttime');
    if (key === 'flexible') return t('jobs.filter_flexible');
    return tempsVal;
  };

  const userRole = user?.role?.toString().toLowerCase();
  const isAdmin = userRole === 'admin';
  const isRecruteur = userRole === 'recruteur';

  const filtered = offres.filter((o) => {
    // Le recruteur ne voit que ses propres offres ; l'admin voit tout
    if (isRecruteur && o.user_id !== user.id) {
      return false;
    }

    const q = search.toLowerCase();
    const matchSearch = !q ||
                        o.titre.toLowerCase().includes(q) ||
                        o.ville.toLowerCase().includes(q) ||
                        o.description.toLowerCase().includes(q);
    
    const matchTemps = filterTemps ? o.temps === filterTemps : true;
    const matchPrix = filterPrixMin ? (o.prix >= parseInt(filterPrixMin)) : true;
    const matchVille = filterVille ? o.ville.toLowerCase().includes(filterVille.toLowerCase()) : true;

    return matchSearch && matchTemps && matchPrix && matchVille;
  });

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
            <h1>{t('jobs.title')}</h1>
            <p>
              {isAdmin
                ? (filtered.length === 1 ? t('jobs.count_one_admin') : t('jobs.count_many_admin', { count: filtered.length }))
                : (filtered.length === 1 ? t('jobs.count_one') : t('jobs.count_many', { count: filtered.length }))}
            </p>
          </div>
          <div className="page-header-actions">
            {!isRecruteur && (
              <div className="search-container">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    className="form-input"
                    type="text"
                    placeholder={t('jobs.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    id="search-offres"
                  />
                </div>
                <button
                  className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setShowFilters(!showFilters)}
                  title="Filtrer les offres"
                >
                  <FiFilter />
                </button>
              </div>
            )}
            {isRecruteur && (
              <Link to="/offres/new" className="btn btn-primary">
                <FiPlusCircle /> {t('jobs.publish_btn')}
              </Link>
            )}
          </div>
        </div>

        {showFilters && !isRecruteur && (
          <div className="filters-panel animate-in">
            <div className="filter-group">
              <label className="filter-label">{t('jobs.filter_ville')}</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Casablanca, Paris..." 
                value={filterVille} 
                onChange={(e) => setFilterVille(e.target.value)} 
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">{t('jobs.filter_temps')}</label>
              <select className="form-input" value={filterTemps} onChange={(e) => setFilterTemps(e.target.value)}>
                <option value="">{t('jobs.filter_all')}</option>
                <option value="Plein temps">{t('jobs.filter_fulltime')}</option>
                <option value="Temps partiel">{t('jobs.filter_parttime')}</option>
                <option value="Flexible">{t('jobs.filter_flexible')}</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">{t('jobs.filter_salary')}</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Ex: 5000" 
                value={filterPrixMin} 
                onChange={(e) => setFilterPrixMin(e.target.value)} 
              />
            </div>
            <div className="filters-actions">
              <button className="btn btn-outline" onClick={() => {
                setFilterVille('');
                setFilterTemps('');
                setFilterPrixMin('');
              }}>{t('jobs.filter_reset')}</button>
            </div>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="empty-state animate-in">
            <div className="empty-icon">🔍</div>
            <h3>{t('jobs.empty_title')}</h3>
            <p>
              {search
                ? t('jobs.empty_desc_search')
                : t('jobs.empty_desc_none')}
            </p>
          </div>
        ) : (
          <div className="offres-grid">
            {filtered.map((offre, index) => (
              <Link
                to={`/offres/${offre.id}`}
                key={offre.id}
                className={`offre-card animate-in animate-in-delay-${Math.min(index, 4)}`}
              >
                <div className="offre-card-header">
                  <div className="offre-card-title-row">
                    <h3 className="offre-card-title">{offre.titre}</h3>
                    {offre.status && offre.status !== 'approved' && (
                      <span className={`badge ${offre.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {offre.status === 'pending' ? t('jobs.status_pending') : t('jobs.status_rejected')}
                      </span>
                    )}
                  </div>
                  {offre.status === 'approved' && <span className="badge badge-primary">{t('jobs.badge_new')}</span>}
                </div>
                <div className="offre-card-meta">
                  <span className="meta-item"><FiMapPin /> {offre.ville}</span>
                  {offre.type_contrat && <span className="meta-item"><FiFileText /> {offre.type_contrat}</span>}
                  {offre.temps && <span className="meta-item"><FiClock /> {translateTemps(offre.temps)}</span>}
                  {offre.prix && <span className="meta-item meta-price"><FiDollarSign /> {offre.prix} DH</span>}
                  <span className="meta-item"><FiCalendar /> {formatDate(offre.created_at)}</span>
                </div>
                <div className="offre-description">{offre.description}</div>
                <div className="offre-card-footer">
                  <span className="offre-date">{t('jobs.published_on')} {formatDate(offre.created_at)}</span>
                  <span className="btn btn-sm btn-outline">{t('jobs.view_details')} →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
