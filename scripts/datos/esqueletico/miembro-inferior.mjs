// Miembro inferior: cintura pélvica, muslo y pierna, pie (31 huesos por lado).
import { ORDINAL_EN, ORDINAL_M, ROMANO, art, articulacionesFalange, cap, par } from '../util.mjs';

const muslaYPierna = [
  ...par('coxal', 'm', {
    nombre: 'Hueso coxal {lado}',
    latin: 'Os coxae',
    ingles: '{Side} hip bone',
    region: 'cintura-pelvica',
    clasificacion: ['plano'],
    descripcion: 'Hueso grande formado por la fusión del ilion, el isquion y el pubis, que convergen en el acetábulo.',
    funcion:
      'Une el miembro inferior al tronco y transmite el peso del cuerpo; con el sacro forma la pelvis, que protege las vísceras pélvicas.',
    ubicacion: 'Cadera; los dos coxales forman las paredes laterales y anterior de la pelvis.',
    articulaciones: [
      art('Articulación sacroilíaca', 'sinovial plana (con potentes ligamentos)', 'sacro'),
      art('Sínfisis del pubis', 'cartilaginosa (sínfisis)', 'coxal^'),
      art('Articulación coxofemoral (cadera)', 'sinovial esferoidea', 'femur~'),
    ],
    datosClinicos: 'La cresta ilíaca es un lugar habitual para la biopsia de médula ósea y para obtener injerto óseo.',
    curiosidad: 'El ilion, el isquion y el pubis se fusionan en el acetábulo durante la adolescencia.',
  }),
  ...par('femur', 'm', {
    nombre: 'Fémur {lado}',
    latin: 'Femur',
    ingles: '{Side} femur',
    region: 'muslo-pierna',
    clasificacion: ['largo'],
    descripcion:
      'El hueso más largo y fuerte del cuerpo: cabeza, cuello, trocánteres mayor y menor, diáfisis con la línea áspera y cóndilos medial y lateral en el extremo distal.',
    funcion: 'Transmite el peso del cuerpo de la cadera a la rodilla y da inserción a los potentes músculos del muslo y de la cadera.',
    ubicacion: 'Muslo, entre la cadera y la rodilla.',
    articulaciones: [
      art('Articulación coxofemoral (cadera)', 'sinovial esferoidea', 'coxal~'),
      art('Articulación femorotibial (rodilla)', 'sinovial bicondílea', 'tibia~'),
      art('Articulación femoropatelar (rodilla)', 'sinovial (compartimento de la rodilla)', 'rotula~'),
    ],
    datosClinicos:
      'Las fracturas del cuello femoral son típicas de personas mayores con osteoporosis y pueden comprometer la irrigación de la cabeza femoral (necrosis avascular).',
    curiosidad: 'Su longitud equivale aproximadamente a una cuarta parte de la estatura.',
  }),
  ...par('rotula', 'f', {
    nombre: 'Rótula {lado}',
    latin: 'Patella',
    ingles: '{Side} patella',
    region: 'muslo-pierna',
    clasificacion: ['sesamoideo'],
    descripcion: 'El mayor hueso sesamoideo del cuerpo, de forma triangular, incluido en el tendón del cuádriceps.',
    funcion: 'Aumenta el brazo de palanca del cuádriceps en la extensión de la rodilla y protege la cara anterior de la articulación.',
    ubicacion: 'Cara anterior de la rodilla.',
    articulaciones: [art('Articulación femoropatelar', 'sinovial (compartimento de la rodilla)', 'femur~')],
    relacionesExtra: ['tibia~'],
    datosClinicos: 'La luxación lateral de la rótula es frecuente en adolescentes. Golpear el ligamento rotuliano provoca el reflejo rotuliano (L3–L4).',
  }),
  ...par('tibia', 'f', {
    nombre: 'Tibia {lado}',
    latin: 'Tibia',
    ingles: '{Side} tibia',
    region: 'muslo-pierna',
    clasificacion: ['largo'],
    descripcion:
      'Hueso medial y principal de la pierna. Su meseta proximal soporta el peso, su borde anterior es subcutáneo (la espinilla) y en su extremo distal forma el maléolo medial.',
    funcion: 'Transmite el peso del cuerpo del fémur al pie.',
    ubicacion: 'Pierna, lado medial.',
    articulaciones: [
      art('Articulación femorotibial (rodilla)', 'sinovial bicondílea', 'femur~'),
      art('Articulación tibioperonea proximal', 'sinovial plana', 'perone~'),
      art('Sindesmosis tibioperonea distal', 'fibrosa (sindesmosis)', 'perone~'),
      art('Articulación talocrural (tobillo)', 'sinovial troclear (gínglimo)', 'astragalo~'),
    ],
    relacionesExtra: ['rotula~'],
    datosClinicos: 'Por su cara anteromedial subcutánea, es el hueso largo que con más frecuencia sufre fracturas abiertas.',
    curiosidad: 'En su tuberosidad se inserta el ligamento rotuliano; su inflamación en adolescentes deportistas es la enfermedad de Osgood-Schlatter.',
  }),
  ...par('perone', 'm', {
    nombre: 'Peroné (fíbula) {lado}',
    latin: 'Fibula',
    ingles: '{Side} fibula',
    region: 'muslo-pierna',
    clasificacion: ['largo'],
    descripcion: 'Hueso lateral y delgado de la pierna; su extremo distal forma el maléolo lateral.',
    funcion: 'Soporta poco peso: sirve sobre todo de inserción muscular y estabiliza el tobillo con el maléolo lateral.',
    ubicacion: 'Pierna, lado lateral.',
    articulaciones: [
      art('Articulación tibioperonea proximal', 'sinovial plana', 'tibia~'),
      art('Sindesmosis tibioperonea distal', 'fibrosa (sindesmosis)', 'tibia~'),
      art('Articulación talocrural (tobillo)', 'sinovial troclear (gínglimo)', 'astragalo~'),
    ],
    datosClinicos:
      'El nervio peroneo común rodea el cuello del peroné; puede lesionarse en fracturas o por compresión (p. ej. un yeso apretado) y causar pie caído.',
    curiosidad: 'Por su escasa función de carga se utiliza como injerto óseo vascularizado en cirugía reconstructiva.',
  }),
];

