// Columna vertebral (26 huesos + discos) y tórax (esternón, 24 costillas, cartílagos costales).
import { ORDINAL_EN, ORDINAL_F, ORDINAL_M, ROMANO, art, cap, impar, par } from '../util.mjs';

const SINFISIS = 'cartilaginosa (sínfisis)';
const CIGAPOFISARIA = 'sinovial plana';

const nombreVertebra = { c: 'cervical', t: 'torácica', l: 'lumbar' };
const latinVertebra = { c: 'cervicalis', t: 'thoracica', l: 'lumbalis' };
const inglesVertebra = { c: 'cervical', t: 'thoracic', l: 'lumbar' };
const CUANTAS = { c: 7, t: 12, l: 5 };

const etiqueta = (s, n) => `${s.toUpperCase()}${n}`;

/** Vértebra anterior y siguiente (ids), incluyendo el paso entre regiones y al sacro. */
function vecinas(s, n) {
  const orden = [...Array(7)].map((_, i) => `c${i + 1}`).concat([...Array(12)].map((_, i) => `t${i + 1}`), [...Array(5)].map((_, i) => `l${i + 1}`));
  const i = orden.indexOf(`${s}${n}`);
  return {
    arriba: i > 0 ? `vertebra-${orden[i - 1]}` : null,
    abajo: i < orden.length - 1 ? `vertebra-${orden[i + 1]}` : 'sacro',
  };
}

function articulacionesIntervertebrales(s, n) {
  const { arriba, abajo } = vecinas(s, n);
  const con = [arriba, abajo].filter((x) => x && x !== 'vertebra-c1');
  return [
    art('Sínfisis intervertebrales (discos)', SINFISIS, ...con),
    art('Articulaciones cigapofisarias', CIGAPOFISARIA, ...[arriba, abajo].filter(Boolean)),
  ];
}

/** Discos adyacentes a una vértebra (ids que existen en el modelo). */
function discos(s, n) {
  const { arriba, abajo } = vecinas(s, n);
  const ids = [];
  if (arriba && arriba !== 'vertebra-c1') ids.push(`disco-${arriba.replace('vertebra-', '')}-${s}${n}`);
  if (`${s}${n}` !== 'c1') ids.push(`disco-${s}${n}-${abajo === 'sacro' ? 's1' : abajo.replace('vertebra-', '')}`);
  return ids;
}

function vertebra(s, n, datos) {
  const id = `vertebra-${s}${n}`;
  return impar(id, {
    nombre: `Vértebra ${nombreVertebra[s]} ${etiqueta(s, n)}`,
    latin: `Vertebra ${latinVertebra[s]} ${ROMANO[n - 1]}`,
    ingles: `${cap(ORDINAL_EN[n - 1])} ${inglesVertebra[s]} vertebra (${etiqueta(s, n)})`,
    region: 'columna',
    clasificacion: ['irregular'],
    ubicacion: `Columna vertebral, nivel ${etiqueta(s, n)}.`,
    articulaciones: articulacionesIntervertebrales(s, n),
    relacionesExtra: discos(s, n),
    ...datos,
  });
}

// ---------------------------------------------------------------- Cervicales
const CERVICAL_TIPICA = {
  descripcion:
    'Vértebra cervical típica: cuerpo pequeño y ancho, agujero vertebral grande y triangular, apófisis espinosa corta y bífida y agujeros transversos en las apófisis transversas.',
  funcion: 'Sostiene el cuello y le da movilidad. Por los agujeros transversos de C1 a C6 suben la arteria y las venas vertebrales.',
  datosClinicos: 'La espondilosis cervical (artrosis) puede estrechar los agujeros intervertebrales y comprimir las raíces nerviosas (radiculopatía).',
};

