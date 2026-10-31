// Miembro superior: cintura escapular, brazo y antebrazo, mano (32 huesos por lado).
import { ORDINAL_EN, ORDINAL_M, ROMANO, art, articulacionesFalange, cap, par } from '../util.mjs';

const cinturaYBrazo = [
  ...par('clavicula', 'f', {
    nombre: 'Clavícula {lado}',
    latin: 'Clavicula',
    ingles: '{Side} clavicle',
    region: 'cintura-escapular',
    clasificacion: ['largo'],
    descripcion: 'Hueso largo con forma de S itálica; es el único hueso largo del cuerpo dispuesto en horizontal.',
    funcion:
      'Actúa como un puntal que mantiene el hombro separado del tórax y transmite las fuerzas del miembro superior al esqueleto axial.',
    ubicacion: 'Base del cuello, entre el manubrio del esternón y el acromion de la escápula.',
    articulaciones: [
      art('Articulación esternoclavicular', 'sinovial selar (con disco articular)', 'esternon'),
      art('Articulación acromioclavicular', 'sinovial plana', 'escapula~'),
    ],
    relacionesExtra: ['costilla-1~'],
    datosClinicos: 'Es uno de los huesos que más se fracturan, sobre todo en su tercio medio, por caídas sobre el hombro o la mano extendida.',
    curiosidad: 'Es el primer hueso del cuerpo que empieza a osificarse (hacia la 5.ª–6.ª semana de gestación) y uno de los últimos en completar su osificación.',
  }),
  ...par('escapula', 'f', {
    nombre: 'Escápula {lado}',
    latin: 'Scapula',
    ingles: '{Side} scapula',
    region: 'cintura-escapular',
    clasificacion: ['plano'],
    descripcion: 'Hueso plano y triangular de la parte posterior del tórax, con espina, acromion, apófisis coracoides y cavidad glenoidea.',
    funcion: 'Une el húmero a la clavícula y sirve de origen o inserción a numerosos músculos, entre ellos los cuatro del manguito rotador.',
    ubicacion: 'Cara posterolateral del tórax, aproximadamente entre la 2.ª y la 7.ª costilla.',
    articulaciones: [
      art('Articulación glenohumeral (hombro)', 'sinovial esferoidea', 'humero~'),
      art('Articulación acromioclavicular', 'sinovial plana', 'clavicula~'),
    ],
    datosClinicos: 'La glenohumeral es la articulación que más se luxa del cuerpo, casi siempre en dirección anterior (anteroinferior).',
    curiosidad: 'Antiguamente se la llamaba omóplato.',
  }),
  ...par('humero', 'm', {
    nombre: 'Húmero {lado}',
    latin: 'Humerus',
    ingles: '{Side} humerus',
    region: 'brazo-antebrazo',
    clasificacion: ['largo'],
    descripcion:
      'El hueso más largo del miembro superior: cabeza, cuellos anatómico y quirúrgico, tubérculos mayor y menor, diáfisis con el surco del nervio radial y extremo distal con tróclea, capítulo y epicóndilos.',
    funcion: 'Forma el esqueleto del brazo y articula con la escápula en el hombro y con el radio y el cúbito en el codo.',
    ubicacion: 'Brazo, entre el hombro y el codo.',
    articulaciones: [
      art('Articulación glenohumeral (hombro)', 'sinovial esferoidea', 'escapula~'),
      art('Articulación humerocubital (codo)', 'sinovial troclear (gínglimo)', 'cubito~'),
      art('Articulación humerorradial (codo)', 'sinovial esferoidea', 'radio~'),
    ],
    datosClinicos:
      'Las fracturas del cuello quirúrgico pueden lesionar el nervio axilar; las de la diáfisis, el nervio radial (mano caída); y las supracondíleas de los niños, la arteria braquial.',
    curiosidad: 'El «hueso de la risa» es en realidad el nervio cubital, que pasa por detrás del epicóndilo medial.',
  }),
  ...par('radio', 'm', {
    nombre: 'Radio {lado}',
    latin: 'Radius',
    ingles: '{Side} radius',
    region: 'brazo-antebrazo',
    clasificacion: ['largo'],
    descripcion:
      'Hueso lateral del antebrazo (del lado del pulgar). Su cabeza en forma de disco gira en el codo y su extremo distal, ancho, forma la mayor parte de la articulación de la muñeca.',
    funcion: 'Permite la pronación y la supinación al girar alrededor del cúbito y transmite las cargas de la mano al antebrazo.',
    ubicacion: 'Antebrazo, lado lateral (radial).',
    articulaciones: [
      art('Articulación humerorradial (codo)', 'sinovial esferoidea', 'humero~'),
      art('Articulaciones radiocubitales proximal y distal', 'sinovial trocoide', 'cubito~'),
      art('Articulación radiocarpiana (muñeca)', 'sinovial elipsoidea', 'escafoides~', 'semilunar~'),
    ],
    datosClinicos: 'La fractura de Colles (extremo distal con desplazamiento dorsal) es la fractura más común de la muñeca, típica de las caídas sobre la mano extendida.',
    curiosidad: 'En niños pequeños, un tirón brusco del brazo puede subluxar la cabeza del radio («codo de niñera»).',
  }),
  ...par('cubito', 'm', {
    nombre: 'Cúbito (ulna) {lado}',
    latin: 'Ulna',
    ingles: '{Side} ulna',
    region: 'brazo-antebrazo',
    clasificacion: ['largo'],
    descripcion:
      'Hueso medial del antebrazo (del lado del meñique). Su extremo proximal, con el olécranon y la apófisis coronoides, forma la escotadura troclear que abraza la tróclea del húmero.',
    funcion: 'Forma la articulación principal del codo y el eje fijo alrededor del cual gira el radio.',
    ubicacion: 'Antebrazo, lado medial (cubital).',
    articulaciones: [
      art('Articulación humerocubital (codo)', 'sinovial troclear (gínglimo)', 'humero~'),
      art('Articulaciones radiocubitales proximal y distal', 'sinovial trocoide', 'radio~'),
    ],
    relacionesExtra: ['piramidal~', 'semilunar~'],
    datosClinicos: 'La fractura de Monteggia combina una fractura del cúbito proximal con la luxación de la cabeza del radio.',
    curiosidad: 'No articula directamente con el carpo: entre ambos se interpone el disco articular (complejo fibrocartilaginoso triangular).',
  }),
];

