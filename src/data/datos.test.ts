import { describe, expect, it } from 'vitest';
import { ArchivoEstructuras } from './esquemas';
import { ESTRUCTURAS, MANIFEST, POR_ID, estructurasDe } from './catalogo';
import { REGIONES } from './regiones';
import esqueletico from './estructuras/esqueletico.json';

describe('datos de estructuras', () => {
  it('el JSON del esqueleto cumple el esquema Zod', () => {
    const res = ArchivoEstructuras.safeParse(esqueletico);
    expect(res.success ? [] : res.error.issues.slice(0, 5)).toEqual([]);
  });

  it('los ids son únicos en todos los sistemas', () => {
    const ids = ESTRUCTURAS.map((e) => e.id);
    expect(ids.length - new Set(ids).size).toBe(0);
  });

  it('el sistema esquelético tiene los 206 huesos', () => {
    expect(estructurasDe('esqueletico').filter((e) => e.tipo === 'hueso')).toHaveLength(206);
  });

  it('cada nodoModelo existe en el manifest como estructura disponible', () => {
    for (const e of ESTRUCTURAS) {
      const entradas = MANIFEST.sistemas[e.sistema]?.estructuras ?? [];
      const m = entradas.find((x) => x.id === e.id);
      if (e.nodoModelo === null) {
        // Sin modelo: debe figurar como pendiente (no se inventa geometría).
        expect(m?.estado, e.id).toBe('pendiente');
      } else {
        expect(m?.estado, e.id).toBe('disponible');
        expect(entradas.some((x) => x.nodo === e.nodoModelo), e.id).toBe(true);
      }
    }
  });

  it('toda estructura del manifest tiene ficha de datos', () => {
    for (const [sistema, s] of Object.entries(MANIFEST.sistemas)) {
      for (const m of s.estructuras) expect(POR_ID.has(m.id), `${sistema}/${m.id}`).toBe(true);
    }
  });

  it('las relaciones y articulaciones apuntan a ids válidos y no a sí mismas', () => {
    const rotas: string[] = [];
    for (const e of ESTRUCTURAS) {
      const destinos = [...e.relaciones, ...('articulaciones' in e && e.articulaciones ? e.articulaciones.flatMap((a) => a.con) : [])];
      for (const r of destinos) if (!POR_ID.has(r) || r === e.id) rotas.push(`${e.id} → ${r}`);
    }
    expect(rotas).toEqual([]);
  });

  it('las articulaciones son recíprocas entre huesos', () => {
    const faltan: string[] = [];
    for (const e of ESTRUCTURAS) {
      if (e.tipo !== 'hueso') continue;
      for (const otro of e.articulaciones.flatMap((a) => a.con)) {
        const o = POR_ID.get(otro);
        if (o?.tipo === 'hueso' && !o.articulaciones.some((a) => a.con.includes(e.id))) faltan.push(`${e.id} ↔ ${otro}`);
      }
    }
    expect(faltan).toEqual([]);
  });

  it('cada región pertenece al catálogo de regiones de su sistema', () => {
    for (const e of ESTRUCTURAS) {
      expect(REGIONES[e.sistema]?.map((r) => r.id), e.id).toContain(e.region);
    }
  });

  it('las estructuras pares están completas (derecha e izquierda)', () => {
    for (const e of ESTRUCTURAS.filter((x) => x.lado)) {
      const pareja = e.id.replace(/-(d|i)$/, (_, s: string) => (s === 'd' ? '-i' : '-d'));
      expect(POR_ID.has(pareja), e.id).toBe(true);
    }
  });
});
