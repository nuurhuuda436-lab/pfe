import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBriefcase, FiFileText, FiHelpCircle, FiImage, FiLogOut, FiPlusCircle, FiMessageSquare, FiMoon, FiSun } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import api from '../api';
import SafeImage from './ui/SafeImage';

function Navbar({ user, onLogout, onToggleAI, isDarkMode, onToggleTheme }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchPhoto = () => {
      if (user) {
        api.get('/profil').then(res => {
          if (res.data?.photo_url) {
            setPhotoUrl(res.data.photo_url);
          } else {
            setPhotoUrl(null);
          }
        }).catch(() => {});
      }
    };
    fetchPhoto();
    window.addEventListener('profile-updated', fetchPhoto);
    return () => window.removeEventListener('profile-updated', fetchPhoto);
  }, [user]);

  const isActive = (path) => location.pathname === path ? 'nav-active' : '';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const userRole = user?.role?.toString().toLowerCase();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      // On déconnecte même si l'API échoue
    }
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          <span>RecruART</span>
        </Link>

        <div className="navbar-links is-open">
          {!user ? (
            <>
              <Link to="/" className={isActive('/')}>
                <FiHome /> {t('nav.home')}
              </Link>
              <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={onToggleTheme} className="theme-toggle-btn" aria-label="Toggle theme" style={{background:'transparent', border:'none', color:'inherit', cursor:'pointer', padding:'8px'}}>
                  {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                <select
                  className="form-select navbar-lang-select"
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  aria-label={t('lang.label')}
                  style={{ width: 'auto' }}
                >
                  <option value="fr">{t('lang.fr')}</option>
                  <option value="en">{t('lang.en')}</option>
                  <option value="ar">{t('lang.ar')}</option>
                </select>
                <Link to="/login" className={`btn btn-outline btn-sm ${isActive('/login')}`}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  {t('nav.register')}
                </Link>
              </div>
            </>
          ) : (
            <>
              {userRole === 'admin' && (
                <Link to="/admin" className={isActive('/admin')}>
                  <FiBriefcase /> {t('nav.admin_dashboard')}
                </Link>
              )}

              {userRole === 'recruteur' && (
                <>
                  <Link to="/offres" className={isActive('/offres')}>
                    <FiBriefcase /> {t('nav.offers')}
                  </Link>
                  <Link to="/offres/new" className={isActive('/offres/new')}>
                    <FiPlusCircle /> {t('nav.publish')}
                  </Link>
                  <Link to="/candidatures-recues" className={isActive('/candidatures-recues')}>
                    <FiFileText /> {t('nav.received_applications')}
                  </Link>
                </>
              )}
              {userRole === 'artisan' && (
                <>
                  <Link to="/offres" className={isActive('/offres')}>
                    <FiBriefcase /> {t('nav.offers')}
                  </Link>
                  <Link to="/candidatures" className={isActive('/candidatures')}>
                    <FiFileText /> {t('nav.applications')}
                  </Link>
                  <Link to="/portfolio" className={isActive('/portfolio')}>
                    <FiImage /> {t('nav.portfolio')}
                  </Link>
                </>
              )}
              <Link to="/profil" className="navbar-user" style={{ textDecoration: 'none' }}>
                <div className="user-avatar" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
                  {photoUrl ? (
                    <SafeImage src={photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--color-primary)', color:'#fff', borderRadius:'50%'}}>
                      {user.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="user-name">{user.nom}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </Link>
              {userRole !== 'admin' && (
                <Link to="/messages" className={`navbar-icon-link ${isActive('/messages')}`} title="Messages">
                  <FiMessageSquare size={20} />
                </Link>
              )}

              <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={onToggleTheme} className="theme-toggle-btn" aria-label="Toggle theme" style={{background:'transparent', border:'none', color:'inherit', cursor:'pointer', padding:'8px'}}>
                  {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                <select
                  className="form-select navbar-lang-select"
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  aria-label={t('lang.label')}
                  style={{ width: 'auto' }}
                >
                  <option value="fr">{t('lang.fr')}</option>
                  <option value="en">{t('lang.en')}</option>
                  <option value="ar">{t('lang.ar')}</option>
                </select>
                <button onClick={handleLogout} title="Déconnexion" className="btn-logout">
                  <FiLogOut /> {t('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