const cervicales = [
  vertebra('c', 1, {
    nombre: 'Atlas (vértebra C1)',
    latin: 'Atlas',
    ingles: 'Atlas (C1)',
    descripcion: 'Primera vértebra cervical. No tiene cuerpo ni apófisis espinosa: es un anillo con dos masas laterales y arcos anterior y posterior.',
    funcion: 'Sostiene el cráneo y permite la flexión y extensión de la cabeza (movimiento de asentir).',
    ubicacion: 'Parte superior del cuello, inmediatamente por debajo del occipital.',
    articulaciones: [
      art('Articulación atlantooccipital', 'sinovial elipsoidea', 'occipital'),
      art('Articulación atlantoaxial media', 'sinovial trocoide', 'vertebra-c2'),
      art('Articulaciones atlantoaxiales laterales', 'sinovial plana', 'vertebra-c2'),
    ],
    relacionesExtra: [],
    datosClinicos: 'La fractura de Jefferson es una fractura por estallido del anillo del atlas causada por una compresión axial (p. ej. un golpe en la cabeza al zambullirse).',
    curiosidad: 'Recibe su nombre del titán Atlas, que en la mitología griega sostenía la bóveda celeste.',
  }),
  vertebra('c', 2, {
    nombre: 'Axis (vértebra C2)',
    latin: 'Axis',
    ingles: 'Axis (C2)',
    descripcion: 'Segunda vértebra cervical. Se caracteriza por la apófisis odontoides (diente), que se proyecta hacia arriba dentro del anillo del atlas.',
    funcion: 'Actúa como pivote sobre el que gira el atlas, y con él la cabeza (movimiento de negar).',
    articulaciones: [
      art('Articulación atlantoaxial media', 'sinovial trocoide', 'vertebra-c1'),
      art('Articulaciones atlantoaxiales laterales', 'sinovial plana', 'vertebra-c1'),
      art('Sínfisis intervertebral C2–C3', SINFISIS, 'vertebra-c3'),
      art('Articulaciones cigapofisarias C2–C3', CIGAPOFISARIA, 'vertebra-c3'),
    ],
    relacionesExtra: ['disco-c2-c3'],
    datosClinicos: 'Las fracturas de la odontoides y la «fractura del ahorcado» (de la porción interarticular de C2) son lesiones características de la columna cervical alta.',
    curiosidad: 'La articulación atlantoaxial aporta aproximadamente la mitad de la rotación del cuello.',
  }),
  vertebra('c', 3, CERVICAL_TIPICA),
  vertebra('c', 4, CERVICAL_TIPICA),
  vertebra('c', 5, CERVICAL_TIPICA),
  vertebra('c', 6, {
    ...CERVICAL_TIPICA,
    curiosidad: 'El tubérculo anterior de su apófisis transversa (tubérculo carotídeo) permite comprimir la arteria carótida común contra él.',
  }),
  vertebra('c', 7, {
    nombre: 'Vértebra prominente (C7)',
    latin: 'Vertebra prominens',
    descripcion: 'Séptima vértebra cervical. Su apófisis espinosa es larga, no bífida y fácil de palpar en la base del cuello.',
    funcion: 'Forma la transición entre la columna cervical y la torácica; su espinosa es una referencia para contar las vértebras.',
    datosClinicos: 'Puede presentar una costilla cervical, que llega a comprimir el plexo braquial o la arteria subclavia (síndrome del desfiladero torácico).',
    curiosidad: 'Su agujero transverso suele dar paso solo a venas vertebrales: la arteria vertebral entra habitualmente por el de C6.',
  }),
];

// ---------------------------------------------------------------- Torácicas
const toracicas = [...Array(12)].map((_, i) => {
  const n = i + 1;
  // La cabeza de la costilla k articula con T(k-1) y T(k) para k = 2–9; la 1.ª y la 10.ª–12.ª solo con su vértebra.
  // Por tanto T(n) recibe las costillas n y n+1 hasta T8, y solo la suya desde T9.
  const costillasCabeza = n <= 8 ? [n, n + 1] : [n];
  const costillasTransversas = n <= 10 ? [n] : [];
  const costillasIds = (ns) => ns.flatMap((k) => [`costilla-${k}-d`, `costilla-${k}-i`]);
  const extra = {
    1: { curiosidad: 'Tiene una fosita costal completa para la primera costilla y una semifosita para la segunda.' },
    2: {},
    4: { curiosidad: 'El ángulo esternal (de Louis) se proyecta a la altura del disco entre T4 y T5.' },
    11: { datosClinicos: 'La unión toracolumbar (T11–L2) es la zona donde más se producen fracturas vertebrales traumáticas.' },
    12: {
      descripcion:
        'Vértebra de transición entre la columna torácica y la lumbar: tiene fositas costales solo en el cuerpo y apófisis articulares inferiores de tipo lumbar.',
      datosClinicos: 'La unión toracolumbar (T11–L2) es la zona donde más se producen fracturas vertebrales traumáticas.',
    },
  }[n] ?? {};
  return vertebra('t', n, {
    descripcion:
      n <= 10
        ? 'Vértebra torácica: cuerpo en forma de corazón con fositas costales para las cabezas de las costillas, apófisis transversas con fositas para los tubérculos costales y apófisis espinosa larga e inclinada hacia abajo.'
        : 'Vértebra torácica baja: cuerpo grande con una única fosita costal completa y apófisis transversas sin fositas costales.',
    funcion: 'Forma parte de la columna torácica, protege la médula espinal y sirve de anclaje posterior a las costillas.',
    datosClinicos: 'La columna torácica es asiento frecuente de fracturas vertebrales por compresión en la osteoporosis, que acentúan la cifosis.',
    articulaciones: [
      ...articulacionesIntervertebrales('t', n),
      art('Articulaciones de la cabeza de la costilla', 'sinovial plana', ...costillasIds(costillasCabeza)),
      ...(costillasTransversas.length ? [art('Articulaciones costotransversas', 'sinovial plana', ...costillasIds(costillasTransversas))] : []),
    ],
    ...extra,
  });
});

