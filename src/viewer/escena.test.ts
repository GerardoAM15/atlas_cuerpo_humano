import { describe, expect, it } from 'vitest';
import { centroDe } from '@/data/catalogo';
import { cajaDeSistemas, desplazamientosExplosion, distanciaEncuadre, pinesDeRegion, planoCorte, unirCajas } from './escena';

const distancia = ({ normal, constante }: ReturnType<typeof planoCorte>, p: [number, number, number]) =>
  normal[0] * p[0] + normal[1] * p[1] + normal[2] * p[2] + constante;

describe('planoCorte', () => {
  it('sagital sin invertir conserva el lado derecho del paciente (−X)', () => {
    const plano = planoCorte('sagital', 0, false);
    expect(distancia(plano, [-0.1, 1, 0])).toBeGreaterThan(0);
    expect(distancia(plano, [0.1, 1, 0])).toBeLessThan(0);
  });

  it('invertir conserva el lado opuesto', () => {
    const plano = planoCorte('sagital', 0, true);
    expect(distancia(plano, [0.1, 1, 0])).toBeGreaterThan(0);
  });

  it('transversal en y = 1 conserva lo que está por debajo', () => {
    const plano = planoCorte('transversal', 1, false);
    expect(distancia(plano, [0, 0.5, 0])).toBeGreaterThan(0);
    expect(distancia(plano, [0, 1.5, 0])).toBeLessThan(0);
  });
});

describe('cajas y encuadre', () => {
  it('une cajas', () => {
    expect(
      unirCajas([
        { min: [0, 0, 0], max: [1, 1, 1] },
        { min: [-1, 0.5, 0], max: [0.5, 2, 1] },
      ]),
    ).toEqual({ min: [-1, 0, 0], max: [1, 2, 1] });
  });

  it('el esqueleto mide entre 1,5 y 1,9 m', () => {
    const c = cajaDeSistemas(['esqueletico'])!;
    expect(c.max[1] - c.min[1]).toBeGreaterThan(1.5);
    expect(c.max[1] - c.min[1]).toBeLessThan(1.9);
  });

  it('la distancia de encuadre crece con el tamaño', () => {
    const peq = distanciaEncuadre({ min: [0, 0, 0], max: [0.1, 0.1, 0.1] }, 40);
    const gra = distanciaEncuadre({ min: [0, 0, 0], max: [1, 1, 1] }, 40);
    expect(gra).toBeGreaterThan(peq);
  });
});

describe('explosión', () => {
  it('con factor 0 no desplaza nada', () => {
    expect(desplazamientosExplosion('esqueletico', 'craneo', 0).size).toBe(0);
  });

  it('aleja cada hueso del cráneo del centro de la región', () => {
    const d = desplazamientosExplosion('esqueletico', 'craneo', 1);
    expect(d.size).toBe(22);
    // El parietal derecho (−X) se desplaza hacia −X; el izquierdo hacia +X.
    expect(d.get('parietal-d')![0]).toBeLessThan(0);
    expect(d.get('parietal-i')![0]).toBeGreaterThan(0);
    // La mandíbula baja.
    expect(d.get('mandibula')![1]).toBeLessThan(0);
    expect(centroDe('mandibula')).not.toBeNull();
  });
});

describe('pines', () => {
  it('muestra solo estructuras con modelo de la región', () => {
    const pines = pinesDeRegion('craneo', null);
    expect(pines).toHaveLength(22);
    expect(pinesDeRegion('oido-medio', null)).toHaveLength(0);
  });

  it('con una selección lateral, filtra por su lado', () => {
    const pines = pinesDeRegion('mano', 'escafoides-d');
    expect(pines.length).toBe(27);
    expect(pines.every((p) => p.lado === 'derecho')).toBe(true);
  });
});
