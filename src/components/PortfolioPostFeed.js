import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiImage, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../api';
import SafeImage from './ui/SafeImage';
import './PortfolioPostFeed.css';

const STORAGE_BASE = 'http://localhost:8000/storage';

function getImageSrc(post) {
  if (post.image_url) return post.image_url;
  if (post.image_path) return `${STORAGE_BASE}/${post.image_path}`;
  return '';
}

export default function PortfolioPostFeed({ userId, perPage = 5 }) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/portfolio/public/${userId}`, {
          params: { page, per_page: perPage },
        });
        if (!mounted) return;

        const payload = res.data;
        if (payload?.data) {
          setPosts(payload.data);
          setLastPage(payload.last_page || 1);
          setTotal(payload.total || 0);
        } else {
          const list = Array.isArray(payload) ? payload : [];
          setPosts(list);
          setLastPage(1);
          setTotal(list.length);
        }
      } catch (err) {
        console.error('Erreur chargement portfolio:', err);
        if (mounted) {
          setPosts([]);
          setLastPage(1);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [userId, page, perPage]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="portfolio-feed-loader">
        <div className="loader" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="portfolio-feed-empty">
        <FiImage size={40} />
        <p>{t('portfolio.public_empty')}</p>
      </div>
    );
  }

  return (
    <div className="portfolio-feed">
      <div className="portfolio-feed-count">
        {t('portfolio.posts_count', { count: total })}
      </div>

      <div className="portfolio-feed-list">
        {posts.map((post) => {
          const imgSrc = getImageSrc(post);
          const title = post.title || post.titre || t('portfolio.default_title');
          const description = post.description || post.contenu;

          return (
            <article key={post.id} className="portfolio-feed-post">
              <header className="portfolio-feed-post-header">
                <span className="portfolio-feed-post-date">
                  <FiCalendar size={14} />
                  {formatDate(post.created_at)}
                </span>
              </header>

              {imgSrc && (
                <div className="portfolio-feed-post-image">
                  <SafeImage src={imgSrc} alt={title} />
                </div>
              )}

              <div className="portfolio-feed-post-body">
                <h3 className="portfolio-feed-post-title">{title}</h3>
                {description && (
                  <p className="portfolio-feed-post-desc">{description}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {lastPage > 1 && (
        <nav className="portfolio-feed-pagination" aria-label="Pagination portfolio">
          <button
            type="button"
            className="portfolio-feed-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <FiChevronLeft /> {t('portfolio.prev_page')}
          </button>

          <span className="portfolio-feed-page-info">
            {t('portfolio.page_info', { current: page, total: lastPage })}
          </span>

          <button
            type="button"
            className="portfolio-feed-page-btn"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
          >
            {t('portfolio.next_page')} <FiChevronRight />
          </button>
        </nav>
      )}
    </div>
  );
}
