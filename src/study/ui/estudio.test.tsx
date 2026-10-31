import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { FUTURO_ROUTER } from '@/components/rutas';
import Estudio from '@/pages/Estudio';
import { useProgresoStore } from '../progreso';
import { fechaLocal } from '../sm2';

const renderEstudio = () =>
  render(
    <MemoryRouter future={FUTURO_ROUTER}>
      <Estudio />
    </MemoryRouter>,
  );

describe('página del modo estudio', () => {
  beforeEach(() => useProgresoStore.getState().reiniciarProgreso());

  it('muestra los modos y el panel de progreso vacío', () => {
    renderEstudio();
    expect(screen.getByRole('heading', { level: 1, name: 'Modo estudio' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quiz/ })).toHaveAttribute('href', '/estudio/quiz');
    expect(screen.getByText('No tienes repasos pendientes hoy.')).toBeInTheDocument();
    expect(screen.getByText(/Aún no hay fallos registrados/)).toBeInTheDocument();
  });

  it('refleja el progreso registrado: racha, pendientes y estructuras difíciles', () => {
    const hoy = fechaLocal();
    useProgresoStore.getState().registrar('femur', 1, hoy);
    useProgresoStore.getState().registrar('tibia', 5, hoy);
    renderEstudio();
    expect(screen.getByText('1 día')).toBeInTheDocument();
    const dificiles = screen.getByRole('heading', { name: 'Estructuras difíciles' }).parentElement!;
    expect(within(dificiles).getByText('Fémur')).toBeInTheDocument();
    expect(within(dificiles).queryByText('Tibia')).not.toBeInTheDocument();
  });

  it('pide confirmación antes de borrar el progreso', () => {
    useProgresoStore.getState().registrar('femur', 5, fechaLocal());
    renderEstudio();
    const original = window.confirm;
    window.confirm = () => true;
    fireEvent.click(screen.getByRole('button', { name: 'Borrar el progreso' }));
    window.confirm = original;
    expect(useProgresoStore.getState().tarjetas).toEqual({});
  });
});
