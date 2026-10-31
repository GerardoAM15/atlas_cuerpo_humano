import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { FUTURO_ROUTER } from './components/rutas';
import './index.css';

const raiz = document.getElementById('root');
if (!raiz) throw new Error('No se encontró el elemento #root');

createRoot(raiz).render(
  <StrictMode>
    <HashRouter future={FUTURO_ROUTER}>
      <App />
    </HashRouter>
  </StrictMode>,
);