// ---------------------------------------------------------------- Lumbares
const LUMBAR = {
  descripcion:
    'Vértebra lumbar: el cuerpo más grande de la columna, en forma de riñón, apófisis espinosa corta, gruesa y horizontal (en hacha) y apófisis articulares orientadas en sentido sagital.',
  funcion: 'Soporta gran parte del peso del tronco y permite la flexión y extensión de la región lumbar.',
  datosClinicos: 'Las hernias discales lumbares son más frecuentes en los niveles L4–L5 y L5–S1.',
};
const lumbares = [
  vertebra('l', 1, { ...LUMBAR, curiosidad: 'En el adulto la médula espinal suele terminar (cono medular) a la altura de L1–L2.' }),
  vertebra('l', 2, LUMBAR),
  vertebra('l', 3, LUMBAR),
  vertebra('l', 4, {
    ...LUMBAR,
    curiosidad: 'La línea que une las crestas ilíacas (línea de Tuffier) pasa por L4 o el espacio L4–L5: es la referencia para la punción lumbar.',
  }),
  vertebra('l', 5, {
    ...LUMBAR,
    descripcion: 'Quinta vértebra lumbar: la de mayor cuerpo, más alto por delante que por detrás, con apófisis transversas gruesas.',
    datosClinicos: 'La espondilólisis (defecto de la porción interarticular) y la espondilolistesis son más frecuentes en L5.',
    articulaciones: [
      art('Sínfisis intervertebral L4–L5', SINFISIS, 'vertebra-l4'),
      art('Articulaciones cigapofisarias L4–L5', CIGAPOFISARIA, 'vertebra-l4'),
      art('Articulación lumbosacra', `${SINFISIS} y sinovial plana`, 'sacro'),
    ],
  }),
];

// ---------------------------------------------------------------- Sacro y cóccix
const sacroCoccix = [
  impar('sacro', {
    nombre: 'Sacro',
    latin: 'Os sacrum',
    ingles: 'Sacrum',
    region: 'columna',
    clasificacion: ['irregular'],
    descripcion: 'Hueso triangular formado por la fusión de las cinco vértebras sacras. Presenta cuatro pares de agujeros sacros anteriores y cuatro posteriores.',
    funcion: 'Transmite el peso del tronco a la pelvis y forma la pared posterior de la cavidad pélvica.',
    ubicacion: 'Base de la columna vertebral, encajado entre los dos huesos coxales.',
    articulaciones: [
      art('Articulación lumbosacra', `${SINFISIS} y sinovial plana`, 'vertebra-l5'),
      art('Articulación sacroilíaca', 'sinovial plana (con potentes ligamentos)', 'coxal-d', 'coxal-i'),
      art('Articulación sacrococcígea', SINFISIS, 'coccix'),
    ],
    relacionesExtra: ['disco-l5-s1'],
    datosClinicos: 'La anestesia epidural caudal se administra a través del hiato sacro.',
    curiosidad: 'Las vértebras sacras terminan de fusionarse al comienzo de la edad adulta.',
    revisar:
      'En la vista posterior del modelo, la malla del sacro de BodyParts3D continúa por debajo del hiato sacro en segmentos estrechos que parecen el cóccix fusionado. Confirmar con una fuente anatómica.',
  }),
  impar('coccix', {
    nombre: 'Cóccix',
    latin: 'Os coccygis',
    ingles: 'Coccyx',
    region: 'columna',
    clasificacion: ['irregular'],
    descripcion: 'Hueso pequeño formado por la fusión de tres a cinco vértebras coccígeas rudimentarias (habitualmente cuatro).',
    funcion: 'Da inserción a músculos del suelo pélvico (coccígeo, elevador del ano), a ligamentos y a parte del glúteo mayor.',
    ubicacion: 'Extremo inferior de la columna vertebral, por debajo del sacro.',
    articulaciones: [art('Articulación sacrococcígea', SINFISIS, 'sacro')],
    datosClinicos: 'La coccigodinia (dolor en el cóccix) suele deberse a caídas en posición sentada.',
    curiosidad: 'Es el vestigio de la cola de otros vertebrados.',
  }),
];

