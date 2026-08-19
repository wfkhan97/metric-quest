import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installGlobalErrorTracking } from './lib/analytics';
import './styles.css';

installGlobalErrorTracking();

const root = document.getElementById('root');

if (!root) {
  throw new Error('Metric Quest could not find its application root.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
