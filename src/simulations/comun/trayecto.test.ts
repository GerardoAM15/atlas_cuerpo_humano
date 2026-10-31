import { describe, expect, it } from 'vitest';
import { crearTrayecto } from './trayecto';

describe('crearTrayecto', () => {
  const t = crearTrayecto([
    [0, 0],
    [10, 0],
    [10, 10],
  ]);

  it('mide la longitud total', () => expect(t.total).toBe(20));

  it('interpola por longitud de arco', () => {
    expect(t.en(0)).toEqual([0, 0]);
    expect(t.en(0.25)).toEqual([5, 0]);
    expect(t.en(0.75)).toEqual([10, 5]);
    expect(t.en(1)).toEqual([10, 10]);
  });

  it('recorta fuera de [0, 1] y localiza vértices', () => {
    expect(t.en(2)).toEqual([10, 10]);
    expect(t.fraccionDeVertice(1)).toBe(0.5);
  });
});
