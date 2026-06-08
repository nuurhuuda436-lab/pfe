import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBriefcase, FiMonitor } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Slider from '../components/ui/slider';
import './Home.css';

const TRENDING_SKILLS = [
  { key: 'home.skills.carpentry', trend: '+113%', up: true },
  { key: 'home.skills.plumbing', trend: '+43%', up: true },
  { key: 'home.skills.electricity', trend: '+31%', up: true },
  { key: 'home.skills.painting', trend: '-7%', up: false },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('candidats');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const content = {
    candidats: {
      titleStart: t('home.hero_title_start_artisan'),
      titleHighlight: t('home.hero_title_highlight_artisan'),
      titleEnd: t('home.hero_title_end_artisan'),
      subtitle: t('home.hero_description_artisan'),
    },
    recruteurs: {
      titleStart: t('home.hero_title_start_recruiter'),
      titleHighlight: t('home.hero_title_highlight_recruiter'),
      titleEnd: t('home.hero_title_end_recruiter'),
      subtitle: t('home.hero_description_recruiter'),
    },
  };

  const currentContent = content[activeTab];
  const handleCommencerClick = (e) => {
    e.preventDefault();
    setShowRoleSelection(true);
  };

  const handleRoleSelect = (role) => {
    navigate(`/register?role=${role}`);
  };

  if (showRoleSelection) {
    return (
      <div className="upw-role-page">
        <div className="upw-role-page-inner">
          <h1 className="upw-role-page-title">{t('role_selection.title')}</h1>

          <div className="upw-role-cards">
            <button
              type="button"
              className="upw-role-pick-card"
              onClick={() => handleRoleSelect('recruteur')}
            >
              <div className="upw-role-pick-icon upw-role-pick-icon--client">
                <FiBriefcase size={36} strokeWidth={1.5} />
              </div>
              <h2 className="upw-role-pick-label">
                {t('role_selection.recruiter_title')} <FiArrowRight className="upw-role-pick-arrow" />
              </h2>
              <p className="upw-role-pick-desc">{t('role_selection.recruiter_desc')}</p>
            </button>

            <button
              type="button"
              className="upw-role-pick-card"
              onClick={() => handleRoleSelect('artisan')}
            >
              <div className="upw-role-pick-icon upw-role-pick-icon--freelancer">
                <FiMonitor size={36} strokeWidth={1.5} />
              </div>
              <h2 className="upw-role-pick-label">
                {t('role_selection.artisan_title')} <FiArrowRight className="upw-role-pick-arrow" />
              </h2>
              <p className="upw-role-pick-desc">{t('role_selection.artisan_desc')}</p>
            </button>
          </div>

          <p className="upw-role-page-login">
            {t('register.already_registered') || 'Vous avez déjà un compte ?'}{' '}
            <Link to="/login">{t('register.login_link') || 'Connexion'}</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-upwork">
      <section className="upw-hero-section">
        <div className="container">
          <div className="upw-hero-container">
            <div className="upw-hero-bg">
              <Slider />
              <div className="upw-hero-overlay" />
            </div>

            <div className="upw-hero-content">
              <div className="upw-tabs">
                <div
                  className={`upw-tab ${activeTab === 'candidats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('candidats')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab('candidats')}
                >
                  {t('home.tab_candidates')}
                </div>
                <div
                  className={`upw-tab ${activeTab === 'recruteurs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recruteurs')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab('recruteurs')}
                >
                  {t('home.tab_recruiters')}
                </div>
              </div>

              <h1 className="upw-hero-title">
                {currentContent.titleStart}
                <br />
                <span className="upw-text-green">{currentContent.titleHighlight}</span>
                <br />
                {currentContent.titleEnd}
              </h1>

              <p className="upw-hero-subtitle">{currentContent.subtitle}</p>

              <a
                href="/register"
                className="upw-hero-cta"
                onClick={handleCommencerClick}
              >
                {t('home.start_free')}
              </a>

              <div className="upw-trending">
                <p className="upw-trending-label">
                  <span className="upw-dot-green" />
                  {t('home.trending_skills')}
                </p>
                <div className="upw-trending-pills">
                  {TRENDING_SKILLS.map((skill) => (
                    <span key={skill.key} className="upw-pill">
                      {t(skill.key)}{' '}
                      <span className={skill.up ? 'upw-trend-up' : 'upw-trend-down'}>
                        {skill.trend}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="upw-trusted-section">
        <div className="container">
          
        </div>
      </section>

      <section className="upw-split-section">
        <div className="container">
          <div className="upw-split-header">
            <h2>{t('home.future_recruitment')}</h2>
            <p>{t('home.future_recruitment_desc')}</p>
          </div>

          <div className="upw-split-grid">
            <div className="upw-roles-card">
              <h3>{t('home.emerging_roles')}</h3>

              <div className="upw-role-item">
                <div>
                  <h4>{t('home.role1_title')}</h4>
                  <p>{t('home.role1_desc')}</p>
                </div>
                <span className="upw-trend-up-large">↗ +58%</span>
              </div>

              <div className="upw-role-item">
                <div>
                  <h4>{t('home.role2_title')}</h4>
                  <p>{t('home.role2_desc')}</p>
                </div>
                <span className="upw-trend-up-large">↗ +32%</span>
              </div>

              <div className="upw-role-item">
                <div>
                  <h4>{t('home.role3_title')}</h4>
                  <p>{t('home.role3_desc')}</p>
                </div>
                <span className="upw-trend-up-large">↗ +31%</span>
              </div>

              <div className="upw-role-item">
                <div>
                  <h4>{t('home.role4_title')}</h4>
                  <p>{t('home.role4_desc')}</p>
                </div>
                <span className="upw-trend-up-large">↗ +28%</span>
              </div>
            </div>

            <div className="upw-skills-container">
              <h3>{t('home.demand_skills')}</h3>

              <div className="upw-skill-category">
                <h4>{t('home.cat_construction')}</h4>
                <div className="upw-skill-tags">
                  <span className="upw-skill-tag">{t('home.skill_masonry')}</span>
                  <span className="upw-skill-tag">{t('home.skill_framing')}</span>
                  <span className="upw-skill-tag">{t('home.skill_roofing')}</span>
                  <span className="upw-skill-tag">{t('home.skill_plastering')}</span>
                </div>
              </div>

              <div className="upw-skill-category">
                <h4>{t('home.cat_finishing')}</h4>
                <div className="upw-skill-tags">
                  <span className="upw-skill-tag">{t('register.specialty_painter')}</span>
                  <span className="upw-skill-tag">{t('home.skill_flooring')}</span>
                  <span className="upw-skill-tag">{t('home.skill_interior_wood')}</span>
                </div>
              </div>

              <div className="upw-skill-category">
                <h4>{t('home.cat_energy')}</h4>
                <div className="upw-skill-tags">
                  <span className="upw-skill-tag">{t('register.specialty_plumber')}</span>
                  <span className="upw-skill-tag">{t('register.specialty_electrician')}</span>
                  <span className="upw-skill-tag">{t('home.skill_heating')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
