import Fuse from 'fuse.js';
import type { Estructura } from './esquemas';

/** Quita acentos y diéresis y pasa a minúsculas: «Fémur» → «femur», «Cúbito» → «cubito». */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

interface Documento {
  id: string;
  nombre: string;
  latin: string;
  ingles: string;
}

/**
 * Buscador difuso en español, latín e inglés, insensible a acentos.
 * Los campos se normalizan antes de indexar y la consulta también, de modo que
 * «femur», «fémur» y «FEMUR» encuentran lo mismo.
 */
export function crearBuscador(estructuras: readonly Estructura[]) {
  const docs: Documento[] = estructuras.map((e) => ({
    id: e.id,
    nombre: normalizar(e.nombre),
    latin: normalizar(e.latin),
    ingles: normalizar(e.ingles),
  }));
  const porId = new Map(estructuras.map((e) => [e.id, e]));
  const fuse = new Fuse(docs, {
    keys: [
      { name: 'nombre', weight: 3 },
      { name: 'latin', weight: 2 },
      { name: 'ingles', weight: 2 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });

  return (consulta: string, limite = 10): Estructura[] => {
    const q = normalizar(consulta);
    if (q.length < 2) return [];
    return fuse
      .search(q, { limit: limite })
      .map((r) => porId.get(r.item.id))
      .filter((e): e is Estructura => Boolean(e));
  };
}
