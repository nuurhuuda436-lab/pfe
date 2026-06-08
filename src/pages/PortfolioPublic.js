import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiImage } from 'react-icons/fi';
import PortfolioPostFeed from '../components/PortfolioPostFeed';
import './PortfolioPublic.css';

export default function PortfolioPublic() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.userName || '';

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container portfolio-public-page">
        <button type="button" className="portfolio-public-back" onClick={handleBack}>
          <FiArrowLeft /> {t('portfolio.back')}
        </button>

        <div className="portfolio-public-header">
          <h1>
            <FiImage />{' '}
            {userName
              ? t('portfolio.public_title', { name: userName })
              : t('portfolio.title')}
          </h1>
          <p>{t('portfolio.public_subtitle')}</p>
        </div>

        <PortfolioPostFeed userId={userId} perPage={5} />
      </div>
    </div>
  );
}
