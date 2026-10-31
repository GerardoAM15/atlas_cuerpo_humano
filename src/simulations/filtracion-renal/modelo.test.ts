import { describe, expect, it } from 'vitest';
import { TFG_ML_MIN, TRAMOS, destino, flujoTubular, fraccionRestante } from './modelo';

const ultimo = TRAMOS.length - 1;

describe('nefrona', () => {
  it('se reabsorbe ≈ 99 % del agua filtrada: de ≈ 180 l/día queda ≈ 1,5–2 l de orina', () => {
    const resto = fraccionRestante('agua', ultimo);
    expect(resto).toBeCloseTo(0.01, 2);
    const orinaDia = (TFG_ML_MIN * 60 * 24 * resto) / 1000;
    expect(orinaDia).toBeGreaterThan(1);
    expect(orinaDia).toBeLessThan(2.5);
  });

  it('toda la glucosa filtrada se reabsorbe en el túbulo proximal', () => {
    const proximal = TRAMOS.findIndex((t) => t.id === 'proximal');
    expect(fraccionRestante('glucosa', proximal)).toBe(0);
  });

  it('el túbulo proximal reabsorbe más que ningún otro tramo', () => {
    const proximal = TRAMOS.find((t) => t.id === 'proximal')!;
    for (const t of TRAMOS) expect((t.reabsorbe.agua ?? 0) <= (proximal.reabsorbe.agua ?? 0)).toBe(true);
  });

  it('la rama ascendente reabsorbe Na⁺ pero no agua, y la descendente agua pero no Na⁺', () => {
    const asc = TRAMOS.find((t) => t.id === 'ascendente')!;
    const desc = TRAMOS.find((t) => t.id === 'descendente')!;
    expect(asc.reabsorbe.agua ?? 0).toBe(0);
    expect(asc.reabsorbe.sodio).toBeGreaterThan(0);
    expect(desc.reabsorbe.sodio ?? 0).toBe(0);
    expect(desc.reabsorbe.agua).toBeGreaterThan(0);
  });

  it('la urea se excreta en parte', () => {
    expect(fraccionRestante('urea', ultimo)).toBeGreaterThan(0.2);
  });

  it('el flujo tubular disminuye a lo largo de la nefrona', () => {
    for (let i = 1; i < TRAMOS.length; i++) expect(flujoTubular(i)).toBeLessThanOrEqual(flujoTubular(i - 1));
  });
});

describe('destino de las partículas', () => {
  it('las proteínas no se filtran y la glucosa se reabsorbe en el proximal', () => {
    expect(destino('proteina', 0.5)).toBe('no-filtra');
    for (const a of [0, 0.3, 0.99]) expect(destino('glucosa', a)).toBe(1);
  });

  it('el reparto del agua respeta las fracciones', () => {
    const n = 10000;
    const d = Array.from({ length: n }, (_, i) => destino('agua', i / n));
    expect(d.filter((x) => x === 'orina').length / n).toBeCloseTo(0.01, 2);
    expect(d.filter((x) => x === 1).length / n).toBeCloseTo(0.65, 2);
  });
});