// ---------------------------------------------------------------- Tarso
const TARSO = { region: 'pie', clasificacion: ['corto'] };
const INTERTARSIANA = 'sinovial plana';

const tarso = [
  ...par('astragalo', 'm', {
    ...TARSO,
    nombre: 'Astrágalo (talus) {lado}',
    latin: 'Talus',
    ingles: '{Side} talus',
    descripcion: 'Hueso del tarso situado entre la pierna y el calcáneo; su tróclea encaja en la mortaja formada por la tibia y el peroné.',
    funcion: 'Transmite todo el peso del cuerpo de la pierna al pie.',
    ubicacion: 'Parte superior del tarso, en el tobillo.',
    articulaciones: [
      art('Articulación talocrural (tobillo)', 'sinovial troclear (gínglimo)', 'tibia~', 'perone~'),
      art('Articulación subastragalina', 'sinovial plana', 'calcaneo~'),
      art('Articulación talonavicular', 'sinovial esferoidea', 'navicular~'),
    ],
    datosClinicos: 'Gran parte de su superficie es cartílago y su irrigación es precaria: las fracturas del cuello pueden causar necrosis avascular.',
    curiosidad: 'Es el único hueso del tarso en el que no se inserta ningún músculo.',
  }),
  ...par('calcaneo', 'm', {
    ...TARSO,
    nombre: 'Calcáneo {lado}',
    latin: 'Calcaneus',
    ingles: '{Side} calcaneus',
    descripcion: 'El hueso más grande del tarso; forma el talón.',
    funcion: 'Transmite el peso al suelo y en él se inserta el tendón calcáneo (de Aquiles), palanca para la flexión plantar.',
    ubicacion: 'Parte posterior e inferior del pie (talón).',
    articulaciones: [
      art('Articulación subastragalina', 'sinovial plana', 'astragalo~'),
      art('Articulación calcaneocuboidea', 'sinovial selar', 'cuboides~'),
    ],
    datosClinicos: 'Es el hueso del tarso que más se fractura, típicamente en caídas de altura sobre los talones.',
    curiosidad: 'El sustentáculo del astrágalo es una repisa del calcáneo que sostiene al astrágalo.',
  }),
  ...par('navicular', 'm', {
    ...TARSO,
    nombre: 'Navicular {lado}',
    latin: 'Os naviculare',
    ingles: '{Side} navicular',
    descripcion: 'Hueso del tarso en forma de barca, en el borde medial del pie.',
    funcion: 'Es la clave del arco longitudinal medial; articula con el astrágalo y con las tres cuñas.',
    ubicacion: 'Borde medial del pie, delante del astrágalo.',
    articulaciones: [
      art('Articulación talonavicular', 'sinovial esferoidea', 'astragalo~'),
      art('Articulación cuneonavicular', INTERTARSIANA, 'cuneiforme-medial~', 'cuneiforme-intermedio~', 'cuneiforme-lateral~'),
    ],
    relacionesExtra: ['cuboides~'],
    datosClinicos: 'Su tuberosidad es palpable en el borde medial del pie; las fracturas por estrés son frecuentes en atletas de carrera y salto.',
    curiosidad: 'Puede existir un navicular accesorio, causa de dolor en el borde medial del pie.',
  }),
  ...par('cuboides', 'm', {
    ...TARSO,
    nombre: 'Cuboides {lado}',
    latin: 'Os cuboideum',
    ingles: '{Side} cuboid',
    descripcion: 'Hueso del tarso de forma cúbica, en el borde lateral del pie.',
    funcion: 'Forma parte del arco longitudinal lateral; tiene un surco por el que pasa el tendón del peroneo largo.',
    ubicacion: 'Borde lateral del pie, delante del calcáneo.',
    articulaciones: [
      art('Articulación calcaneocuboidea', 'sinovial selar', 'calcaneo~'),
      art('Articulación cuneocuboidea', INTERTARSIANA, 'cuneiforme-lateral~'),
      art('Articulaciones tarsometatarsianas', INTERTARSIANA, 'metatarsiano-4~', 'metatarsiano-5~'),
    ],
    relacionesExtra: ['navicular~'],
    datosClinicos: 'Puede fracturarse al quedar comprimido entre el calcáneo y los metatarsianos («fractura en cascanueces»).',
  }),
  ...par('cuneiforme-medial', 'm', {
    ...TARSO,
    nombre: 'Cuneiforme medial {lado}',
    latin: 'Os cuneiforme mediale',
    ingles: '{Side} medial cuneiform',
    descripcion: 'La mayor de las tres cuñas del tarso.',
    funcion: 'Contribuye al arco transverso del pie y sostiene la base del primer metatarsiano.',
    ubicacion: 'Borde medial del pie, entre el navicular y el primer metatarsiano.',
    articulaciones: [
      art('Articulación cuneonavicular', INTERTARSIANA, 'navicular~'),
      art('Articulación intercuneiforme', INTERTARSIANA, 'cuneiforme-intermedio~'),
      art('Articulaciones tarsometatarsianas (de Lisfranc)', INTERTARSIANA, 'metatarsiano-1~', 'metatarsiano-2~'),
    ],
    datosClinicos: 'El ligamento de Lisfranc une la cuña medial con la base del 2.º metatarsiano; su rotura desestabiliza el mediopié.',
  }),
  ...par('cuneiforme-intermedio', 'm', {
    ...TARSO,
    nombre: 'Cuneiforme intermedio {lado}',
    latin: 'Os cuneiforme intermedium',
    ingles: '{Side} intermediate cuneiform',
    descripcion: 'La más pequeña de las tres cuñas del tarso.',
    funcion: 'Contribuye al arco transverso del pie y forma un hueco en el que encaja la base del 2.º metatarsiano.',
    ubicacion: 'Mediopié, entre las cuñas medial y lateral.',
    articulaciones: [
      art('Articulación cuneonavicular', INTERTARSIANA, 'navicular~'),
      art('Articulaciones intercuneiformes', INTERTARSIANA, 'cuneiforme-medial~', 'cuneiforme-lateral~'),
      art('Articulación tarsometatarsiana', INTERTARSIANA, 'metatarsiano-2~'),
    ],
    datosClinicos: 'Las lesiones de la articulación tarsometatarsiana (de Lisfranc) pueden pasar desapercibidas en radiografías sin carga.',
  }),
  ...par('cuneiforme-lateral', 'm', {
    ...TARSO,
    nombre: 'Cuneiforme lateral {lado}',
    latin: 'Os cuneiforme laterale',
    ingles: '{Side} lateral cuneiform',
    descripcion: 'Cuña intermedia en tamaño entre la medial y la intermedia, situada junto al cuboides.',
    funcion: 'Contribuye al arco transverso del pie y sostiene la base del tercer metatarsiano.',
    ubicacion: 'Mediopié, entre la cuña intermedia y el cuboides.',
    articulaciones: [
      art('Articulación cuneonavicular', INTERTARSIANA, 'navicular~'),
      art('Articulaciones intercuneiforme y cuneocuboidea', INTERTARSIANA, 'cuneiforme-intermedio~', 'cuboides~'),
      art('Articulaciones tarsometatarsianas', INTERTARSIANA, 'metatarsiano-2~', 'metatarsiano-3~', 'metatarsiano-4~'),
    ],
    datosClinicos: 'Sus fracturas aisladas son poco frecuentes y suelen formar parte de lesiones de la articulación de Lisfranc.',
  }),
];

