import { describe, expect, it } from 'vitest';
import { EF_MINIMO, diasEntre, dominada, nuevoEf, pendiente, repasar, sumarDias, tarjetaNueva } from './sm2';

const HOY = '2026-01-10';

describe('SM-2: intervalos', () => {
  it('primer acierto → 1 día, segundo → 6 días, tercero → 6 × EF', () => {
    let t = tarjetaNueva(HOY);
    t = repasar(t, 5, HOY);
    expect(t.intervalo).toBe(1);
    expect(t.proxima).toBe('2026-01-11');
    t = repasar(t, 5, t.proxima);
    expect(t.intervalo).toBe(6);
    const ef = t.ef;
    t = repasar(t, 5, t.proxima);
    expect(t.intervalo).toBe(Math.round(6 * ef));
    expect(t.repeticiones).toBe(3);
  });

  it('un fallo reinicia la serie: intervalo 1 y repeticiones 0', () => {
    let t = tarjetaNueva(HOY);
    t = repasar(t, 5, HOY);
    t = repasar(t, 4, sumarDias(HOY, 1));
    t = repasar(t, 1, sumarDias(HOY, 7));
    expect(t.repeticiones).toBe(0);
    expect(t.intervalo).toBe(1);
    expect(t.fallos).toBe(1);
    expect(t.aciertos).toBe(2);
  });

  it('una calidad de 3 cuenta como acierto', () => {
    const t = repasar(tarjetaNueva(HOY), 3, HOY);
    expect(t.repeticiones).toBe(1);
  });
});

describe('SM-2: factor de facilidad', () => {
  it('sigue la fórmula de SM-2', () => {
    expect(nuevoEf(2.5, 5)).toBeCloseTo(2.6, 6);
    expect(nuevoEf(2.5, 4)).toBeCloseTo(2.5, 6);
    expect(nuevoEf(2.5, 3)).toBeCloseTo(2.36, 6);
    expect(nuevoEf(2.5, 0)).toBeCloseTo(1.7, 6);
  });

  it('nunca baja de 1,3', () => {
    let t = tarjetaNueva(HOY);
    for (let i = 0; i < 20; i++) t = repasar(t, 0, HOY);
    expect(t.ef).toBe(EF_MINIMO);
  });
});

describe('fechas, dominio y pendientes', () => {
  it('suma días cruzando meses y años', () => {
    expect(sumarDias('2026-01-30', 3)).toBe('2026-02-02');
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(diasEntre('2026-02-27', '2026-03-01')).toBe(2);
  });

  it('una tarjeta está dominada tras dos aciertos seguidos y pendiente si su fecha llegó', () => {
    let t = repasar(tarjetaNueva(HOY), 5, HOY);
    expect(dominada(t)).toBe(false);
    t = repasar(t, 5, t.proxima);
    expect(dominada(t)).toBe(true);
    expect(pendiente(t, HOY)).toBe(false);
    expect(pendiente(t, t.proxima)).toBe(true);
  });
});
