// Lectura de los datos de BodyParts3D 4.0 (árbol PART-OF).
import fs from 'node:fs';
import path from 'node:path';
import { DIR_BP3D, DIR_BP3D_OBJ } from './rutas.mjs';

export const URL_BASE_BP3D = 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST';

export const ARCHIVOS_BP3D = [
  'README_e.html',
  'partof_parts_list_e.txt',
  'partof_inclusion_relation_list.txt',
  'partof_element_parts.txt',
  'partof_BP3D_4.0_obj_99.zip',
];

/**
 * Lee la cabecera de cada OBJ (FJxxxx.obj) y devuelve un índice por nombre inglés.
 * La cabecera incluye "Concept ID : FMAxxxx" y "English name : ...".
 * @returns {Map<string, {elemento: string, fma: string, nombre: string, bytes: number}[]>}
 */
export function indexarElementos(dir = DIR_BP3D_OBJ) {
  if (!fs.existsSync(dir)) {
    throw new Error(`No existe ${dir}. Ejecuta antes: npm run modelos:descargar`);
  }
  const porNombre = new Map();
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
    if (!fma || !nombre) continue;
    const clave = nombre.toLowerCase();
    if (!porNombre.has(clave)) porNombre.set(clave, []);
    porNombre.get(clave).push({ elemento: archivo.replace('.obj', ''), fma, nombre, bytes: fs.statSync(ruta).size });
  }
  return porNombre;
}

/** Geometría de un OBJ sin la cabecera de comentarios: sirve para detectar duplicados exactos. */
export function geometriaObj(elemento, dir = DIR_BP3D_OBJ) {
  return fs
    .readFileSync(path.join(dir, `${elemento}.obj`), 'utf8')
    .split(/\r?\n/)
    .filter((l) => !l.startsWith('#'))
    .join('\n');
}

export const rutaObj = (elemento, dir = DIR_BP3D_OBJ) => path.join(dir, `${elemento}.obj`);
export const rutaLista = (archivo) => path.join(DIR_BP3D, archivo);
