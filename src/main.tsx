import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

// Import Design System
import './styles/global.css';

// Import CMS Provider
import { CMSProvider } from './context/CMSContext';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <CMSProvider>
          <App />
        </CMSProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}
