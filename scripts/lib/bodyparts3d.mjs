// Lectura de los datos de BodyParts3D 4.0 (árboles PART-OF e IS-A).
import fs from 'node:fs';
import path from 'node:path';
import { DIR_BP3D, DIR_BP3D_OBJ, DIR_BP3D_OBJ_ISA } from './rutas.mjs';

export const URL_BASE_BP3D = 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST';

export const ARCHIVOS_BP3D = [
  'README_e.html',
  'partof_parts_list_e.txt',
  'partof_inclusion_relation_list.txt',
  'partof_element_parts.txt',
  'partof_BP3D_4.0_obj_99.zip',
  'isa_parts_list_e.txt',
  'isa_element_parts.txt',
  'isa_BP3D_4.0_obj_99.zip',
];

/** Zips de mallas y la carpeta en la que se descomprimen, por orden de prioridad. */
export const ARBOLES = [
  { zip: 'partof_BP3D_4.0_obj_99.zip', dir: DIR_BP3D_OBJ },
  { zip: 'isa_BP3D_4.0_obj_99.zip', dir: DIR_BP3D_OBJ_ISA },
];

/**
 * @typedef {{ elemento: string, fma: string, nombre: string, bytes: number, ruta: string }} Elemento
 */

const SALTO_DE_LINEA = /\r?\n/;

function leerCabeceras(dir) {
  const res = [];
  const buf = Buffer.alloc(2048);
  for (const archivo of fs.readdirSync(dir)) {
    if (!archivo.endsWith('.obj')) continue;
    const ruta = path.join(dir, archivo);
    const fd = fs.openSync(ruta, 'r');
    const leidos = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    const cabecera = buf.toString('utf8', 0, leidos);
    const fma = /Concept ID : (\S+)/.exec(cabecera)?.[1];
    const nombre = /English name : ([^\r\n]+)/.exec(cabecera)?.[1]?.trim();
    if (fma && nombre) res.push({ elemento: archivo.replace('.obj', ''), fma, nombre, bytes: fs.statSync(ruta).size, ruta });
  }
  return res;
}

/**
 * Índice por nombre inglés (en minúsculas) de los OBJ de ambos árboles.
 * La cabecera de cada OBJ incluye "Concept ID : FMAxxxx" y "English name : ...".
 *
 * Prioridad: si un nombre existe en PART-OF, se ignoran las mallas IS-A con ese nombre
 * (así los sistemas ya generados no cambian al añadir el árbol IS-A).
 * @returns {Map<string, Elemento[]>}
 */
export function indexarElementos() {
  if (!fs.existsSync(DIR_BP3D_OBJ)) {
    throw new Error(`No existe ${DIR_BP3D_OBJ}. Ejecuta antes: npm run modelos:descargar`);
  }
  const porNombre = new Map();
  for (const { dir } of ARBOLES) {
    if (!fs.existsSync(dir)) continue;
    const nombresPrevios = new Set(porNombre.keys());
    for (const el of leerCabeceras(dir)) {
      const clave = el.nombre.toLowerCase();
      if (nombresPrevios.has(clave)) continue;
      if (!porNombre.has(clave)) porNombre.set(clave, []);
      porNombre.get(clave).push(el);
    }
  }
  return porNombre;
}

/**
 * Conceptos compuestos (COMPOUND) de BodyParts3D: nombre → elementos FJ que lo forman,
 * según partof_element_parts.txt e isa_element_parts.txt (PART-OF tiene prioridad).
 * @returns {Map<string, { fma: string, elementos: string[] }>}
 */
export function leerCompuestos() {
  const res = new Map();
  for (const archivo of ['partof_element_parts.txt', 'isa_element_parts.txt']) {
    const ruta = rutaLista(archivo);
    if (!fs.existsSync(ruta)) continue;
    const vistos = new Set(res.keys());
    for (const linea of fs.readFileSync(ruta, 'utf8').split(SALTO_DE_LINEA).slice(1)) {
      const [fma, nombre, fj] = linea.split('\t');
      if (!fma || !nombre || !fj) continue;
      const clave = nombre.trim().toLowerCase();
      if (vistos.has(clave)) continue;
      if (!res.has(clave)) res.set(clave, { fma, elementos: [] });
      res.get(clave).elementos.push(fj.trim());
    }
  }
  return res;
}

/** Geometría de un OBJ sin la cabecera de comentarios: sirve para detectar duplicados exactos. */
export function geometriaObj(ruta) {
  return fs
    .readFileSync(ruta, 'utf8')
    .split(SALTO_DE_LINEA)
    .filter((l) => !l.startsWith('#'))
    .join('\n');
}

export const rutaLista = (archivo) => path.join(DIR_BP3D, archivo);
