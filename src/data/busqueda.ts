import Fuse from 'fuse.js';
import type { ResumenEstructura } from './esquemas';
import { normalizar } from './texto';

// Este módulo (con Fuse.js) se carga de forma diferida al usar el buscador por primera vez.

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
export function crearBuscador(estructuras: readonly ResumenEstructura[]) {
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

  return (consulta: string, limite = 10): ResumenEstructura[] => {
    const q = normalizar(consulta);
    if (q.length < 2) return [];
    return fuse
      .search(q, { limit: limite })
      .map((r) => porId.get(r.item.id))
      .filter((e): e is ResumenEstructura => Boolean(e));
  };
}
