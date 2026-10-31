import { describe, expect, it } from 'vitest';
import { CAPACIDADES, DURACION_ESPIROMETRIA, GASES, VOL, estadoResp, ventilacion, volumen } from './modelo';

describe('volúmenes y capacidades', () => {
  it('las capacidades son sumas de volúmenes', () => {
    expect(CAPACIDADES.ci).toBe(VOL.vt + VOL.vri);
    expect(CAPACIDADES.crf).toBe(VOL.vre + VOL.vr);
    expect(CAPACIDADES.cv).toBe(4800);
    expect(CAPACIDADES.cpt).toBe(CAPACIDADES.cv + VOL.vr);
    expect(CAPACIDADES.cpt).toBe(6000);
  });
});

describe('respiración en reposo', () => {
  const m = Array.from({ length: 500 }, (_, i) => volumen((i / 500) * 5, 'reposo', 12));

  it('oscila entre la CRF y la CRF + VT', () => {
    const v = m.map((x) => x.v);
    expect(Math.min(...v)).toBeCloseTo(CAPACIDADES.crf, 0);
    expect(Math.max(...v)).toBeCloseTo(CAPACIDADES.crf + VOL.vt, 0);
  });

  it('la inspiración dura aprox. la mitad que la espiración (I:E ≈ 1:2)', () => {
    const insp = m.filter((x) => x.fase === 'inspiracion').length;
    const esp = m.filter((x) => x.fase === 'espiracion').length;
    expect(esp / insp).toBeCloseTo(2, 0);
  });

  it('la presión alveolar es negativa al inspirar y positiva al espirar', () => {
    expect(estadoResp(0.8, 'reposo', 12).presionAlveolar).toBeLessThan(0);
    expect(estadoResp(3, 'reposo', 12).presionAlveolar).toBeGreaterThan(0);
  });

  it('la presión pleural es siempre negativa en reposo', () => {
    for (let t = 0; t < 5; t += 0.1) expect(estadoResp(t, 'reposo', 12).presionPleural).toBeLessThan(0);
  });
});

describe('espirometría', () => {
  const m = Array.from({ length: 1000 }, (_, i) => volumen((i / 1000) * DURACION_ESPIROMETRIA, 'espirometria'));

  it('llega a la CPT en la inspiración máxima y se acerca al VR en la espiración forzada', () => {
    const v = m.map((x) => x.v);
    expect(Math.max(...v)).toBeCloseTo(CAPACIDADES.cpt, -1);
    expect(Math.min(...v)).toBeLessThan(VOL.vr + 100);
    expect(Math.min(...v)).toBeGreaterThanOrEqual(VOL.vr - 1);
  });

  it('el volumen nunca baja del volumen residual', () => {
    for (const x of m) expect(x.v).toBeGreaterThanOrEqual(VOL.vr - 1);
  });
});

describe('ventilación e intercambio', () => {
  it('ventilación minuto 6 l/min y alveolar 4,2 l/min a 12 rpm', () => {
    expect(ventilacion(12)).toEqual({ minuto: 6000, alveolar: 4200 });
  });

  it('los gradientes impulsan el O₂ hacia la sangre y el CO₂ hacia el alvéolo', () => {
    expect(GASES.alveolo.o2).toBeGreaterThan(GASES.sangreVenosa.o2);
    expect(GASES.sangreVenosa.co2).toBeGreaterThan(GASES.alveolo.co2);
  });
});

describe('espiración forzada', () => {
  it('el FEV1/FVC está en el rango normal (0,70–0,85)', () => {
    const inicio = volumen(18, 'espirometria').v;
    const unSegundo = volumen(19, 'espirometria').v;
    const fev1 = inicio - unSegundo;
    expect(fev1 / CAPACIDADES.cv).toBeGreaterThan(0.7);
    expect(fev1 / CAPACIDADES.cv).toBeLessThan(0.85);
  });
});