// ---------------------------------------------------------------- Discos
const NIVEL = (v) => v.toUpperCase();
function disco(a, b) {
  const desde = `vertebra-${a}`;
  const hasta = b === 's1' ? 'sacro' : `vertebra-${b}`;
  const region = a[0];
  const clinico = {
    c: 'Las hernias discales cervicales son más frecuentes en C5–C6 y C6–C7.',
    t: 'Las hernias discales torácicas son poco frecuentes gracias a la estabilidad que aporta la caja torácica.',
    l: 'Las hernias discales lumbares son más frecuentes en L4–L5 y L5–S1 y pueden causar ciática.',
  }[region];
  return impar(`disco-${a}-${b}`, {
    tipo: 'cartilago',
    nombre: `Disco intervertebral ${NIVEL(a)}–${NIVEL(b)}`,
    latin: 'Discus intervertebralis',
    ingles: `Intervertebral disc ${NIVEL(a)}–${NIVEL(b)}`,
    region: 'columna',
    descripcion: `Disco de fibrocartílago entre los cuerpos de ${NIVEL(a)} y ${NIVEL(b)}, formado por un anillo fibroso periférico y un núcleo pulposo central.`,
    funcion: 'Amortigua las cargas y permite el movimiento entre las vértebras (sínfisis intervertebral).',
    ubicacion: `Entre los cuerpos vertebrales de ${NIVEL(a)} y ${NIVEL(b)}.`,
    relacionesExtra: [desde, hasta],
    datosClinicos: clinico,
    curiosidad: 'En conjunto, los discos suponen entre una quinta y una cuarta parte de la longitud de la columna por encima del sacro.',
  });
}
const discosIntervertebrales = [
  disco('c2', 'c3'),
  ...[3, 4, 5, 6].map((n) => disco(`c${n}`, `c${n + 1}`)),
  disco('c7', 't1'),
  ...[...Array(11)].map((_, i) => disco(`t${i + 1}`, `t${i + 2}`)),
  {
    ...disco('t12', 'l1'),
    revisar: 'BodyParts3D lo nombra solo «Intervertebral disk» (FJ3211); se identificó por su posición entre T12 y L1.',
  },
  ...[1, 2, 3, 4].map((n) => disco(`l${n}`, `l${n + 1}`)),
  disco('l5', 's1'),
];

// ---------------------------------------------------------------- Esternón
const esternon = impar('esternon', {
  nombre: 'Esternón',
  latin: 'Sternum',
  ingles: 'Sternum',
  region: 'torax',
  clasificacion: ['plano'],
  descripcion: 'Hueso plano e impar de la pared anterior del tórax, formado por el manubrio, el cuerpo y la apófisis xifoides.',
  funcion:
    'Protege el corazón y los grandes vasos, articula con las clavículas y los cartílagos costales y da inserción a músculos como el pectoral mayor y el diafragma.',
  ubicacion: 'Línea media de la pared anterior del tórax.',
  articulaciones: [
    art('Articulación esternoclavicular', 'sinovial selar (con disco articular)', 'clavicula-d', 'clavicula-i'),
    art('Primera articulación esternocostal', 'cartilaginosa (sincondrosis)', 'cartilago-costal-1-d', 'cartilago-costal-1-i'),
    art(
      'Articulaciones esternocostales 2.ª–7.ª',
      'sinovial plana',
      ...[2, 3, 4, 5, 6, 7].flatMap((n) => [`cartilago-costal-${n}-d`, `cartilago-costal-${n}-i`]),
    ),
  ],
  datosClinicos: 'Su médula ósea puede obtenerse por punción. En la RCP las compresiones se aplican sobre la mitad inferior del esternón.',
  curiosidad: 'El ángulo esternal, entre el manubrio y el cuerpo, marca el nivel de la segunda costilla y sirve para contarlas.',
});

