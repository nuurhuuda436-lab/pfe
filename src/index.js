import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/base/variables.css';
import './styles/base/dark-theme.css';
import './styles/base/reset.css';
import './styles/base/layout.css';
import './styles/utils/animations.css';
import './styles/ui/tables.css';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);