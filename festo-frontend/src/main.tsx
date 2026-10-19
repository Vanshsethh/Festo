import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import './index.css';

// Festo is intentionally dark-first; there is no alternate theme to toggle.
document.documentElement.classList.add('dark');

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Root element was not found.');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
