// Configuración del sistema esquelético para el pipeline de modelos.
//
// Cada estructura tiene:
//   id      identificador propio (= nombre del nodo en el .glb)
//   fuente  nombres ingleses EXACTOS de BodyParts3D (cabecera "English name" del OBJ).
//           Varias entradas = una estructura formada por varias mallas (p. ej. el esternón).
//   tipo    'hueso' | 'cartilago'
//   pendiente  motivo, si no hay modelo disponible (no se inventa geometría).
//   revisar    nota si la correspondencia con la fuente no es inequívoca.
//
// Lateralidad: sufijo -d (derecho) / -i (izquierdo), del lado del paciente.

/** @typedef {{ id: string, fuente?: string[], tipo: 'hueso' | 'cartilago', pendiente?: string, revisar?: string }} EstructuraConfig */

const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const LADOS = /** @type {const} */ ([
  ['d', 'Right', 'right'],
  ['i', 'Left', 'left'],
]);

/** Genera la pareja derecha/izquierda. `nombre(L, l)` recibe "Right"/"right" o "Left"/"left". */
const bilateral = (id, nombre, tipo = 'hueso') =>
  LADOS.map(([s, L, l]) => ({ id: `${id}-${s}`, fuente: [nombre(L, l)], tipo }));

const hueso = (id, ...fuente) => ({ id, fuente, tipo: 'hueso' });

const SIN_MODELO_BP3D = 'BodyParts3D 4.0 no incluye este hueso. Candidato: Z-Anatomy.';

// ---------------------------------------------------------------- Cráneo (22)
const craneo = [
  hueso('frontal', 'Frontal bone'),
  ...bilateral('parietal', (L) => `${L} parietal bone`),
  ...bilateral('temporal', (L) => `${L} temporal bone`),
  hueso('occipital', 'Occipital bone'),
  hueso('esfenoides', 'Sphenoid bone'),
  hueso('etmoides', 'Ethmoid'),
  ...bilateral('nasal', (L) => `${L} nasal bone`),
  ...bilateral('maxilar', (L) => `${L} maxilla`),
  ...bilateral('lagrimal', (L) => `${L} lacrimal bone`),
  ...bilateral('cigomatico', (L) => `${L} zygomatic bone`),
  ...bilateral('palatino', (L) => `${L} palatine bone`),
  ...bilateral('cornete-inferior', (L) => `${L} inferior nasal concha`),
  hueso('vomer', 'Vomer'),
  hueso('mandibula', 'Mandible'),
];

// --------------------------------------------- Huesecillos del oído (6) + hioides (1)
const oidoEHioides = [
  ...['martillo', 'yunque', 'estribo'].flatMap((h) =>
    ['d', 'i'].map((s) => ({ id: `${h}-${s}`, tipo: 'hueso', pendiente: SIN_MODELO_BP3D })),
  ),
  hueso('hioides', 'Hyoid bone'),
];

// ------------------------------------------------------ Columna vertebral (26)
const columna = [
  hueso('vertebra-c1', 'Atlas'),
  hueso('vertebra-c2', 'Axis'),
  ...[3, 4, 5, 6, 7].map((n) => hueso(`vertebra-c${n}`, `${cap(ORD[n - 1])} cervical vertebra`)),
  ...ORD.map((o, i) => hueso(`vertebra-t${i + 1}`, `${cap(o)} thoracic vertebra`)),
  ...ORD.slice(0, 5).map((o, i) => hueso(`vertebra-l${i + 1}`, `${cap(o)} lumbar vertebra`)),
  hueso('sacro', 'Sacrum'),
  {
    id: 'coccix',
    tipo: 'hueso',
    pendiente: `${SIN_MODELO_BP3D} Verificar si la malla del sacro incluye el cóccix.`,
  },
];

// ------------------------------------------------------------- Tórax (25)
const torax = [
  // El esternón cuenta como un hueso, formado por tres mallas.
  hueso('esternon', 'Manubrium', 'Body of sternum', 'Xiphoid process'),
  ...ORD.flatMap((o, i) => bilateral(`costilla-${i + 1}`, (L) => `${L} ${o} rib`)),
];

// --------------------------------------------- Miembro superior (32 × 2 = 64)
const DEDOS_MANO = ['thumb', 'index finger', 'middle finger', 'ring finger', 'little finger'];
const miembroSuperior = [
  ...bilateral('clavicula', (L) => `${L} clavicle`),
  ...bilateral('escapula', (L) => `${L} scapula`),
  ...bilateral('humero', (L) => `${L} humerus`),
  ...bilateral('radio', (L) => `${L} radius`),
  ...bilateral('cubito', (L) => `${L} ulna`),
  // Carpo (8)
  ...bilateral('escafoides', (L) => `${L} scaphoid`),
  ...bilateral('semilunar', (L) => `${L} lunate`),
  ...bilateral('piramidal', (L) => `${L} triquetral`),
  ...bilateral('pisiforme', (L) => `${L} pisiform`),
  ...bilateral('trapecio', (L) => `${L} trapezium`),
  ...bilateral('trapezoide', (L) => `${L} trapezoid`),
  ...bilateral('grande', (L) => `${L} capitate`),
  ...bilateral('ganchoso', (L) => `${L} hamate`),
  // Metacarpo (5)
  ...[1, 2, 3, 4, 5].flatMap((n) => bilateral(`metacarpiano-${n}`, (L) => `${L} ${ORD[n - 1]} metacarpal bone`)),
  // Falanges (14): el pulgar no tiene falange media.
  ...DEDOS_MANO.flatMap((d, i) => bilateral(`falange-proximal-mano-${i + 1}`, (_, l) => `Proximal phalanx of ${l} ${d}`)),
  ...DEDOS_MANO.slice(1).flatMap((d, i) => bilateral(`falange-media-mano-${i + 2}`, (_, l) => `Middle phalanx of ${l} ${d}`)),
  ...DEDOS_MANO.flatMap((d, i) => bilateral(`falange-distal-mano-${i + 1}`, (_, l) => `Distal phalanx of ${l} ${d}`)),
];

