// Ajuste de escala y traslación de Z-Anatomy a la escena del atlas (la de BodyParts3D), por mínimos
// cuadrados sobre las cajas de estructuras que existen en los dos modelos.
//
// Ejes: Blender (Z-Anatomy) es Z arriba, anterior −Y, derecha del paciente −X. El exportador glTF de
// Blender ya convierte a Y arriba (x, z, −y); aquí se trabaja en ese sistema, igual que la escena.

/** Pares [objeto de Z-Anatomy, id del atlas] usados como referencia. */
export const REFERENCIAS = [
  ['Kidney.l', 'rinon-i'],
  ['Kidney.r', 'rinon-d'],
  ['Spleen', 'bazo'],
  ['Prostate', 'prostata'],
  ['Testis.l', 'testiculo-i'],
  ['Testis.r', 'testiculo-d'],
  ['Urinary bladder', 'vejiga'],
  ['Hip bone.l', 'coxal-i'],
  ['Hip bone.r', 'coxal-d'],
  ['Sacrum', 'sacro'],
  ['Thyroid cartilage', 'cartilago-tiroides'],
  ['Suprarenal gland.l', 'glandula-suprarrenal-i'],
  ['Suprarenal gland.r', 'glandula-suprarrenal-d'],
  ['Seminal gland.l', 'vesicula-seminal-i'],
  ['Seminal gland.r', 'vesicula-seminal-d'],
  ['Glans penis', 'glande'],
];

/** Caja de Blender (min/max en x, y, z) → caja en ejes glTF (Y arriba, +Z anterior). */
export function cajaBlenderAGltf({ min, max }) {
  return { min: [min[0], min[2], -max[1]], max: [max[0], max[2], -min[1]] };
}

const centro = (c) => c.min.map((v, k) => (v + c.max[k]) / 2);
const tam = (c) => c.min.map((v, k) => c.max[k] - v);

/**
 * Ajusta p_atlas ≈ s·p_za + t (escala uniforme y traslación) con los centros y las esquinas de las
 * cajas de referencia. Devuelve { escala, traslacion, residuos } (residuos en metros, por referencia).
 */
export function ajustar(pares) {
  // Puntos: centro y esquinas de cada caja (las esquinas fijan la escala).
  const A = [];
  const B = [];
  for (const { za, atlas } of pares) {
    A.push(centro(za), za.min, za.max);
    B.push(centro(atlas), atlas.min, atlas.max);
  }
  const n = A.length;
  const media = (P) => [0, 1, 2].map((k) => P.reduce((s, p) => s + p[k], 0) / n);
  const ma = media(A);
  const mb = media(B);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) {
      num += (A[i][k] - ma[k]) * (B[i][k] - mb[k]);
      den += (A[i][k] - ma[k]) ** 2;
    }
  }
  const escala = num / den;
  const traslacion = [0, 1, 2].map((k) => mb[k] - escala * ma[k]);
  const residuos = pares.map(({ nombre, za, atlas }) => {
    const c = centro(za).map((v, k) => escala * v + traslacion[k]);
    const d = Math.hypot(...c.map((v, k) => v - centro(atlas)[k]));
    const ratio = tam(atlas).map((v, k) => v / (escala * tam(za)[k]));
    return { nombre, error: d, ratio };
  });
  return { escala, traslacion, residuos };
}
