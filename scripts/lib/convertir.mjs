// Paso 2a: OBJ → glTF binario con obj2gltf, un archivo por elemento (cacheado en assets-raw/intermedio).
import fs from 'node:fs';
import path from 'node:path';
import obj2gltf from 'obj2gltf';
import { rutaObj } from './bodyparts3d.mjs';
import { DIR_INTERMEDIO } from './rutas.mjs';

// Versión de las opciones de conversión: si cambian, se invalida la caché.
const VERSION_CONVERSION = 'v1-zup';

/**
 * Convierte cada elemento a .glb si no está ya en caché. Devuelve la ruta por elemento.
 * BodyParts3D usa Z arriba (mm); glTF usa Y arriba. obj2gltf aplica el giro en los vértices.
 * @param {string[]} elementos  ids FJxxxx
 * @returns {Promise<Map<string, string>>}
 */
export async function convertirElementos(elementos) {
  const dir = path.join(DIR_INTERMEDIO, VERSION_CONVERSION);
  fs.mkdirSync(dir, { recursive: true });
  const rutas = new Map();
  let convertidos = 0;

  for (const el of elementos) {
    const destino = path.join(dir, `${el}.glb`);
    if (!fs.existsSync(destino)) {
      const glb = await obj2gltf(rutaObj(el), { binary: true, inputUpAxis: 'Z', outputUpAxis: 'Y' });
      fs.writeFileSync(destino, glb);
      convertidos++;
    }
    rutas.set(el, destino);
  }
  console.log(`  obj2gltf: ${convertidos} convertidos, ${elementos.length - convertidos} en caché`);
  return rutas;
}