// ---------------------------------------------------------------- Carpo
const CARPO = { region: 'mano', clasificacion: ['corto'], funcion: 'Forma parte del carpo, que da a la muñeca movilidad y la capacidad de transmitir fuerzas a la mano.' };
const INTERCARPIANA = 'sinovial plana';

const carpo = [
  ...par('escafoides', 'm', {
    ...CARPO,
    nombre: 'Escafoides {lado}',
    latin: 'Os scaphoideum',
    ingles: '{Side} scaphoid',
    descripcion: 'El mayor hueso de la fila proximal del carpo, con forma de barca.',
    funcion: 'Une funcionalmente las dos filas del carpo y articula con el radio.',
    ubicacion: 'Fila proximal del carpo, lado radial (bajo la tabaquera anatómica).',
    articulaciones: [
      art('Articulación radiocarpiana', 'sinovial elipsoidea', 'radio~'),
      art('Articulaciones intercarpianas', INTERCARPIANA, 'semilunar~', 'grande~', 'trapecio~', 'trapezoide~'),
    ],
    datosClinicos:
      'Es el hueso del carpo que más se fractura. Su irrigación entra por el polo distal, por lo que el polo proximal puede sufrir necrosis avascular; el dolor en la tabaquera anatómica sugiere la fractura.',
  }),
  ...par('semilunar', 'm', {
    ...CARPO,
    nombre: 'Semilunar {lado}',
    latin: 'Os lunatum',
    ingles: '{Side} lunate',
    descripcion: 'Hueso de la fila proximal del carpo con forma de media luna, entre el escafoides y el piramidal.',
    ubicacion: 'Centro de la fila proximal del carpo.',
    articulaciones: [
      art('Articulación radiocarpiana', 'sinovial elipsoidea', 'radio~'),
      art('Articulaciones intercarpianas', INTERCARPIANA, 'escafoides~', 'piramidal~', 'grande~'),
    ],
    datosClinicos: 'Es el hueso del carpo que más se luxa; su necrosis avascular se denomina enfermedad de Kienböck.',
  }),
  ...par('piramidal', 'm', {
    ...CARPO,
    nombre: 'Piramidal {lado}',
    latin: 'Os triquetrum',
    ingles: '{Side} triquetrum',
    descripcion: 'Hueso de forma piramidal en el lado cubital de la fila proximal del carpo.',
    funcion: 'Se relaciona con el disco articular de la muñeca y sostiene al pisiforme.',
    ubicacion: 'Fila proximal del carpo, lado cubital.',
    articulaciones: [art('Articulaciones intercarpianas', INTERCARPIANA, 'semilunar~', 'pisiforme~', 'ganchoso~')],
    datosClinicos: 'Sus fracturas por arrancamiento dorsal son las segundas más frecuentes del carpo.',
  }),
  ...par('pisiforme', 'm', {
    ...CARPO,
    clasificacion: ['sesamoideo', 'corto'],
    nombre: 'Pisiforme {lado}',
    latin: 'Os pisiforme',
    ingles: '{Side} pisiform',
    descripcion: 'El hueso más pequeño del carpo, con forma de guisante. Es un sesamoideo situado dentro del tendón del flexor cubital del carpo.',
    funcion: 'Aumenta el brazo de palanca del flexor cubital del carpo y da inserción a ligamentos y al abductor del meñique.',
    ubicacion: 'Fila proximal del carpo, sobre la cara palmar del piramidal.',
    articulaciones: [art('Articulación del pisiforme', INTERCARPIANA, 'piramidal~')],
    datosClinicos: 'Es palpable en la base de la eminencia hipotenar; junto al gancho del ganchoso delimita el canal de Guyon, por el que pasa el nervio cubital.',
  }),
  ...par('trapecio', 'm', {
    ...CARPO,
    nombre: 'Trapecio {lado}',
    latin: 'Os trapezium',
    ingles: '{Side} trapezium',
    descripcion: 'Hueso de la fila distal del carpo, en la base del pulgar.',
    funcion: 'Su articulación en silla de montar con el primer metacarpiano permite la oposición del pulgar.',
    ubicacion: 'Fila distal del carpo, lado radial.',
    articulaciones: [
      art('Articulación trapeciometacarpiana', 'sinovial selar', 'metacarpiano-1~'),
      art('Articulaciones intercarpianas y carpometacarpiana', INTERCARPIANA, 'escafoides~', 'trapezoide~', 'metacarpiano-2~'),
    ],
    datosClinicos: 'La rizartrosis (artrosis trapeciometacarpiana) es muy frecuente en mujeres a partir de los 50 años.',
  }),
  ...par('trapezoide', 'm', {
    ...CARPO,
    nombre: 'Trapezoide {lado}',
    latin: 'Os trapezoideum',
    ingles: '{Side} trapezoid',
    descripcion: 'El hueso más pequeño de la fila distal del carpo, en forma de cuña.',
    funcion: 'Articula con la base del segundo metacarpiano y estabiliza el carpo.',
    ubicacion: 'Fila distal del carpo, entre el trapecio y el hueso grande.',
    articulaciones: [art('Articulaciones intercarpianas y carpometacarpiana', INTERCARPIANA, 'escafoides~', 'trapecio~', 'grande~', 'metacarpiano-2~')],
    datosClinicos: 'Sus fracturas aisladas son raras por su posición protegida.',
  }),
  ...par('grande', 'm', {
    ...CARPO,
    nombre: 'Hueso grande {lado}',
    latin: 'Os capitatum',
    ingles: '{Side} capitate',
    descripcion: 'El mayor hueso del carpo, en el centro de la fila distal.',
    funcion: 'Es el eje central del carpo; articula sobre todo con el tercer metacarpiano.',
    ubicacion: 'Centro de la fila distal del carpo.',
    articulaciones: [
      art('Articulaciones intercarpianas (mediocarpiana)', INTERCARPIANA, 'escafoides~', 'semilunar~', 'trapezoide~', 'ganchoso~'),
      art('Articulaciones carpometacarpianas', INTERCARPIANA, 'metacarpiano-2~', 'metacarpiano-3~', 'metacarpiano-4~'),
    ],
    datosClinicos: 'Es el primer hueso del carpo en osificarse (durante el primer año de vida); los huesos del carpo se usan para estimar la edad ósea.',
  }),
  ...par('ganchoso', 'm', {
    ...CARPO,
    nombre: 'Ganchoso {lado}',
    latin: 'Os hamatum',
    ingles: '{Side} hamate',
    descripcion: 'Hueso en forma de cuña de la fila distal del carpo, con una apófisis en gancho palpable en la palma.',
    funcion: 'Articula con el 4.º y 5.º metacarpianos; su gancho limita el canal carpiano y el canal de Guyon.',
    ubicacion: 'Fila distal del carpo, lado cubital.',
    articulaciones: [
      art('Articulaciones intercarpianas', INTERCARPIANA, 'piramidal~', 'grande~'),
      art('Articulaciones carpometacarpianas', INTERCARPIANA, 'metacarpiano-4~', 'metacarpiano-5~'),
    ],
    datosClinicos: 'El gancho del ganchoso puede fracturarse en deportes con palo o raqueta (golf, béisbol, tenis).',
  }),
];

