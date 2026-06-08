import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AIAssistant from '../components/AIAssistant';
import './Aide.css';

export default function Aide({ user }) {
  const { t } = useTranslation();
  const role = user?.role?.toString().toLowerCase() || "artisan";

  const quickLinks = role === "recruteur"
    ? [
        {  label: t("aide.links.publish"), desc: t("aide.links.publish_desc"), path: "/offres/new" },
        {  label: t("aide.links.candidatures_rec"), desc: t("aide.links.candidatures_rec_desc"), path: "/candidatures-recues" },
        {  label: t("aide.links.messages"), desc: t("aide.links.messages_desc"), path: "/messages" },
        {  label: t("aide.links.profile_edit"), desc: t("aide.links.profile_edit_desc"), path: "/profil/edit" },
      ]
    : [
        { label: t("aide.links.view_offers"), desc: t("aide.links.view_offers_desc"), path: "/offres" },
        { label: t("aide.links.candidatures_art"), desc: t("aide.links.candidatures_art_desc"), path: "/candidatures" },
        {  label: t("aide.links.portfolio"), desc: t("aide.links.portfolio_desc"), path: "/portfolio" },
        {  label: t("aide.links.profile_edit"), desc: t("aide.links.profile_artisan_desc"), path: "/profil/edit" },
      ];

  return (
    <div className="page-wrapper">
      <div className="container aide-page">

        {/* ═══ Header ═══ */}
        <div className="aide-page__header">
          <div className="aide-page__header-glow"></div>
          <div className="aide-page__icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8"/>
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M7 12h2m6 0h2"/>
              <path d="M9 17c.85.63 1.885 1 3 1s2.15-.37 3-1"/>
            </svg>
          </div>
          <h1 className="page-title">
            {t("aide.title")}
          </h1>
          <p className="aide-page__subtitle">
            {role === "recruteur"
              ? t("aide.subtitle_recruiter")
              : t("aide.subtitle_artisan")}
          </p>
          <div className="aide-page__role-badge">
            {role === "recruteur" ? t("aide.badge_recruiter") : t("aide.badge_artisan")}
          </div>
        </div>

        {/* ═══ Main Layout ═══ */}
        <div className="aide-page__grid">

          {/* ═══ Chat Panel (Left / Main) ═══ */}
          <div className="aide-page__chat-panel">
            <div className="card aide-page__chat-card">
              <div className="aide-page__chat-label">
                <span className="aide-page__dot"></span>
                {t("aide.chat_label")}
              </div>
              <AIAssistant user={user} isOpen={false} onClose={() => {}} embedded={true} />
            </div>
          </div>

          {/* ═══ Sidebar (Right) ═══ */}
          <div className="aide-page__sidebar">

            {/* Quick links */}
            <div className="card aide-page__links-card">
              <h3>{t("aide.quick_access")}</h3>
              <div className="aide-page__links-list">
                {quickLinks.map((link, i) => (
                  <Link to={link.path} key={i} className="aide-page__link-item">
                    <span className="aide-page__link-icon">{link.icon}</span>
                    <div>
                      <strong>{link.label}</strong>
                      <small>{link.desc}</small>
                    </div>
                    <span className="aide-page__link-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="card aide-page__support-card">
              <h3>{t("aide.support_contact")}</h3>
              <div className="aide-page__support-info">
                <div className="aide-page__support-row">
                  
                  <div>
                    <strong>Email</strong>
                    <small>{role === "recruteur" ? "recruteur@plateforme.com" : "candidat@plateforme.com"}</small>
                  </div>
                </div>
                <div className="aide-page__support-row">
                  
                  <div>
                    <strong>{t("aide.hours_label")}</strong>
                    <small>{t("aide.hours_val")}</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}