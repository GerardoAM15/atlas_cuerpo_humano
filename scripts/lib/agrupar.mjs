// Paso 2b: agrupa los .glb de cada elemento en un único documento por sistema.
//
// Estructura del resultado:
//   escena
//   └─ <sistema>                     nodo raíz del sistema
//      ├─ <id>                       estructura de una sola malla (nodo con malla)
//      └─ <id>                       estructura de varias mallas (nodo vacío)…
//         └─ <id>__<FJxxxx>          …con un hijo por malla
//
// Los nombres de nodo usan solo [a-z0-9-_] porque GLTFLoader elimina caracteres como «.» y «:».
// Unidades de salida: metros, Y arriba, +Z anterior, -X lado derecho del paciente.
import { Document, NodeIO } from '@gltf-transform/core';

const MM_A_M = 0.001;

/** Materiales compartidos por tipo de estructura (la app los recolorea en tiempo de ejecución). */
const MATERIALES = {
  hueso: { color: [0.89, 0.85, 0.78, 1], rugosidad: 0.75 },
  cartilago: { color: [0.62, 0.76, 0.82, 1], rugosidad: 0.55 },
};

/**
 * @param {string} sistema
 * @param {import('./resolver.mjs').EstructuraResuelta[]} estructuras
 * @param {Map<string, string>} rutasGlb  elemento → .glb intermedio
 */
export async function agruparSistema(sistema, estructuras, rutasGlb) {
  const io = new NodeIO();
  const doc = new Document();
  doc.createBuffer();
  const escena = doc.createScene(sistema);
  const raiz = doc.createNode(sistema);
  escena.addChild(raiz);

  const materiales = new Map();
  const material = (tipo) => {
    if (!materiales.has(tipo)) {
      const m = MATERIALES[tipo] ?? MATERIALES.hueso;
      materiales.set(
        tipo,
        doc.createMaterial(tipo).setBaseColorFactor(m.color).setMetallicFactor(0).setRoughnessFactor(m.rugosidad),
      );
    }
    return materiales.get(tipo);
  };

  for (const est of estructuras) {
    const nodo = doc.createNode(est.id).setExtras({ tipo: est.tipo });
    raiz.addChild(nodo);
    const variasMallas = est.elementos.length > 1;

    for (const el of est.elementos) {
      const origen = await io.read(rutasGlb.get(el.elemento));
      const prims = origen.getRoot().listMeshes().flatMap((m) => m.listPrimitives());
      const nombre = variasMallas ? `${est.id}__${el.elemento}` : est.id;
      const malla = doc.createMesh(nombre);
      for (const p of prims) malla.addPrimitive(copiarPrimitiva(doc, p, material(est.tipo)));

      if (variasMallas) {
        nodo.addChild(doc.createNode(nombre).setMesh(malla).setExtras({ elemento: el.elemento, fma: el.fma }));
      } else {
        nodo.setMesh(malla).setExtras({ tipo: est.tipo, elemento: el.elemento, fma: el.fma });
      }
    }
  }
  return doc;
}

/** Copia una primitiva de otro documento, pasando posiciones de mm a m. */
function copiarPrimitiva(doc, prim, material) {
  const buffer = doc.getRoot().listBuffers()[0];
  const nueva = doc.createPrimitive().setMaterial(material);

  const pos = prim.getAttribute('POSITION');
  const posM = Float32Array.from(pos.getArray(), (v) => v * MM_A_M);
  nueva.setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(posM).setBuffer(buffer));

  const normal = prim.getAttribute('NORMAL');
  if (normal) {
    nueva.setAttribute(
      'NORMAL',
      doc.createAccessor().setType('VEC3').setArray(Float32Array.from(normal.getArray())).setBuffer(buffer),
    );
  }
  const indices = prim.getIndices();
  if (indices) {
    nueva.setIndices(doc.createAccessor().setType('SCALAR').setArray(Uint32Array.from(indices.getArray())).setBuffer(buffer));
  }
  return nueva;
}