// ---------------------------------------------------------------- Metacarpo
const metacarpo = [1, 2, 3, 4, 5].flatMap((n) => {
  const carpo = { 1: ['trapecio~'], 2: ['trapecio~', 'trapezoide~', 'grande~'], 3: ['grande~'], 4: ['grande~', 'ganchoso~'], 5: ['ganchoso~'] }[n];
  const vecinos = [n - 1, n + 1].filter((k) => k >= 2 && k <= 5 && n >= 2).map((k) => `metacarpiano-${k}~`);
  const propio = {
    1: {
      descripcion: 'Primer metacarpiano: el más corto y robusto; forma el esqueleto del pulgar dentro de la palma.',
      datosClinicos: 'La fractura de Bennett es una fractura-luxación intraarticular de su base.',
    },
    2: { descripcion: 'Segundo metacarpiano: el más largo de los cinco.' },
    3: { descripcion: 'Tercer metacarpiano: presenta una apófisis estiloides en la cara dorsal de su base.' },
    5: { datosClinicos: 'La «fractura del boxeador» afecta al cuello del 5.º metacarpiano al golpear con el puño cerrado.' },
  }[n] ?? {};
  return par(`metacarpiano-${n}`, 'm', {
    nombre: `${cap(ORDINAL_M[n - 1])} metacarpiano {lado}`,
    latin: `Os metacarpi ${ROMANO[n - 1]}`,
    ingles: `{Side} ${ORDINAL_EN[n - 1]} metacarpal`,
    region: 'mano',
    clasificacion: ['largo'],
    descripcion: 'Hueso largo de la palma con base, cuerpo y cabeza; las cabezas forman los nudillos.',
    funcion: 'Forma el esqueleto de la palma y articula con el carpo y con la falange proximal de su dedo.',
    ubicacion: `Palma de la mano, radio ${n} (del pulgar hacia el meñique).`,
    articulaciones: [
      art(n === 1 ? 'Articulación trapeciometacarpiana' : 'Articulación carpometacarpiana', n === 1 ? 'sinovial selar' : 'sinovial plana', ...carpo),
      ...(vecinos.length ? [art('Articulaciones intermetacarpianas', 'sinovial plana', ...vecinos)] : []),
      art('Articulación metacarpofalángica', 'sinovial condílea (elipsoidea)', `falange-proximal-mano-${n}~`),
    ],
    datosClinicos: 'Las fracturas de los metacarpianos son frecuentes en traumatismos de la mano y pueden rotar el dedo si no se alinean bien.',
    ...propio,
  });
});