// ---------------------------------------------------------------- Metatarso
const metatarso = [1, 2, 3, 4, 5].flatMap((n) => {
  const tarsoMt = {
    1: ['cuneiforme-medial~'],
    2: ['cuneiforme-medial~', 'cuneiforme-intermedio~', 'cuneiforme-lateral~'],
    3: ['cuneiforme-lateral~'],
    4: ['cuneiforme-lateral~', 'cuboides~'],
    5: ['cuboides~'],
  }[n];
  const vecinos = [n - 1, n + 1].filter((k) => k >= 2 && k <= 5 && n >= 2).map((k) => `metatarsiano-${k}~`);
  const propio = {
    1: {
      descripcion: 'Primer metatarsiano: el más corto y grueso; bajo su cabeza hay dos huesos sesamoideos y soporta buena parte de la carga del antepié.',
      datosClinicos: 'En el hallux valgus (juanete) el primer metatarsiano se desvía hacia medial y el dedo gordo hacia lateral.',
    },
    2: {
      descripcion: 'Segundo metatarsiano: el más largo; su base encaja entre las cuñas, lo que lo hace el más estable.',
      datosClinicos: 'Es el que con más frecuencia sufre fracturas de estrés («fractura de marcha»).',
    },
    5: {
      descripcion: 'Quinto metatarsiano: presenta en su base una tuberosidad en la que se inserta el peroneo corto.',
      datosClinicos: 'La fractura de Jones, en la unión metafisodiafisaria del 5.º metatarsiano, tiene tendencia a consolidar mal.',
    },
  }[n] ?? {};
  return par(`metatarsiano-${n}`, 'm', {
    nombre: `${cap(ORDINAL_M[n - 1])} metatarsiano {lado}`,
    latin: `Os metatarsi ${ROMANO[n - 1]}`,
    ingles: `{Side} ${ORDINAL_EN[n - 1]} metatarsal`,
    region: 'pie',
    clasificacion: ['largo'],
    descripcion: 'Hueso largo del antepié con base, cuerpo y cabeza; las cabezas apoyan en el suelo durante la marcha.',
    funcion: 'Forma el esqueleto del antepié, participa en los arcos del pie y transmite el impulso durante el despegue de la marcha.',
    ubicacion: `Antepié, radio ${n} (del dedo gordo hacia el pequeño).`,
    articulaciones: [
      art('Articulación tarsometatarsiana (de Lisfranc)', 'sinovial plana', ...tarsoMt),
      ...(vecinos.length ? [art('Articulaciones intermetatarsianas', 'sinovial plana', ...vecinos)] : []),
      art('Articulación metatarsofalángica', 'sinovial condílea (elipsoidea)', `falange-proximal-pie-${n}~`),
    ],
    datosClinicos: 'La metatarsalgia (dolor bajo las cabezas de los metatarsianos) es una causa frecuente de dolor en el antepié.',
    ...propio,
  });
});

