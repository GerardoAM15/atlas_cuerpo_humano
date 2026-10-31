// Resuelve la configuración de un sistema contra los OBJ disponibles de BodyParts3D.
import { geometriaObj } from './bodyparts3d.mjs';

/**
 * @typedef {{ elemento: string, fma: string, nombre: string, bytes: number }} Elemento
 * @typedef {{ id: string, tipo: string, elementos: Elemento[], revisar?: string }} EstructuraResuelta
 * @typedef {{ id: string, tipo: string, motivo: string }} EstructuraPendiente
 */

/**
 * @param {import('../config/esqueletico.mjs').EstructuraConfig[]} estructuras
 * @param {Map<string, Elemento[]>} indice  índice por nombre inglés (en minúsculas)
 * @returns {{ resueltas: EstructuraResuelta[], pendientes: EstructuraPendiente[] }}
 */
export function resolver(estructuras, indice) {
  const ids = new Set();
  const elementosUsados = new Map();
  const resueltas = [];
  const pendientes = [];

  for (const e of estructuras) {
    if (ids.has(e.id)) throw new Error(`Id duplicado en la configuración: ${e.id}`);
    ids.add(e.id);

    if (e.pendiente || !e.fuente?.length) {
      pendientes.push({ id: e.id, tipo: e.tipo, motivo: e.pendiente ?? 'Sin fuente definida.' });
      continue;
    }

    const elementos = [];
    const faltan = [];
    for (const nombre of e.fuente) {
      const candidatos = indice.get(nombre.toLowerCase());
      if (!candidatos?.length) {
        faltan.push(nombre);
        continue;
      }
      elementos.push(...descartarDuplicados(candidatos));
    }

    if (faltan.length) {
      // No se inventa: la estructura queda pendiente y se informa.
      pendientes.push({ id: e.id, tipo: e.tipo, motivo: `No se encontró en BodyParts3D: ${faltan.join(', ')}` });
      continue;
    }

    for (const el of elementos) {
      const previo = elementosUsados.get(el.elemento);
      if (previo) throw new Error(`El elemento ${el.elemento} está asignado a ${previo} y a ${e.id}`);
      elementosUsados.set(el.elemento, e.id);
    }
    resueltas.push({ id: e.id, tipo: e.tipo, elementos, ...(e.revisar ? { revisar: e.revisar } : {}) });
  }
  return { resueltas, pendientes };
}

/** Algunos conceptos tienen varios OBJ con geometría idéntica (p. ej. el hioides): se usa uno. */
function descartarDuplicados(candidatos) {
  if (candidatos.length < 2) return candidatos;
  const vistos = new Set();
  return candidatos
    .slice()
    .sort((a, b) => a.elemento.localeCompare(b.elemento))
    .filter((c) => {
      const geo = geometriaObj(c.elemento);
      if (vistos.has(geo)) return false;
      vistos.add(geo);
      return true;
    });
}
