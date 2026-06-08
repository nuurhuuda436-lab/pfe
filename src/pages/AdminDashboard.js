import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from '../api';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiX, FiBriefcase, FiImage, FiMessageSquare, FiUsers, FiTrash2, FiBarChart2, FiTrendingUp, FiFileText, FiSearch, FiEye, FiUser, FiMail, FiPhone, FiCalendar, FiXCircle, FiDownload, FiMapPin } from "react-icons/fi";
import SafeImage from '../components/ui/SafeImage';
import './AdminDashboard.css';
import './CandidaturesRecruteur.css';

const STORAGE_BASE = 'http://localhost:8000/storage';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState({ offres: [], messages: [], users: [], companies: [], candidatures: [] });
  const [stats, setStats] = useState({
    total_users: 0,
    total_companies: 0,
    total_offers: 0,
    total_candidatures: 0,
    total_hires: 0,
    top_jobs: [],
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedAdminOffre, setSelectedAdminOffre] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      const [contentRes, usersRes, companiesRes, statsRes, candidaturesRes] = await Promise.all([
        api.get('/admin/pending'),
        api.get('/admin/users'),
        api.get('/admin/companies'),
        api.get('/admin/stats'),
        api.get('/admin/candidatures')
      ]);
      // Remove messages that are admin->admin (internal system messages) so admins don't moderate themselves
      const raw = contentRes.data || {};
      const rawMessages = Array.isArray(raw.messages) ? raw.messages : [];
      const filteredMessages = rawMessages.filter(m => {
        const sRole = m.sender?.role || '';
        const sName = (m.sender?.nom || '').toString().toLowerCase();
        const senderIsAdmin = sRole === 'admin' || sName.includes('admin');

        // remove any message sent by an admin (these are internal notifications)
        return !senderIsAdmin;
      });

      setData({
        ...raw,
        messages: filteredMessages,
        users: usersRes.data,
        companies: companiesRes.data || [],
        candidatures: candidaturesRes.data || []
      });
      setStats(statsRes.data);
    } catch (err) {
      console.error('Erreur chargement admin', err);
    } finally {
      setData(prev => ({ ...prev, loading: false }));
      setLoading(false);
    }
  };

  const handleCandidatureStatusChange = async (id, status) => {
    try {
      await api.put(`/candidatures/${id}/status`, { status });
      setData(prev => ({
        ...prev,
        candidatures: (prev.candidatures || []).map(c => c.id === id ? { ...c, status } : c)
      }));
    } catch (err) {
      console.error('Erreur update status candidature:', err);
      alert(t('recruiter_apps.update_error') || 'Erreur de mise à jour');
    }
  };

  const handleDeleteCandidature = async (id) => {
    if (!window.confirm(t('admin.delete_candidature_confirm'))) return;
    try {
      await api.delete(`/admin/candidatures/${id}`);
      setData((prev) => ({
        ...prev,
        candidatures: (prev.candidatures || []).filter((c) => c.id !== id),
      }));
    } catch (err) {
      console.error('Erreur suppression candidature', err);
      alert(t('admin.delete_candidature_error'));
    }
  };

  const filteredAdminCandidatures = useMemo(() => {
    const list = data.candidatures || [];
    if (selectedAdminOffre === 'all') return list;
    return list.filter((c) => c.offre_id === parseInt(selectedAdminOffre, 10));
  }, [data.candidatures, selectedAdminOffre]);

  const adminCandidatureStats = useMemo(() => ({
    total: filteredAdminCandidatures.length,
    en_attente: filteredAdminCandidatures.filter((c) => !c.status || c.status === 'en_attente').length,
    acceptee: filteredAdminCandidatures.filter((c) => c.status === 'acceptee').length,
    refusee: filteredAdminCandidatures.filter((c) => c.status === 'refusee').length,
  }), [filteredAdminCandidatures]);

  const uniqueAdminOffres = useMemo(() => {
    const map = new Map();
    (data.candidatures || []).forEach((c) => {
      if (c.offre?.id) map.set(c.offre.id, c.offre);
    });
    return Array.from(map.values());
  }, [data.candidatures]);

  const getAdminStatusLabel = (status) => {
    if (status === 'acceptee') return t('recruiter_apps.status_accepted');
    if (status === 'refusee') return t('recruiter_apps.status_skipped');
    return t('recruiter_apps.stat_pending');
  };

  const getAdminStatusClass = (status) => {
    if (status === 'acceptee') return 'badge-success';
    if (status === 'refusee') return 'badge-danger';
    return 'badge-warning';
  };

  const formatCandidatureDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (isNaN(date.getTime())) {
      return t('admin.time_recent') || "Récemment";
    }

    if (diffMins < 1) {
      return "À l'instant";
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else {
      return `Il y a ${diffDays} j`;
    }
  };

  const handleModerate = async (type, id, status) => {
    try {
      await api.put(`/admin/${type}/${id}/moderate`, { status });
      // Remove item from state using the right collection key
      setData(prev => ({
        ...prev,
        [type]: (prev[type] || []).filter(item => item.id !== id)
      }));
    } catch (err) {
      console.error(`Erreur moderation ${type}`, err);
      alert(t('admin.moderation_error'));
    }
  };

  // Terminate a message: mark approved and notify only the original sender
  const handleTerminateMessage = async (msg) => {
    if (!msg || msg.status === 'approved') return;
    const text = "Le problème a été réglé par l'administrateur.";
    try {
      // 1) Mark the message as approved/resolved via admin moderation API
      await api.put(`/admin/messages/${msg.id}/moderate`, { status: 'approved' });

      // 2) Send notification message to the original sender only
      if (msg.sender && msg.sender.id) {
        await api.post('/messages', { text, receiver_id: msg.sender.id });
      }

      // 3) Update local UI state so the card shows terminated
      setData(prev => ({
        ...prev,
        messages: (prev.messages || []).map(m => m.id === msg.id ? { ...m, status: 'approved' } : m)
      }));

      alert('Notification envoyée au demandeur');
    } catch (err) {
      console.error('Erreur envoi notification/moderation', err);
      alert('Erreur envoi notification');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.delete_confirm'))) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setData(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId)
      }));
      alert(t('admin.delete_success'));
    } catch (err) {
      console.error('Erreur suppression utilisateur', err);
      alert(t('admin.delete_error'));
    }
  };

  const handleViewUser = async (userId) => {
    setUserDetailsLoading(true);
    setUserModalOpen(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error('Erreur chargement détails utilisateur', err);
      alert(t('admin.error_loading_user'));
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const closeUserModal = () => {
    setUserModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <div className="page-wrapper"><div className="loader-wrapper"><div className="loader"></div></div></div>;
  }

  const renderButtons = (type, id) => (
    <div className="admin-actions">
      <button 
        className="btn btn-sm btn-success" 
        onClick={() => handleModerate(type, id, 'approved')}
      >
        <FiCheck /> {t('admin.approve_btn')}
      </button>
      <button 
        className="btn btn-sm btn-danger" 
        onClick={() => handleModerate(type, id, 'rejected')}
      >
        <FiX /> {t('admin.reject_btn')}
      </button>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-in">
          <div>
            <h1>{t('admin.dashboard_title')}</h1>
            <p>{t('admin.dashboard_subtitle')}</p>
          </div>
        </div>

        <div className="admin-layout">
        <div className="tabs admin-tabs">
          <button className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('stats')}>
            <FiBarChart2 /> {t('admin.tab_stats')}
          </button>
          <button className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('messages')}>
            <FiMessageSquare /> {t('admin.tab_messages')} ({data.messages.length})
          </button>
          <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}>
            <FiUsers /> {t('admin.tab_users')} ({data.users.length})
          </button>
          <button className={`btn ${activeTab === 'companies' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('companies')}>
            <FiBriefcase /> {t('admin.tab_companies')} ({data.companies.length})
          </button>
          <button className={`btn ${activeTab === 'portfolios' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('portfolios')}>
            <FiImage /> Portfolios ({data.portfolios?.length || 0})
          </button>
          <button className={`btn ${activeTab === 'candidatures' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('candidatures')}>
            <FiFileText /> {t('nav.applications')} ({data.candidatures?.length || 0})
          </button>
        </div>

        <div className="admin-content animate-in">
          {activeTab === 'stats' && (
            <div className="admin-stats-container">
              <div className="admin-stats-cards">
                <div className="admin-stats-card">
                  <div className="card-stats-header">
                    <div className="card-icon-wrapper users">
                      <FiUsers />
                    </div>
                    <span className="card-trend-icon"><FiTrendingUp /></span>
                  </div>
                  <div className="card-info">
                    <h3>{stats.total_users}</h3>
                    <p>{t('admin.stats_users')}</p>
                    <span className="stat-percentage positive">+12% ce mois</span>
                  </div>
                </div>

                <div className="admin-stats-card">
                  <div className="card-stats-header">
                    <div className="card-icon-wrapper companies">
                      <FiBriefcase />
                    </div>
                    <span className="card-trend-icon"><FiTrendingUp /></span>
                  </div>
                  <div className="card-info">
                    <h3>{stats.total_companies}</h3>
                    <p>{t('admin.stats_companies')}</p>
                    <span className="stat-percentage positive">+8% ce mois</span>
                  </div>
                </div>

                <div className="admin-stats-card">
                  <div className="card-stats-header">
                    <div className="card-icon-wrapper offers">
                      <FiBriefcase />
                    </div>
                    <span className="card-trend-icon"><FiTrendingUp /></span>
                  </div>
                  <div className="card-info">
                    <h3>{stats.total_offers}</h3>
                    <p>{t('admin.stats_active_offers')}</p>
                    <span className="stat-percentage positive">+15% ce mois</span>
                  </div>
                </div>

                <div className="admin-stats-card">
                  <div className="card-stats-header">
                    <div className="card-icon-wrapper applications">
                      <FiFileText />
                    </div>
                    <span className="card-trend-icon"><FiTrendingUp /></span>
                  </div>
                  <div className="card-info">
                    <h3>{stats.total_candidatures}</h3>
                    <p>{t('admin.stats_applications')}</p>
                    <span className="stat-percentage positive">+22% ce mois</span>
                  </div>
                </div>

                <div className="admin-stats-card">
                  <div className="card-stats-header">
                    <div className="card-icon-wrapper hires">
                      <FiTrendingUp />
                    </div>
                    <span className="card-trend-icon"><FiTrendingUp /></span>
                  </div>
                  <div className="card-info">
                    <h3>{stats.total_hires}</h3>
                    <p>{t('admin.stats_hires')}</p>
                    <span className="stat-percentage positive">+18% ce mois</span>
                  </div>
                </div>
              </div>

              <div className="admin-stats-bottom">
                <div className="stats-box jobs-box">
                  <h2>{t('admin.stats_top_jobs')}</h2>
                  <div className="jobs-list">
                    {stats.top_jobs.map((job, index) => {
                      const maxCount = stats.top_jobs[0]?.count || 1;
                      const percentage = Math.round((job.count / maxCount) * 100);
                      return (
                        <div key={index} className="job-item">
                          <div className="job-meta">
                            <span className="job-name">{job.name}</span>
                            <span className="job-count">{job.count} {t('admin.stats_offers_count')}</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div className={`progress-bar-fill fill-color-${index}`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="stats-box activity-box">
                  <h2>{t('admin.stats_recent_activity')}</h2>
                  <div className="activity-list">
                    {stats.recent_activity.length === 0 ? (
                      <p className="admin-empty">{t('admin.no_activity')}</p>
                    ) : (
                      stats.recent_activity.map((act, index) => (
                        <div key={index} className="activity-item">
                          <span className={`activity-dot dot-color-${act.type}`}></span>
                          <div className="activity-details">
                            <p className="activity-title">{act.title}</p>
                            <span className="activity-time">{formatTimeAgo(act.created_at)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'messages' && (
            <div className="admin-grid">
              {data.messages.length === 0 ? <p className="admin-empty">{t('admin.no_messages')}</p> : data.messages.map(msg => (
                <div key={msg.id} className="admin-card">
                  <div className="admin-meta">
                    <div><strong>{t('admin.from')}:</strong> {msg.sender?.nom}</div>
                    <div><strong>{t('admin.to')}:</strong> {msg.receiver?.nom || 'Global'}</div>
                  </div>

                  <p className="admin-text">"{msg.text}"</p>

                  <div className="admin-actions">
                    <div className="admin-message-actions">
                      <div>
                        <button
                          className={`btn btn-sm ${msg.status === 'approved' ? 'btn-success' : 'btn-outline'} terminate-btn`}
                          onClick={() => handleTerminateMessage(msg)}
                        >
                          {msg.status === 'approved' ? 'Terminé' : 'Terminer'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="admin-grid admin-grid-full">
              <div className="admin-search-bar">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder=""
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              {data.companies.length === 0 ? (
                <p className="admin-empty">{t('admin.no_companies')}</p>
              ) : (
                <div className="admin-company-list">
                  {data.companies
                    .filter(company =>
                      (company.profil?.nom_entreprise && company.profil.nom_entreprise.toLowerCase().includes(companySearchQuery.toLowerCase())) ||
                      (company.nom && company.nom.toLowerCase().includes(companySearchQuery.toLowerCase())) ||
                      (company.email && company.email.toLowerCase().includes(companySearchQuery.toLowerCase()))
                    )
                    .map(company => (
                    <div key={company.id} className="admin-company-card">
                      <div className="admin-card-header">
                        <div>
                          <h3>{company.profil?.nom_entreprise || company.nom || company.email}</h3>
                          <p className="admin-user-email"><strong>Contact principal :</strong> {company.nom} ({company.email})</p>
                          <div className="company-meta">
                            <span>{company.profil?.metier || t('admin.not_specified')}</span>
                            {company.profil?.ville && <span>{company.profil.ville}</span>}
                          </div>
                        </div>
                        {company.profil?.photo_path ? (
                          <img
                            src={`http://localhost:8000/storage/${company.profil.photo_path}`}
                            alt={company.nom || 'Company image'}
                            className="company-image"
                          />
                        ) : (
                          <div className="company-image placeholder">
                            <FiImage />
                          </div>
                        )}
                      </div>

                      <div className="admin-company-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                        {company.profil?.email_entreprise && (
                          <p style={{ margin: 0 }}><strong>Email entreprise :</strong> {company.profil.email_entreprise}</p>
                        )}
                        {company.profil?.telephone && (
                          <p style={{ margin: 0 }}><strong>Téléphone :</strong> {company.profil.telephone}</p>
                        )}
                        {company.profil?.adresse && (
                          <p style={{ margin: 0 }}><strong>Adresse :</strong> {company.profil.adresse}</p>
                        )}
                        {company.profil?.site_web && (
                          <p style={{ margin: 0 }}>
                            <strong>Site web :</strong>{' '}
                            <a
                              href={company.profil.site_web.startsWith('http') ? company.profil.site_web : `http://${company.profil.site_web}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--color-primary-light)', textDecoration: 'underline' }}
                            >
                              {company.profil.site_web}
                            </a>
                          </p>
                        )}
                      </div>

                      <p style={{ marginTop: 'var(--space-3)' }}>{company.profil?.description || t('admin.no_description')}</p>
                      <div className="company-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                        <span>{t('admin.company_offers_count', { count: company.offres_count || 0 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'portfolios' && (
            <div className="admin-grid admin-grid-full">
              {(!data.portfolios || data.portfolios.length === 0) ? (
                <p className="admin-empty">{t('admin.no_portfolios') || 'Aucun portfolio'}</p>
              ) : (
                <div className="admin-portfolio-list">
                  {data.portfolios.map(item => (
                    <div key={item.id} className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 120, height: 80, overflow: 'hidden', borderRadius: 8 }}>
                        <img src={item.image_url || `http://localhost:8000/storage/${item.image_path}`} alt={item.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>{item.title || '—'}</h3>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <button className="btn btn-danger" onClick={async () => {
                          if (!window.confirm(t('admin.delete_confirm') || 'Confirmer suppression ?')) return;
                          try {
                            await api.delete(`/portfolio/${item.id}`);
                            setData(prev => ({ ...prev, portfolios: prev.portfolios.filter(p => p.id !== item.id) }));
                          } catch (err) {
                            console.error('Erreur suppression portfolio', err);
                            alert(t('admin.delete_error') || 'Erreur suppression');
                          }
                        }}><FiTrash2 /> Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-grid admin-grid-full">
              <div className="admin-search-bar">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              {data.users.length === 0 ? (
                <p className="admin-empty">{t('admin.no_users')}</p>
              ) : (
                <div className="admin-user-list">
                  {data.users
                    .filter(user => 
                      (user.nom && user.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(user => (
                    <div key={user.id} className="admin-user-card" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flex: 1, minWidth: '300px' }}>
                        {user.profil?.photo_path ? (
                          <img
                            src={`http://localhost:8000/storage/${user.profil.photo_path}`}
                            alt={user.nom || 'User image'}
                            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                          />
                        ) : (
                          <div style={{ width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '2px solid var(--color-border)', flexShrink: 0 }}>
                            <FiUser />
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2em' }}>{user.nom || user.email}</h3>
                          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95em' }}>
                            <a
                              href={`mailto:${user.email}?subject=${encodeURIComponent('Contact de la part de l\'administrateur')}&body=${encodeURIComponent('Bonjour ' + (user.nom || '') + ',%0D%0A%0D%0A[Votre message ici...]')}`}
                              style={{ color: 'var(--color-primary-light)', textDecoration: 'underline' }}
                              onClick={() => {
                                // Optional: analytics or action before opening mail client
                              }}
                            >
                              {user.email}
                            </a>
                          </p>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <span className={`role-badge ${user.role}`}>
                              {user.role === 'artisan' ? t('admin.artisan') : t('admin.recruiter')}
                            </span>
                            {user.created_at && (
                              <span style={{ fontSize: '0.85em', color: 'var(--color-text-muted)' }}>
                                {t('admin.registered_on')} {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            )}
                            {user.profil?.telephone && (
                              <span style={{ fontSize: '0.85em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiPhone size={12} /> {user.profil.telephone}
                              </span>
                            )}
                            {user.profil?.ville && (
                              <span style={{ fontSize: '0.85em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiMapPin size={12} /> {user.profil.ville === 'Non spécifié' || user.profil.ville === 'Non renseigné' ? t('admin.not_specified') : user.profil.ville}
                              </span>
                            )}
                          </div>
                          {user.profil?.specialite && <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', color: 'var(--color-primary-light)' }}>{user.profil.specialite}</p>}
                        </div>
                      </div>

                      <div className="admin-actions user-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewUser(user.id)}
                          title={t('admin.view_user_details')}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <FiUser /> {t('admin.view_profile')}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <FiTrash2 /> {t('admin.delete_btn')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'candidatures' && (
            <div className="admin-candidatures-panel">
              <div className="stats-row">
                <div className="stat-tile stat-total">
                  <div className="num">{adminCandidatureStats.total}</div>
                  <div className="label">{t('recruiter_apps.stat_total')}</div>
                </div>
                <div className="stat-tile stat-pending">
                  <div className="num">{adminCandidatureStats.en_attente}</div>
                  <div className="label">{t('recruiter_apps.stat_pending')}</div>
                </div>
                <div className="stat-tile stat-accepted">
                  <div className="num">{adminCandidatureStats.acceptee}</div>
                  <div className="label">{t('recruiter_apps.stat_accepted')}</div>
                </div>
                <div className="stat-tile stat-rejected">
                  <div className="num">{adminCandidatureStats.refusee}</div>
                  <div className="label">{t('recruiter_apps.stat_rejected')}</div>
                </div>
              </div>

              <div className="filter-row">
                <select
                  className="form-select offre-filter"
                  value={selectedAdminOffre}
                  onChange={(e) => setSelectedAdminOffre(e.target.value)}
                >
                  <option value="all">{t('admin.all_offers')}</option>
                  {uniqueAdminOffres.map((o) => (
                    <option key={o.id} value={o.id}>{o.titre}</option>
                  ))}
                </select>
              </div>

              <div className="candidatures-list">
                {filteredAdminCandidatures.length === 0 ? (
                  <div className="empty-state">
                    <FiUser size={40} />
                    <p>{t('admin.no_candidatures')}</p>
                  </div>
                ) : (
                  filteredAdminCandidatures.map((cand) => {
                    const u = cand.user;
                    const p = u?.profil;
                    const o = cand.offre;
                    const isPending = !cand.status || cand.status === 'en_attente';

                    return (
                      <div key={cand.id} className="card candidature-card">
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
                              <div className="meta">
                                <strong>Offre:</strong> {o?.titre || t('recruiter_apps.job_not_specified')}
                              </div>
                              <div className="meta">
                                <strong>{t('recruiter_apps.experience_label')}</strong>{' '}
                                {cand.experience
                                  ? t('recruiter_apps.experience_years', { count: cand.experience })
                                  : t('recruiter_apps.job_not_specified')}
                              </div>
                              <div className="meta">
                                <strong>{t('recruiter_apps.city_label')}</strong>{' '}
                                {p?.ville || t('recruiter_apps.city_not_specified')}
                              </div>
                            </div>
                          </div>
                          <span className={`badge-status ${getAdminStatusClass(cand.status)}`}>
                            {getAdminStatusLabel(cand.status).toUpperCase()}
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
                            <span><strong>Date:</strong> {formatCandidatureDate(cand.created_at)}</span>
                          </div>
                        </div>

                        {cand.motivation && (
                          <div className="motivation-block">
                            <div className="motivation-title">{t('recruiter_apps.motivation_label')}</div>
                            <div className="motivation-text">&quot;{cand.motivation}&quot;</div>
                          </div>
                        )}

                        <div className="card-actions">
                          <Link to={`/profil/${u?.id}`} className="btn btn-primary btn-action">
                            <FiEye /> {t('recruiter_apps.view_profile')}
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger btn-action"
                            onClick={() => handleDeleteCandidature(cand.id)}
                          >
                            <FiTrash2 /> {t('admin.delete_candidature_btn')}
                          </button>
                          {isPending && (
                            <>
                              <button
                                type="button"
                                className="btn btn-success btn-action"
                                onClick={() => handleCandidatureStatusChange(cand.id, 'acceptee')}
                              >
                                <FiCheck /> {t('recruiter_apps.accept_btn')}
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-action"
                                onClick={() => handleCandidatureStatusChange(cand.id, 'refusee')}
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
          )}
        </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {userModalOpen && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('admin.user_details')}</h2>
              <button className="modal-close" onClick={closeUserModal}>
                <FiXCircle />
              </button>
            </div>
            <div className="modal-body">
              {userDetailsLoading ? (
                <div className="loader-wrapper"><div className="loader"></div></div>
              ) : selectedUser ? (
                <div className="user-detail-content">
                  <div className="user-detail-header">
                    {selectedUser.profil?.photo_path ? (
                      <img
                        src={`http://localhost:8000/storage/${selectedUser.profil.photo_path}`}
                        alt={selectedUser.nom || 'Profile'}
                        className="user-detail-photo"
                      />
                    ) : (
                      <div className="user-detail-photo placeholder">
                        <FiUser />
                      </div>
                    )}
                    <div className="user-detail-info">
                      <h3>{selectedUser.nom || 'N/A'}</h3>
                      <p className="user-detail-email">{selectedUser.email || 'N/A'}</p>
                      <span className={`role-badge ${selectedUser.role}`}>
                        {selectedUser.role === 'artisan' ? t('admin.artisan') : t('admin.recruiter')}
                      </span>
                    </div>
                  </div>

                  <div className="user-detail-sections">
                    <div className="user-detail-section">
                      <h4><FiMail /> {t('admin.contact_info')}</h4>
                      <div className="user-detail-item">
                        <strong>{t('admin.email')}:</strong> {selectedUser.email || 'N/A'}
                      </div>
                      {selectedUser.profil?.telephone && (
                        <div className="user-detail-item">
                          <strong>{t('admin.phone')}:</strong> {selectedUser.profil.telephone}
                        </div>
                      )}
                    </div>

                    <div className="user-detail-section">
                      <h4><FiCalendar /> {t('admin.account_info')}</h4>
                      <div className="user-detail-item">
                        <strong>{t('admin.created_at')}:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="user-detail-item">
                        <strong>{t('admin.role')}:</strong> {selectedUser.role === 'artisan' ? t('admin.artisan') : t('admin.recruiter')}
                      </div>
                    </div>

                    {selectedUser.profil && (
                      <div className="user-detail-section">
                        <h4>{t('admin.profile_info')}</h4>
                        {selectedUser.profil.specialite && (
                          <div className="user-detail-item">
                            <strong>{t('admin.specialty')}:</strong> {selectedUser.profil.specialite}
                          </div>
                        )}
                        {selectedUser.profil.ville && (
                          <div className="user-detail-item">
                            <strong>{t('admin.city')}:</strong> {selectedUser.profil.ville}
                          </div>
                        )}
                        {selectedUser.profil.description && (
                          <div className="user-detail-item">
                            <strong>{t('admin.description')}:</strong> {selectedUser.profil.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="admin-empty">{t('admin.error_loading_user')}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
