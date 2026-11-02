// Utilidades para escribir los datos de estructuras de forma compacta.
//
// Convenciones dentro de una plantilla bilateral:
//   {lado}   → «derecho/izquierdo» o «derecha/izquierda» según el género
//   {Side}   → «Right»/«Left»     {side} → «right»/«left»     {lr} → «r»/«l» (sufijo de lado en Z-Anatomy)
//   id~      → id del MISMO lado      (p. ej. 'tibia~'    → 'tibia-d')
//   id^      → id del lado OPUESTO    (p. ej. 'parietal^' → 'parietal-i')

const LADOS = [
  { s: 'd', o: 'i', lado: 'derecho', m: 'derecho', f: 'derecha', Side: 'Right', side: 'right', lr: 'r' },
  { s: 'i', o: 'd', lado: 'izquierdo', m: 'izquierdo', f: 'izquierda', Side: 'Left', side: 'left', lr: 'l' },
];

function sustituir(valor, l, genero) {
  if (typeof valor === 'string') {
    return valor
      .replaceAll('{lado}', genero === 'f' ? l.f : l.m)
      .replaceAll('{Side}', l.Side)
      .replaceAll('{side}', l.side)
      .replaceAll('{lr}', l.lr)
      .replace(/^([a-z0-9-]+)~$/, `$1-${l.s}`)
      .replace(/^([a-z0-9-]+)\^$/, `$1-${l.o}`);
  }
  if (Array.isArray(valor)) return valor.map((v) => sustituir(v, l, genero));
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, sustituir(v, l, genero)]));
  }
  return valor;
}

/** Estructura par: devuelve las versiones derecha (-d) e izquierda (-i). */
export function par(id, genero, plantilla) {
  return LADOS.map((l) => ({ id: `${id}-${l.s}`, lado: l.lado, ...sustituir(plantilla, l, genero) }));
}

/** Estructura impar (línea media). */
export function impar(id, datos) {
  return { id, ...datos };
}

/** Articulación abreviada: art('Sutura coronal', 'sutura', 'frontal', 'parietal~'). */
export const art = (nombre, tipo, ...con) => ({ nombre, tipo, con });

/**
 * Articulaciones de una falange de la mano o del pie.
 * El primer dedo (pulgar / dedo gordo) no tiene falange media: una sola interfalángica.
 * @param {'mano'|'pie'} seg  @param {'proximal'|'media'|'distal'} fila
 * @param {string} metaId  id (con ~) del metacarpiano/metatarsiano  @param {string} nombreMeta  «metacarpofalángica»…
 */
export function articulacionesFalange(seg, fila, n, primerDedo, metaId, nombreMeta) {
  const f = (fl) => `falange-${fl}-${seg}-${n}~`;
  const BISAGRA = 'sinovial troclear (gínglimo)';
  const mtf = art(`Articulación ${nombreMeta}`, 'sinovial condílea (elipsoidea)', metaId);
  if (primerDedo) {
    return fila === 'proximal'
      ? [mtf, art('Articulación interfalángica', BISAGRA, f('distal'))]
      : [art('Articulación interfalángica', BISAGRA, f('proximal'))];
  }
  return {
    proximal: [mtf, art('Articulación interfalángica proximal', BISAGRA, f('media'))],
    media: [art('Articulación interfalángica proximal', BISAGRA, f('proximal')), art('Articulación interfalángica distal', BISAGRA, f('distal'))],
    distal: [art('Articulación interfalángica distal', BISAGRA, f('media'))],
  }[fila];
}

export const ORDINAL_F =['primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena', 'décima', 'undécima', 'duodécima'];
export const ORDINAL_M = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo', 'undécimo', 'duodécimo'];
export const ORDINAL_EN = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
export const ROMANO = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const cap = (s) => s[0].toUpperCase() + s.slice(1);

/**
 * Músculo par. `nombre` e `ingles` van sin lado (se añade «derecho/izquierdo» y «Right/Left»);
 * `fuente` usa {side} para los nombres de BodyParts3D.
 */
export function musculo(id, datos) {
  return par(id, 'm', {
    tipo: 'musculo',
    ...datos,
    nombre: `${datos.nombre} {lado}`,
    ingles: `{Side} ${datos.ingles}`,
  });
}

/** Estructura impar con modelo (o pendiente si no hay `fuente`). */
export const unica = (id, datos) => ({ id, ...datos });

/**
 * Datos comunes de un vaso. El material del modelo sigue la sangre que transporta
 * (convención de los atlas): oxigenada → rojo, desoxigenada → azul.
 */
export function datosVaso(clase, sangre = clase === 'arteria' ? 'oxigenada' : 'desoxigenada') {
  return {
    tipo: 'vaso',
    vaso: { clase, sangre },
    material: sangre === 'oxigenada' ? 'arteria' : 'vena',
  };
}

// ---------------------------------------------------------------- Z-Anatomy
// Estructuras que BodyParts3D no tiene y se toman de Z-Anatomy (CC BY-SA 4.0):
//   fuenteZA    objetos del .blend que forman la estructura (se unen en una malla)
//   refZA       pares [objeto de Z-Anatomy, id del atlas] de la misma región para alinear (escala + traslación)
//   notaModelo  aviso que se muestra en la ficha (p. ej. si la representación es esquemática)

/** Ambos lados de objetos de Z-Anatomy: zaLados('Palatine tonsil') → ['Palatine tonsil.l', 'Palatine tonsil.r']. */
export const zaLados = (...nombres) => nombres.flatMap((n) => [`${n}.l`, `${n}.r`]);

/**
 * Referencias de alineación por región (objeto de Z-Anatomy → estructura de BodyParts3D). Solo piezas rígidas con la
 * misma forma en ambos modelos: el paladar blando y el sacro difieren, y clavículas y fémures tienen otra postura.
 */
export const REF_ZA = {
  cuello: [
    ['Thyroid cartilage', 'cartilago-tiroides'],
    ['Cricoid cartilage', 'cartilago-cricoides'],
    ['Trachea', 'traquea'],
    ['Hyoid bone', 'hioides'],
  ],
  faringe: [
    ['Tongue', 'lengua'],
    ['Hyoid bone', 'hioides'],
    ['Mandible', 'mandibula'],
  ],
  cuelloAmplio: [
    ['Mandible', 'mandibula'],
    ['Hyoid bone', 'hioides'],
    ['Thyroid cartilage', 'cartilago-tiroides'],
    ['Cricoid cartilage', 'cartilago-cricoides'],
  ],
  axila: [
    ['Clavicle.l', 'clavicula-i'],
    ['Clavicle.r', 'clavicula-d'],
    ['Scapula.l', 'escapula-i'],
    ['Scapula.r', 'escapula-d'],
    ['Humerus.l', 'humero-i'],
    ['Humerus.r', 'humero-d'],
  ],
  ingle: [
    ['Hip bone.l', 'coxal-i'],
    ['Hip bone.r', 'coxal-d'],
  ],
  genitalMasculino: [
    ['Testis.l', 'testiculo-i'],
    ['Testis.r', 'testiculo-d'],
    ['Epididymis.l', 'epididimo-i'],
    ['Epididymis.r', 'epididimo-d'],
    ['Seminal gland.l', 'vesicula-seminal-i'],
    ['Seminal gland.r', 'vesicula-seminal-d'],
    ['Prostate', 'prostata'],
  ],
};

/** Aviso para los ganglios de Z-Anatomy, que son esferas colocadas en su posición. */
export const ESQUEMATICO_ZA = 'Representación esquemática: en Z-Anatomy cada ganglio es una pequeña esfera situada en su posición anatómica.';
