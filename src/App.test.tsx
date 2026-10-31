import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { FUTURO_ROUTER } from './components/rutas';

const renderEn = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]} future={FUTURO_ROUTER}>
      <App />
    </MemoryRouter>,
  );

describe('router', () => {
  it('muestra la página de inicio', () => {
    renderEn('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Atlas 3D interactivo/);
    expect(screen.getAllByRole('link', { name: 'Atlas 3D' }).length).toBeGreaterThan(0);
  });

  it.each([
    ['/simulaciones', /Simulaciones fisiológicas/],
    ['/estudio', /Modo estudio/],
    ['/creditos', /Créditos y licencias/],
    ['/no-existe', /Página no encontrada/],
    ['/simulaciones/no-existe', /Página no encontrada/],
  ])('ruta %s', (ruta, titulo) => {
    renderEn(ruta);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(titulo);
  });
});
