import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profil from './pages/Profil';
import ProfilForm from './pages/ProfilForm';
import ProfilPublic from './pages/ProfilPublic';
import Offres from './pages/Offres';
import OffreDetail from './pages/OffreDetail';
import OffreForm from './pages/OffreForm';
import CandidaturesRecruteur from './pages/CandidaturesRecruteur';
import MesCandidatures from './pages/MesCandidatures';
import Aide from './pages/Aide';
import Messages from './pages/Messages';
import Portfolio from './pages/Portfolio';
import PortfolioPublic from './pages/PortfolioPublic';
import AdminDashboard from './pages/AdminDashboard';

// Import UI component styles
import './components/ui/buttons.css';
import './components/ui/cards.css';
import './components/ui/forms.css';
import './components/ui/badges.css';
import './components/ui/alerts.css';
import './components/ui/loader.css';
import './components/ui/slider.css';

export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // ================= LOAD AUTH =================
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);

      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Invalid user data", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // ================= LOGIN =================
  const handleLogin = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);

    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setAiOpen(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token;

  // Dashboard par défaut selon le rôle (comparaison insensible à la casse)
  const role = user?.role ? user.role.toString().toLowerCase() : null;
  const defaultDashboard = role === 'admin' ? '/admin' : (role === 'recruteur' ? '/candidatures-recues' : '/offres');

  // ================= PRIVATE ROUTE =================
  const PrivateRoute = ({ children, roles }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (roles) {
      const userRole = user?.role ? user.role.toString().toLowerCase() : null;
      const allowed = roles.map(r => r.toString().toLowerCase()).includes(userRole);
      if (!allowed) return <Navigate to="/" />;
    }
    return children;
  };

  const toggleAI = () => setAiOpen(prev => !prev);

  return (
    <Router>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onToggleAI={toggleAI} 
        isDarkMode={isDarkMode} 
        onToggleTheme={toggleTheme} 
      />

      <Routes>

        {/* ================= HOME ================= */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to={defaultDashboard} /> : <Home user={user} />
          }
        />

        {/* ================= AUTH ================= */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={defaultDashboard} /> : <Login onLogin={handleLogin} />
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to={defaultDashboard} /> : <Register onLogin={handleLogin} />
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= OFFRES ================= */}
        <Route
          path="/offres"
          element={<PrivateRoute><Offres user={user} /></PrivateRoute>}
        />

        <Route
          path="/offres/new"
          element={<PrivateRoute><OffreForm user={user} /></PrivateRoute>}
        />

        <Route
          path="/offres/:id"
          element={<PrivateRoute><OffreDetail user={user} /></PrivateRoute>}
        />

        <Route
          path="/offres/:id/edit"
          element={<PrivateRoute><OffreForm user={user} /></PrivateRoute>}
        />

        {/* ================= AIDE ================= */}
        <Route
          path="/aide"
          element={
            <PrivateRoute>
              {user?.role === 'admin' ? <Navigate to="/admin" /> : <Aide user={user} />}
            </PrivateRoute>
          }
        />

        {/* ================= PROFIL ================= */}
        <Route
          path="/profil"
          element={<PrivateRoute><Profil user={user} /></PrivateRoute>}
        />

        <Route
          path="/profil/edit"
          element={<PrivateRoute><ProfilForm user={user} /></PrivateRoute>}
        />

        {/* compatibilité guide */}
        <Route
          path="/profil/modifier"
          element={<PrivateRoute><ProfilForm user={user} /></PrivateRoute>}
        />

        {/* Profil public (pour recruteur qui veut voir un candidat) */}
        <Route
          path="/profil/:id"
          element={<PrivateRoute><ProfilPublic /></PrivateRoute>}
        />

        {/* ================= CANDIDATURES ================= */}
        <Route
          path="/candidatures"
          element={<PrivateRoute><MesCandidatures user={user} /></PrivateRoute>}
        />

        {/* ================= RECRUTEUR ================= */}
        <Route
          path="/candidatures-reçues"
          element={<Navigate to="/candidatures-recues" replace />}
        />
        <Route
          path="/candidatures-recues"
          element={<PrivateRoute><CandidaturesRecruteur /></PrivateRoute>}
        />

        <Route
          path="/messages"
          element={<PrivateRoute><Messages user={user} /></PrivateRoute>}
        />

        {/* ================= PORTFOLIO (ARTISAN) ================= */}
        <Route
          path="/portfolio"
          element={<PrivateRoute roles={['artisan']}><Portfolio user={user} /></PrivateRoute>}
        />

        <Route
          path="/portfolio/public/:userId"
          element={<PrivateRoute><PortfolioPublic /></PrivateRoute>}
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>}
        />
        

        {/* ================= 404 ================= */}
        <Route path="*" element={
          <div className="not-found-page">
            <h1>404</h1>
            <p>{t('app.not_found_message', "La page que vous recherchez n'existe pas.")}</p>
            <Link to={isAuthenticated ? defaultDashboard : '/'} className="btn btn-primary">
              {isAuthenticated ? t('app.back_dashboard', 'Retour au tableau de bord') : t('app.back_home', "Retour à l'accueil")}
            </Link>
          </div>
        } />

      </Routes>

      {/* ================= ASSISTANT IA GLOBAL ================= */}
      {user && role !== 'admin' && (
        <>
          <AIAssistant user={user} isOpen={aiOpen} onClose={() => setAiOpen(false)} />
          {!aiOpen && (
            <button className="ai-fab" onClick={toggleAI} aria-label="Ouvrir l'assistant IA">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8"/>
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M7 12h2m6 0h2"/>
                <path d="M9 17c.85.63 1.885 1 3 1s2.15-.37 3-1"/>
              </svg>
              <span className="ai-fab__pulse"></span>
            </button>
          )}
        </>
      )}
    </Router>
  );
}