// ---------------------------------------------------------------- Costillas
function costilla(n) {
  const cabeza = n === 1 || n >= 10 ? [`vertebra-t${n}`] : [`vertebra-t${n - 1}`, `vertebra-t${n}`];
  const tipoCostilla = n <= 7 ? 'verdadera' : n <= 10 ? 'falsa' : 'flotante';
  const descripciones = {
    1: 'Primera costilla: la más corta, ancha y curva. En su cara superior tiene el tubérculo del escaleno anterior y los surcos de la vena y la arteria subclavias.',
    2: 'Segunda costilla: más larga que la primera, con la tuberosidad del músculo serrato anterior en su cara externa.',
    verdadera:
      'Costilla verdadera típica: cabeza con dos carillas, cuello, tubérculo y cuerpo largo y curvo con un surco costal en el borde inferior. Se une al esternón mediante su propio cartílago costal.',
    falsa: 'Costilla falsa: su cartílago costal se une al de la costilla superior en lugar de al esternón, y forma parte del reborde costal.',
    flotante: 'Costilla flotante: corta, sin tubérculo; su extremo anterior termina libre entre los músculos de la pared abdominal.',
  };
  const clinicos = {
    1: 'Su fractura indica un traumatismo de alta energía y puede asociarse a lesión de los vasos subclavios o del plexo braquial.',
    2: 'Se localiza a la altura del ángulo esternal, punto de referencia para contar las costillas en la exploración.',
    flotante: 'Las costillas 11.ª y 12.ª protegen en parte los riñones; su fractura puede asociarse a lesión renal.',
    otra: 'Las fracturas costales son más frecuentes en las costillas medias y pueden causar neumotórax; varias fracturas dobles producen un tórax inestable (volet costal).',
  };
  return par(`costilla-${n}`, 'f', {
    nombre: `${cap(ORDINAL_F[n - 1])} costilla {lado}`,
    latin: `Costa ${ROMANO[n - 1]}`,
    ingles: `{Side} ${ORDINAL_EN[n - 1]} rib`,
    region: 'torax',
    clasificacion: ['plano'],
    descripcion: descripciones[n] ?? descripciones[tipoCostilla],
    funcion: 'Protege los órganos torácicos y participa en la respiración: las costillas se elevan durante la inspiración y amplían el tórax.',
    ubicacion: `Pared torácica; costilla ${tipoCostilla} (${n}.ª de 12).`,
    articulaciones: [
      art('Articulación de la cabeza de la costilla', 'sinovial plana', ...cabeza),
      ...(n <= 10 ? [art('Articulación costotransversa', 'sinovial plana', `vertebra-t${n}`)] : []),
      ...(n <= 7 ? [art('Articulación costocondral', 'cartilaginosa (sincondrosis)', `cartilago-costal-${n}~`)] : []),
    ],
    relacionesExtra: n <= 7 ? ['esternon'] : [],
    datosClinicos: clinicos[n] ?? (tipoCostilla === 'flotante' ? clinicos.flotante : clinicos.otra),
    curiosidad:
      n >= 3 && n <= 9
        ? 'Por el surco costal discurren la vena, la arteria y el nervio intercostales (de arriba abajo); por eso las punciones torácicas se hacen por el borde superior de la costilla inferior.'
        : undefined,
  });
}
const costillas = [...Array(12)].flatMap((_, i) => costilla(i + 1));

// ---------------------------------------------------------------- Cartílagos costales
const cartilagosCostales = [...Array(7)].flatMap((_, i) => {
  const n = i + 1;
  return par(`cartilago-costal-${n}`, 'm', {
    tipo: 'cartilago',
    nombre: `${cap(ORDINAL_M[n - 1])} cartílago costal {lado}`,
    latin: 'Cartilago costalis',
    ingles: `{Side} ${ORDINAL_EN[n - 1]} costal cartilage`,
    region: 'torax',
    descripcion: 'Barra de cartílago hialino que prolonga la costilla hacia delante y la une al esternón.',
    funcion: 'Aporta elasticidad a la pared torácica, necesaria para los movimientos respiratorios.',
    ubicacion: 'Parte anterior del tórax, entre el extremo de la costilla y el esternón.',
    articulaciones: [
      art('Articulación costocondral', 'cartilaginosa (sincondrosis)', `costilla-${n}~`),
      art(n === 1 ? 'Primera articulación esternocostal' : 'Articulación esternocostal', n === 1 ? 'cartilaginosa (sincondrosis)' : 'sinovial plana', 'esternon'),
    ],
    datosClinicos: 'La costocondritis causa dolor torácico anterior que aumenta al presionar; si hay tumefacción se denomina síndrome de Tietze.',
    curiosidad: 'Tiende a calcificarse con la edad, lo que reduce la elasticidad del tórax.',
    ...(n === 7
      ? { revisar: 'BodyParts3D no tiene piezas separadas para los cartílagos 8.º–10.º: comprobar si esta malla los incluye.' }
      : {}),
  });
});

export default [
  ...cervicales,
  ...toracicas,
  ...lumbares,
  ...sacroCoccix,
  ...discosIntervertebrales,
  esternon,
  ...costillas,
  ...cartilagosCostales,
];
