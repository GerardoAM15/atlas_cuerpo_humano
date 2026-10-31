import { describe, expect, it } from 'vitest';
import { AXON_MM, CICLO_PA, INTERNODO_MM, POTENCIALES, VELOCIDAD, pasoSinapsis, posicionImpulso, potencialAccion } from './modelo';

const m = Array.from({ length: 2000 }, (_, i) => ({ t: (i / 2000) * CICLO_PA, ...potencialAccion((i / 2000) * CICLO_PA) }));

describe('potencial de acción', () => {
  it('parte del reposo (−70 mV), alcanza +30 mV y se hiperpolariza hasta −80 mV', () => {
    const v = m.map((x) => x.potencial);
    expect(m[0]!.potencial).toBe(POTENCIALES.reposo);
    expect(Math.max(...v)).toBeCloseTo(POTENCIALES.pico, 0);
    expect(Math.min(...v)).toBeCloseTo(POTENCIALES.hiperpolarizacion, 0);
  });

  it('la despolarización empieza al alcanzar el umbral (−55 mV)', () => {
    const primera = m.find((x) => x.fase === 'despolarizacion')!;
    expect(primera.potencial).toBeCloseTo(POTENCIALES.umbral, 0);
  });

  it('los canales de Na⁺ se abren en la despolarización y se inactivan en la repolarización', () => {
    for (const x of m) {
      if (x.fase === 'despolarizacion') expect(x.canalNa).toBe('abierto');
      if (x.fase === 'repolarizacion') expect(x.canalNa).toBe('inactivado');
      if (x.fase === 'reposo') expect(x.canalNa).toBe('cerrado');
    }
  });

  it('los canales de K⁺ están abiertos durante la repolarización', () => {
    for (const x of m.filter((y) => y.fase === 'repolarizacion')) expect(x.canalK).toBe('abierto');
  });

  it('el periodo refractario absoluto precede al relativo', () => {
    const abs = m.filter((x) => x.refractario === 'absoluto').map((x) => x.t);
    const rel = m.filter((x) => x.refractario === 'relativo').map((x) => x.t);
    expect(Math.max(...abs)).toBeLessThan(Math.min(...rel));
  });
});

describe('conducción', () => {
  it('la fibra mielinizada conduce mucho más rápido', () => {
    expect(posicionImpulso(1, true)).toBeGreaterThan(posicionImpulso(1, false) * 10);
    expect(VELOCIDAD.conMielina / VELOCIDAD.sinMielina).toBeGreaterThanOrEqual(10);
  });

  it('en la fibra mielinizada el impulso salta de nódulo en nódulo', () => {
    for (let t = 0; t < 2; t += 0.013) expect(posicionImpulso(t, true) % INTERNODO_MM).toBe(0);
  });

  it('el impulso no supera la longitud del axón', () => {
    expect(posicionImpulso(2.4, true)).toBeLessThanOrEqual(AXON_MM);
  });
});

describe('sinapsis', () => {
  it('recorre los pasos en orden', () => {
    expect(pasoSinapsis(0).indice).toBe(0);
    expect(pasoSinapsis(1.6).indice).toBe(1);
    expect(pasoSinapsis(8.9).indice).toBe(5);
  });
});