// ---------------------------------------------------------------- Falanges de la mano
const DEDOS = ['pulgar', 'índice', 'dedo medio', 'anular', 'meñique'];
const DEDOS_EN = ['thumb', 'index finger', 'middle finger', 'ring finger', 'little finger'];

function falangeMano(fila, n) {
  const dedo = DEDOS[n - 1];
  const filaLat = { proximal: 'proximalis', media: 'media', distal: 'distalis' }[fila];
  const filaEn = { proximal: 'Proximal', media: 'Middle', distal: 'Distal' }[fila];
  const pulgar = n === 1;
  const articulaciones = articulacionesFalange('mano', fila, n, pulgar, `metacarpiano-${n}~`, 'metacarpofalángica');

  const textos = {
    proximal: {
      descripcion: 'Falange proximal: la más larga del dedo; su base cóncava articula con la cabeza del metacarpiano.',
      datosClinicos: pulgar
        ? 'El «pulgar del esquiador» es la rotura del ligamento colateral cubital de la articulación metacarpofalángica del pulgar.'
        : 'Las fracturas de las falanges son de las fracturas más frecuentes de la mano.',
    },
    media: {
      descripcion: 'Falange media: intermedia entre la proximal y la distal, con las que forma las articulaciones interfalángicas en bisagra.',
      datosClinicos: 'El «dedo en ojal» se produce por la lesión de la banda central del tendón extensor sobre la interfalángica proximal.',
    },
    distal: {
      descripcion: 'Falange distal: la más pequeña; termina en la tuberosidad ungueal, que sostiene el pulpejo y la uña.',
      datosClinicos: 'El «dedo en martillo» se debe a la rotura o el arrancamiento del tendón extensor en la base de la falange distal.',
    },
  }[fila];

  return par(`falange-${fila}-mano-${n}`, 'm', {
    nombre: `Falange ${fila} del ${dedo} {lado}`,
    latin: `Phalanx ${filaLat} manus (digitus ${ROMANO[n - 1]})`,
    ingles: `${filaEn} phalanx of {side} ${DEDOS_EN[n - 1]}`,
    region: 'mano',
    clasificacion: ['largo'],
    funcion: 'Forma el esqueleto del dedo y permite su flexión y extensión, imprescindibles para la prensión.',
    ubicacion: `${cap(dedo)} (${ROMANO[n - 1]}) de la mano, segmento ${fila === 'media' ? 'medio' : fila}.`,
    articulaciones,
    ...textos,
    ...(pulgar && fila !== 'media' ? { curiosidad: 'El pulgar tiene solo dos falanges: carece de falange media.' } : {}),
  });
}

const falanges = [
  ...[1, 2, 3, 4, 5].flatMap((n) => falangeMano('proximal', n)),
  ...[2, 3, 4, 5].flatMap((n) => falangeMano('media', n)),
  ...[1, 2, 3, 4, 5].flatMap((n) => falangeMano('distal', n)),
];

export default [...cinturaYBrazo, ...carpo, ...metacarpo, ...falanges];