// ---------------------------------------------------------------- Falanges del pie
const DEDOS = ['dedo gordo (hallux)', 'segundo dedo', 'tercer dedo', 'cuarto dedo', 'quinto dedo'];
const DEDOS_EN = ['big toe', 'second toe', 'third toe', 'fourth toe', 'little toe'];

function falangePie(fila, n) {
  const filaLat = { proximal: 'proximalis', media: 'media', distal: 'distalis' }[fila];
  const filaEn = { proximal: 'Proximal', media: 'Middle', distal: 'Distal' }[fila];
  const hallux = n === 1;
  const textos = {
    proximal: {
      descripcion: 'Falange proximal: la más larga del dedo; su base articula con la cabeza del metatarsiano.',
      datosClinicos: hallux
        ? 'El hallux rigidus es la artrosis de la articulación metatarsofalángica del dedo gordo, que limita su extensión al caminar.'
        : 'Las fracturas de las falanges de los dedos del pie suelen producirse al golpear el pie descalzo contra un objeto.',
    },
    media: {
      descripcion: 'Falange media: corta, entre la proximal y la distal.',
      datosClinicos: 'En el dedo en martillo la interfalángica proximal queda flexionada de forma permanente.',
    },
    distal: {
      descripcion: 'Falange distal: la más pequeña; termina en la tuberosidad que sostiene el pulpejo y la uña.',
      datosClinicos: hallux
        ? 'La uña encarnada (onicocriptosis) afecta sobre todo al dedo gordo.'
        : 'Los traumatismos de la falange distal suelen acompañarse de hematoma bajo la uña.',
    },
  }[fila];

  return par(`falange-${fila}-pie-${n}`, 'm', {
    nombre: `Falange ${fila} del ${DEDOS[n - 1]} del pie {lado}`,
    latin: `Phalanx ${filaLat} pedis (digitus ${ROMANO[n - 1]})`,
    ingles: `${filaEn} phalanx of {side} ${DEDOS_EN[n - 1]}`,
    region: 'pie',
    clasificacion: ['largo'],
    funcion: 'Forma el esqueleto del dedo; los dedos ayudan al equilibrio y al despegue durante la marcha.',
    ubicacion: `${cap(DEDOS[n - 1])} del pie, segmento ${fila === 'media' ? 'medio' : fila}.`,
    articulaciones: articulacionesFalange('pie', fila, n, hallux, `metatarsiano-${n}~`, 'metatarsofalángica'),
    ...textos,
    ...(hallux ? { curiosidad: 'Como el pulgar, el dedo gordo tiene solo dos falanges.' } : {}),
    ...(n === 5 && fila === 'media'
      ? { curiosidad: 'En muchas personas la falange media del quinto dedo está fusionada con la distal.' }
      : {}),
  });
}

const falanges = [
  ...[1, 2, 3, 4, 5].flatMap((n) => falangePie('proximal', n)),
  ...[2, 3, 4, 5].flatMap((n) => falangePie('media', n)),
  ...[1, 2, 3, 4, 5].flatMap((n) => falangePie('distal', n)),
];

export default [...muslaYPierna, ...tarso, ...metatarso, ...falanges];