// --------------------------------------------- Miembro inferior (31 × 2 = 62)
const DEDOS_PIE = ['big toe', 'second toe', 'third toe', 'fourth toe', 'little toe'];
const miembroInferior = [
  ...bilateral('coxal', (L) => `${L} hip bone`),
  ...bilateral('femur', (L) => `${L} femur`),
  ...bilateral('rotula', (L) => `${L} patella`),
  ...bilateral('tibia', (L) => `${L} tibia`),
  ...bilateral('perone', (L) => `${L} fibula`),
  // Tarso (7)
  ...bilateral('astragalo', (L) => `${L} talus`),
  ...bilateral('calcaneo', (L) => `${L} calcaneus`),
  ...bilateral('navicular', (_, l) => `Navicular bone of ${l} foot`),
  ...bilateral('cuboides', (L) => `${L} cuboid bone`),
  ...bilateral('cuneiforme-medial', (L) => `${L} medial cuneiform bone`),
  ...bilateral('cuneiforme-intermedio', (L) => `${L} intermediate cuneiform bone`),
  ...bilateral('cuneiforme-lateral', (L) => `${L} lateral cuneiform bone`),
  // Metatarso (5)
  ...[1, 2, 3, 4, 5].flatMap((n) => bilateral(`metatarsiano-${n}`, (L) => `${L} ${ORD[n - 1]} metatarsal bone`)),
  // Falanges (14): el dedo gordo no tiene falange media.
  ...DEDOS_PIE.flatMap((d, i) => bilateral(`falange-proximal-pie-${i + 1}`, (_, l) => `Proximal phalanx of ${l} ${d}`)),
  ...DEDOS_PIE.slice(1).flatMap((d, i) => bilateral(`falange-media-pie-${i + 2}`, (_, l) => `Middle phalanx of ${l} ${d}`)),
  ...DEDOS_PIE.flatMap((d, i) => bilateral(`falange-distal-pie-${i + 1}`, (_, l) => `Distal phalanx of ${l} ${d}`)),
];

// ----------------------------------- Cartílagos y discos (no cuentan en los 206)
const cartilagos = [
  ...ORD.slice(0, 7).flatMap((o, i) => bilateral(`cartilago-costal-${i + 1}`, (L) => `${L} ${o} costal cartilage`, 'cartilago')),
  { id: 'disco-c2-c3', fuente: ['Intervertebral disk of axis'], tipo: 'cartilago' },
  ...[3, 4, 5, 6, 7].map((n) => ({
    id: `disco-c${n}-${n === 7 ? 't1' : `c${n + 1}`}`,
    fuente: [`Intervertebral disk of ${ORD[n - 1]} cervical vertebra`],
    tipo: 'cartilago',
  })),
  ...ORD.slice(0, 11).map((o, i) => ({
    id: `disco-t${i + 1}-t${i + 2}`,
    fuente: [`Intervertebral disk of ${o} thoracic vertebra`],
    tipo: 'cartilago',
  })),
  {
    id: 'disco-t12-l1',
    fuente: ['Intervertebral disk'],
    tipo: 'cartilago',
    revisar: 'La fuente lo nombra solo "Intervertebral disk" (FJ3211); por posición (z 1061–1079 mm) está entre T12 y L1.',
  },
  ...ORD.slice(0, 5).map((o, i) => ({
    id: `disco-l${i + 1}-${i === 4 ? 's1' : `l${i + 2}`}`,
    fuente: [`Intervertebral disk of ${o} lumbar vertebra`],
    tipo: 'cartilago',
  })),
];

function cap(s) {
  return s[0].toUpperCase() + s.slice(1);
}

/** @type {{ sistema: string, simplificar: number, estructuras: EstructuraConfig[] }} */
export default {
  sistema: 'esqueletico',
  // Fracción de triángulos a conservar (1 = sin simplificar). Con 0,5: ~358 k triángulos, ~3 MB
  // (sin simplificar: ~581 k, ~4,4 MB). El límite de error de simplify protege los huesos pequeños.
  simplificar: 0.5,
  estructuras: [...craneo, ...oidoEHioides, ...columna, ...torax, ...miembroSuperior, ...miembroInferior, ...cartilagos],
};

/** Número de huesos esperado en el adulto. Se comprueba en los tests. */
export const HUESOS_ESPERADOS = 206;
