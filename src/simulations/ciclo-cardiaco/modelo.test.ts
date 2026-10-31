import { describe, expect, it } from 'vitest';
import { ORDEN_FASES, PRESIONES, VOLUMENES, estado, eventos, indices, tramos } from './modelo';

const muestras = (fc: number, n = 400) => Array.from({ length: n }, (_, i) => estado((i / n) * (60 / fc), fc));

describe('ciclo cardíaco: fases', () => {
  it.each([40, 75, 120, 180])('las fases cubren exactamente el periodo a %i lpm y están en orden', (fc) => {
    const ts = tramos(fc);
    expect(ts.map((t) => t.fase)).toEqual(ORDEN_FASES);
    expect(ts.at(-1)!.fin).toBeCloseTo(60 / fc, 6);
    for (const t of ts) expect(t.fin).toBeGreaterThanOrEqual(t.inicio);
  });

  it('al subir la frecuencia se acorta sobre todo la diástole', () => {
    const dur = (fc: number, f: string) => {
      const t = tramos(fc).find((x) => x.fase === f)!;
      return t.fin - t.inicio;
    };
    const sistole = (fc: number) => dur(fc, 'contraccion-isovolumetrica') + dur(fc, 'eyeccion');
    const diastole = (fc: number) => 60 / fc - sistole(fc);
    expect(diastole(60) / diastole(120)).toBeGreaterThan(sistole(60) / sistole(120));
  });
});

describe('ciclo cardíaco: volúmenes y presiones', () => {
  const m = muestras(75);

  it('el volumen del VI va de VTS (50 ml) a VTD (120 ml)', () => {
    const vols = m.map((e) => e.volumenVI);
    expect(Math.max(...vols)).toBeCloseTo(VOLUMENES.vtd, 0);
    expect(Math.min(...vols)).toBeCloseTo(VOLUMENES.vts, 0);
  });

  it('la presión aórtica oscila aproximadamente entre 80 y 120 mmHg', () => {
    const p = m.map((e) => e.presionAorta);
    expect(Math.max(...p)).toBeCloseTo(PRESIONES.aorticaSistolica, 0);
    expect(Math.min(...p)).toBeGreaterThan(PRESIONES.aorticaDiastolica - 2);
  });

  it('el volumen no cambia en las fases isovolumétricas', () => {
    for (const e of m.filter((x) => x.fase.endsWith('isovolumetrica'))) {
      expect(e.volumenVI === VOLUMENES.vtd || e.volumenVI === VOLUMENES.vts).toBe(true);
    }
  });

  it('las semilunares solo se abren en la eyección y las AV nunca a la vez que ellas', () => {
    for (const e of m) {
      expect(e.semilunaresAbiertas).toBe(e.fase === 'eyeccion');
      expect(e.avAbiertas && e.semilunaresAbiertas).toBe(false);
    }
  });

  it('durante el llenado la presión ventricular es menor que la auricular (la mitral está abierta)', () => {
    for (const e of m.filter((x) => x.fase === 'llenado-rapido')) expect(e.presionVI).toBeLessThan(e.presionAI);
  });

  it('en la eyección la presión del VI supera a la aórtica diastólica', () => {
    for (const e of m.filter((x) => x.fase === 'eyeccion')) expect(e.presionVI).toBeGreaterThanOrEqual(PRESIONES.aorticaDiastolica - 0.01);
  });
});

describe('ciclo cardíaco: ECG y ruidos', () => {
  it('el QRS precede a la contracción y la onda T cae en la eyección', () => {
    const ev = eventos(75);
    const ts = tramos(75);
    const eye = ts.find((t) => t.fase === 'eyeccion')!;
    expect(ev.p).toBeLessThan(ev.r);
    expect(ev.r).toBeLessThan(ev.s1);
    expect(ev.t).toBeGreaterThan(eye.inicio);
    expect(ev.t).toBeLessThan(eye.fin);
    expect(ev.s1).toBeLessThan(ev.s2);
  });

  it('el pico R es el máximo del ECG', () => {
    const ev = eventos(75);
    const m = muestras(75, 2000);
    const max = m.reduce((a, b) => (b.ecg > a.ecg ? b : a));
    expect(max.tCiclo).toBeCloseTo(ev.r, 2);
  });
});

describe('índices', () => {
  it('volumen sistólico 70 ml, FE ≈ 58 % y gasto ≈ 5,25 l/min a 75 lpm', () => {
    const i = indices(75);
    expect(i.volumenSistolico).toBe(70);
    expect(i.fraccionEyeccion).toBeCloseTo(0.583, 2);
    expect(i.gastoCardiaco).toBeCloseTo(5.25, 2);
  });
});
