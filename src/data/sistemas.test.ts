import { describe, expect, it } from 'vitest';
import { SISTEMAS, SISTEMAS_POR_ID } from './sistemas';

describe('catálogo de sistemas', () => {
  it('incluye los 11 sistemas del alcance', () => {
    expect(SISTEMAS).toHaveLength(11);
  });

  it('tiene ids únicos e indexados', () => {
    const ids = SISTEMAS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SISTEMAS) expect(SISTEMAS_POR_ID[s.id]).toBe(s);
  });

  it('cada sistema tiene nombre en español, latín e inglés y un color hex', () => {
    for (const s of SISTEMAS) {
      expect(s.nombre.length).toBeGreaterThan(0);
      expect(s.latin.length).toBeGreaterThan(0);
      expect(s.ingles.length).toBeGreaterThan(0);
      expect(s.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
