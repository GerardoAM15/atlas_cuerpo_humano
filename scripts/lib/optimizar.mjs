// Paso 3: optimización con glTF-Transform (las mismas funciones que usa @gltf-transform/cli).
//
// No se usan join/flatten/instance/palette: romperían la regla «un nodo por estructura».
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

export async function crearIO() {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
  return new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
}

/**
 * @param {import('@gltf-transform/core').Document} doc
 * @param {{ simplificar: number }} opciones  fracción de triángulos a conservar (1 = no simplifica)
 */
export async function optimizar(doc, { simplificar }) {
  await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
  const pasos = [dedup(), weld()];
  if (simplificar < 1) {
    // error: desviación máxima permitida como fracción del radio de cada malla.
    // simplify conserva las normales de la fuente; no se usa normals(), que desindexa la geometría.
    pasos.push(simplify({ simplifier: MeshoptSimplifier, ratio: simplificar, error: 0.002 }));
  }
  pasos.push(prune({ keepLeaves: true, keepExtras: true }));
  // meshopt(): reordena, cuantiza (KHR_mesh_quantization) y comprime (EXT_meshopt_compression).
  pasos.push(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await doc.transform(...pasos);
  return doc;
}

/** Recuento de triángulos y caja envolvente (en coordenadas de escena) por nodo con nombre. */
export function medir(doc) {
  const porNodo = new Map();
  let triangulos = 0;
  for (const nodo of doc.getRoot().listNodes()) {
    const malla = nodo.getMesh();
    if (!malla) continue;
    let t = 0;
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const p of malla.listPrimitives()) {
      t += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
      const pos = p.getAttribute('POSITION');
      const v = [0, 0, 0];
      for (let i = 0; i < pos.getCount(); i++) {
        pos.getElement(i, v);
        for (let k = 0; k < 3; k++) {
          if (v[k] < min[k]) min[k] = v[k];
          if (v[k] > max[k]) max[k] = v[k];
        }
      }
    }
    triangulos += t;
    porNodo.set(nodo.getName(), { triangulos: t, min, max });
  }
  return { triangulos, porNodo };
}
