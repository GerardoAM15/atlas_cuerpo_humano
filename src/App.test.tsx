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

  it('la portada no muestra etiquetas de fase y ofrece instalar y usar sin conexión', () => {
    renderEn('/');
    expect(screen.queryByText(/Fase \d/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Instalar/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Usar sin conexión' })).toBeInTheDocument();
  });

  it.each([
    ['/simulaciones', /Simulaciones fisiológicas/],
    ['/estudio', /Modo estudio/],
    ['/estudio/no-existe', /Página no encontrada/],
    ['/creditos', /Créditos y licencias/],
    ['/no-existe', /Página no encontrada/],
    ['/simulaciones/no-existe', /Página no encontrada/],
  ])('ruta %s', async (ruta, titulo) => {
    renderEn(ruta);
    // Algunas páginas se cargan de forma diferida.
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(titulo);
  });
});
