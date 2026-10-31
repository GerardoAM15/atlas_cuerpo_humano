import { Suspense } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FUTURO_ROUTER } from '@/components/rutas';
import { SIMULACIONES } from './catalogo';

describe.each(SIMULACIONES)('simulación $id', (sim) => {
  it('se renderiza con título, etiqueta «Esquemático», controles y pasos', async () => {
    const { Componente } = sim;
    render(
      <MemoryRouter future={FUTURO_ROUTER}>
        <Suspense fallback={null}>
          <Componente />
        </Suspense>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: sim.titulo })).toBeInTheDocument();
    expect(screen.getByText('Esquemático')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pausa|play/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Paso a paso' })).toBeInTheDocument();
  });
});

describe('controles', () => {
  it('Play/Pausa alterna el estado', async () => {
    const { Componente } = SIMULACIONES[0]!;
    render(
      <MemoryRouter future={FUTURO_ROUTER}>
        <Suspense fallback={null}>
          <Componente />
        </Suspense>
      </MemoryRouter>,
    );
    const boton = await screen.findByRole('button', { name: /pausa|play/i });
    const antes = boton.textContent;
    fireEvent.click(boton);
    expect(boton.textContent).not.toBe(antes);
  });
});
