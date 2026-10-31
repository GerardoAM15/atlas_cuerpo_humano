// Resuelve la configuración de un sistema contra los OBJ disponibles de BodyParts3D.
import { geometriaObj } from './bodyparts3d.mjs';

/**
 * @typedef {{ elemento: string, fma: string, nombre: string, bytes: number }} Elemento
 * @typedef {{ id: string, tipo: string, elementos: Elemento[], material?: string, revisar?: string }} EstructuraResuelta
 * @typedef {{ id: string, tipo: string, motivo: string }} EstructuraPendiente
 */

/**
 * Cada nombre de la fuente se resuelve, por orden: 1) como elemento (cabecera del OBJ);
 * 2) como concepto compuesto (lista de elementos de *_element_parts.txt).
 * @param {import('../config/esqueletico.mjs').EstructuraConfig[]} estructuras
 * @param {Map<string, Elemento[]>} indice  índice por nombre inglés (en minúsculas)
 * @param {Map<string, { fma: string, elementos: string[] }>} [compuestos]
 * @returns {{ resueltas: EstructuraResuelta[], pendientes: EstructuraPendiente[] }}
 */
export function resolver(estructuras, indice, compuestos = new Map()) {
  const porElemento = new Map([...indice.values()].flat().map((el) => [el.elemento, el]));
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
      if (candidatos?.length) {
        elementos.push(...descartarDuplicados(candidatos));
        continue;
      }
      const compuesto = compuestos.get(nombre.toLowerCase());
      const deCompuesto = (compuesto?.elementos ?? []).map((fj) => porElemento.get(fj)).filter(Boolean);
      if (compuesto && deCompuesto.length === compuesto.elementos.length) {
        // El FMA del concepto compuesto representa a la estructura completa.
        elementos.push(...deCompuesto.map((el) => ({ ...el, fmaCompuesto: compuesto.fma, nombreCompuesto: nombre })));
        continue;
      }
      faltan.push(compuesto ? `${nombre} (faltan ${compuesto.elementos.length - deCompuesto.length} mallas)` : nombre);
    }

    if (faltan.length) {
      // No se inventa: la estructura queda pendiente y se informa.
      pendientes.push({ id: e.id, tipo: e.tipo, motivo: `No se encontró en BodyParts3D: ${faltan.join(', ')}` });
      continue;
    }

    // Un mismo FJ puede figurar en ambos árboles o bajo dos nombres de la fuente: se usa una vez.
    const unicos = elementos.filter((el, i) => elementos.findIndex((o) => o.elemento === el.elemento) === i);
    for (const el of unicos) {
      const previo = elementosUsados.get(el.elemento);
      if (previo) throw new Error(`El elemento ${el.elemento} está asignado a ${previo} y a ${e.id}`);
      elementosUsados.set(el.elemento, e.id);
    }
    resueltas.push({
      id: e.id,
      tipo: e.tipo,
      elementos: unicos,
      ...(e.material ? { material: e.material } : {}),
      ...(e.revisar ? { revisar: e.revisar } : {}),
    });
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
      const geo = geometriaObj(c.ruta);
      if (vistos.has(geo)) return false;
      vistos.add(geo);
      return true;
    });
}
