import { describe, expect, it } from 'vitest';
import { CICLO_MUSCULO, FILAMENTO, G, PALANCA, estadoMusculo, fuerzaBiceps, sarcomero, ventajaMecanica } from './modelo';

describe('filamentos deslizantes', () => {
  it('la banda A no cambia; la banda I y la zona H se acortan', () => {
    const r = sarcomero(0);
    const c = sarcomero(1);
    expect(c.bandaA).toBe(r.bandaA);
    expect(c.bandaA).toBe(FILAMENTO.grueso);
    expect(c.bandaI).toBeLessThan(r.bandaI);
    expect(c.zonaH).toBeLessThan(r.zonaH);
    expect(c.zonaH).toBeGreaterThanOrEqual(0);
  });

  it('los filamentos no cambian de longitud: solo se solapan más', () => {
    for (const a of [0, 0.5, 1]) {
      const s = sarcomero(a);
      expect(s.longitud).toBeCloseTo(s.bandaA + s.bandaI, 6);
    }
  });
});

describe('secuencia de la contracción', () => {
  const m = Array.from({ length: 800 }, (_, i) => estadoMusculo((i / 800) * CICLO_MUSCULO));

  it('no hay contracción sin Ca²⁺', () => {
    for (const e of m) if (e.activacion > 0.01) expect(e.calcio).toBeGreaterThan(0);
  });

  it('la excitación precede a la liberación de Ca²⁺ y esta a los puentes cruzados', () => {
    const primera = (f: string) => m.findIndex((e) => e.fase === f);
    expect(primera('excitacion')).toBeLessThan(primera('calcio'));
    expect(primera('calcio')).toBeLessThan(primera('puentes'));
    expect(primera('puentes')).toBeLessThan(primera('relajacion'));
  });

  it('el ciclo de puentes cruzados solo ocurre en la fase de contracción', () => {
    for (const e of m) expect(e.puente !== null).toBe(e.fase === 'puentes');
  });
});

describe('palanca del codo', () => {
  it('es de tercer género: ventaja mecánica menor que 1', () => {
    expect(ventajaMecanica()).toBeLessThan(1);
    expect(ventajaMecanica()).toBeCloseTo(PALANCA.brazoBiceps / PALANCA.brazoCarga, 6);
  });

  it('con el antebrazo horizontal, el bíceps hace ≈ 8,75 veces el peso de la carga', () => {
    expect(fuerzaBiceps(1, 90)).toBeCloseTo(G * 8.75, 3);
  });

  it('la fuerza necesaria es máxima con el antebrazo horizontal (90°)', () => {
    expect(fuerzaBiceps(5, 90)).toBeGreaterThan(fuerzaBiceps(5, 45));
    expect(fuerzaBiceps(5, 90)).toBeGreaterThan(fuerzaBiceps(5, 120));
  });
});
