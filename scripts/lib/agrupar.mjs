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
import { claveElemento } from './convertir.mjs';

const MM_A_M = 0.001;

/** Materiales compartidos por tipo de estructura (la app los recolorea en tiempo de ejecución). */
// Clave = `material` de la configuración o, si falta, el tipo de estructura.
const MATERIALES = {
  hueso: { color: [0.89, 0.85, 0.78, 1], rugosidad: 0.75 },
  cartilago: { color: [0.62, 0.76, 0.82, 1], rugosidad: 0.55 },
  musculo: { color: [0.7, 0.24, 0.22, 1], rugosidad: 0.6 },
  tendon: { color: [0.9, 0.88, 0.8, 1], rugosidad: 0.5 },
  miocardio: { color: [0.62, 0.17, 0.17, 1], rugosidad: 0.55 },
  valvula: { color: [0.96, 0.86, 0.62, 1], rugosidad: 0.5 },
  arteria: { color: [0.82, 0.13, 0.13, 1], rugosidad: 0.45 },
  vena: { color: [0.2, 0.33, 0.78, 1], rugosidad: 0.45 },
  'via-aerea': { color: [0.9, 0.76, 0.72, 1], rugosidad: 0.55 },
  organo: { color: [0.78, 0.5, 0.45, 1], rugosidad: 0.6 },
  encefalo: { color: [0.86, 0.72, 0.7, 1], rugosidad: 0.7 },
  'sustancia-blanca': { color: [0.93, 0.91, 0.86, 1], rugosidad: 0.7 },
  nervio: { color: [0.96, 0.84, 0.32, 1], rugosidad: 0.5 },
  liquido: { color: [0.5, 0.74, 0.96, 1], rugosidad: 0.3 },
  glandula: { color: [0.86, 0.6, 0.38, 1], rugosidad: 0.6 },
  diente: { color: [0.97, 0.95, 0.88, 1], rugosidad: 0.35 },
  digestivo: { color: [0.86, 0.56, 0.5, 1], rugosidad: 0.55 },
  higado: { color: [0.55, 0.24, 0.2, 1], rugosidad: 0.5 },
  biliar: { color: [0.38, 0.6, 0.3, 1], rugosidad: 0.5 },
  renal: { color: [0.62, 0.3, 0.26, 1], rugosidad: 0.55 },
  linfatico: { color: [0.52, 0.74, 0.44, 1], rugosidad: 0.6 },
  ojo: { color: [0.94, 0.94, 0.96, 1], rugosidad: 0.4 },
  iris: { color: [0.33, 0.45, 0.62, 1], rugosidad: 0.5 },
  // Medios transparentes del ojo (córnea, cristalino, vítreo): alfa propio, se combina con la opacidad del sistema.
  transparente: { color: [0.78, 0.88, 0.97, 0.35], rugosidad: 0.1 },
};

/**
 * @param {string} sistema
 * @param {import('./resolver.mjs').EstructuraResuelta[]} estructuras
 * @param {Map<string, string>} rutasGlb  clave de elemento → .glb intermedio
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
        doc
          .createMaterial(tipo)
          .setBaseColorFactor(m.color)
          .setMetallicFactor(0)
          .setRoughnessFactor(m.rugosidad)
          .setAlphaMode(m.color[3] < 1 ? 'BLEND' : 'OPAQUE'),
      );
    }
    return materiales.get(tipo);
  };

  for (const est of estructuras) {
    const nodo = doc.createNode(est.id).setExtras({ tipo: est.tipo });
    raiz.addChild(nodo);
    const variasMallas = est.elementos.length > 1;

    for (const el of est.elementos) {
      const origen = await io.read(rutasGlb.get(claveElemento(el)));
      const prims = origen.getRoot().listMeshes().flatMap((m) => m.listPrimitives());
      const nombre = variasMallas ? `${est.id}__${el.elemento}` : est.id;
      const malla = doc.createMesh(nombre);
      // Los .glb de Z-Anatomy ya están en metros; los de BodyParts3D, en mm.
      const factor = el.unidad === 'm' ? 1 : MM_A_M;
      for (const p of prims) malla.addPrimitive(copiarPrimitiva(doc, p, material(est.material ?? est.tipo), factor));

      if (variasMallas) {
        nodo.addChild(doc.createNode(nombre).setMesh(malla).setExtras({ elemento: el.elemento, fma: el.fma }));
      } else {
        nodo.setMesh(malla).setExtras({ tipo: est.tipo, elemento: el.elemento, fma: el.fma });
      }
    }
  }
  return doc;
}

/** Copia una primitiva de otro documento, escalando las posiciones (mm → m con el factor por defecto). */
function copiarPrimitiva(doc, prim, material, factor = MM_A_M) {
  const buffer = doc.getRoot().listBuffers()[0];
  const nueva = doc.createPrimitive().setMaterial(material);

  const pos = prim.getAttribute('POSITION');
  const posM = Float32Array.from(pos.getArray(), (v) => v * factor);
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
