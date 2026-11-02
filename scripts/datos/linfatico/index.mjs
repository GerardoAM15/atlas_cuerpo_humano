// Sistema linfático e inmune: bazo, arteria esplénica y timo (BodyParts3D); ganglios y amígdalas (Z-Anatomy);
// conducto torácico (sin modelo).
import { ESQUEMATICO_ZA, REF_ZA, datosVaso, par, unica, zaLados } from '../util.mjs';

const SIN_MODELO = 'No está en BodyParts3D 4.0 ni en Z-Anatomy.';
const LIN = { material: 'linfatico' };

const ganglios = (id, nombre, latin, ingles, datos) =>
  unica(id, {
    tipo: 'organo',
    ...LIN,
    region: 'ganglios-conductos',
    notaModelo: ESQUEMATICO_ZA,
    nombre,
    latin,
    ingles,
    funcion: 'Filtran la linfa y en ellos los linfocitos se encuentran con los antígenos y se activan.',
    ...datos,
  });

export default [
  unica('bazo', {
    ...LIN,
    tipo: 'organo',
    region: 'organos-linfoides',
    nombre: 'Bazo',
    latin: 'Splen (lien)',
    ingles: 'Spleen',
    fuente: ['Spleen'],
    descripcion: 'El mayor órgano linfoide, del tamaño de un puño, con pulpa roja (filtro de la sangre) y pulpa blanca (tejido linfoide).',
    funcion: 'Elimina hematíes envejecidos y bacterias encapsuladas de la sangre y genera respuestas inmunes frente a antígenos sanguíneos.',
    ubicacion: 'Hipocondrio izquierdo, protegido por las costillas 9.ª a 11.ª.',
    relacionesExtra: ['estomago', 'rinon-i', 'pancreas', 'vena-esplenica', 'diafragma', 'costilla-10-i'],
    datosClinicos: 'Es el órgano abdominal que más se rompe en traumatismos; sin bazo aumenta el riesgo de infecciones graves por neumococo.',
  }),
  ...par('timo', 'm', {
    ...LIN,
    tipo: 'organo',
    region: 'organos-linfoides',
    nombre: 'Lóbulo {lado} del timo',
    latin: 'Lobus thymi',
    ingles: '{Side} lobe of thymus',
    fuente: ['{side} lobe of thymus'],
    descripcion: 'Uno de los dos lóbulos del timo, órgano linfoide primario muy desarrollado en la infancia que en el adulto se sustituye en gran parte por grasa.',
    funcion: 'En él maduran los linfocitos T y aprenden a no atacar los tejidos propios (tolerancia central).',
    ubicacion: 'Mediastino superior y anterior, detrás del manubrio del esternón.',
    relacionesExtra: ['timo^', 'esternon', 'pared-auricula-derecha', 'vena-braquiocefalica-i'],
    datosClinicos: 'Los timomas se asocian a la miastenia gravis; su ausencia congénita (síndrome de DiGeorge) causa inmunodeficiencia.',
  }),
  ganglios('ganglios-cervicales', 'Ganglios linfáticos cervicales', 'Nodi lymphoidei cervicales', 'Cervical lymph nodes', {
    // Grupos cervicales de la TA (anteriores y laterales, superficiales y profundos); sin los de la cabeza.
    fuenteZA: ['Superficial anterior cervical nodes', 'Paratracheal cervical nodes', 'Superficial lateral cervical nodes.l', 'Superficial lateral cervical nodes.r', 'Inferior deep lateral cervical nodes.l', 'Inferior deep lateral cervical nodes.r', 'Jugulodigastric node.l', 'Jugulodigastric node.r', 'Lateral superior jugular node.l', 'Lateral superior jugular node.r', 'Anterior inferior jugular nodes.l', 'Anterior inferior jugular nodes.r', 'Supraclavicular nodes.l', 'Supraclavicular nodes.r', 'Retropharyngeal nodes.l', 'Retropharyngeal nodes.r', 'Pretracheal nodes.l', 'Pretracheal nodes.r', 'Thyroid nodes.l', 'Thyroid nodes.r'],
    refZA: REF_ZA.cuelloAmplio,
    descripcion: 'Cadenas de ganglios del cuello, sobre todo a lo largo de la vena yugular interna (cadena yugular profunda).',
    ubicacion: 'Cuello, en torno al esternocleidomastoideo y la vaina carotídea.',
    relacionesExtra: ['yugular-interna-d', 'esternocleidomastoideo-d'],
    datosClinicos: 'Se agrandan en las infecciones de garganta; un ganglio duro y fijo puede indicar metástasis de un cáncer de cabeza y cuello.',
  }),
  ganglios('ganglios-axilares', 'Ganglios linfáticos axilares', 'Nodi lymphoidei axillares', 'Axillary lymph nodes', {
    // Grupos pectoral (anterior), subescapular (posterior), humeral (lateral), central, apical e interpectoral.
    fuenteZA: zaLados('Anterior axillary nodes', 'Posterior axillary nodes', 'Lateral axillary nodes', 'Central axillary nodes', 'Apical axillary nodes', 'Interpectoral nodes'),
    refZA: REF_ZA.axila,
    descripcion: 'Entre 20 y 30 ganglios agrupados en la axila alrededor de los vasos axilares.',
    ubicacion: 'Axila.',
    relacionesExtra: ['arteria-axilar-d', 'pectoral-menor-d'],
    datosClinicos: 'Reciben la mayor parte de la linfa de la mama: la biopsia del ganglio centinela axilar orienta el tratamiento del cáncer de mama.',
  }),
  ganglios('ganglios-inguinales', 'Ganglios linfáticos inguinales', 'Nodi lymphoidei inguinales', 'Inguinal lymph nodes', {
    fuenteZA: zaLados('Superomedial superficial inguinal nodes', 'Superolateral superficial inguinal nodes', 'Inferior superficial inguinal nodes', '(Intermediate deep inguinal node)', '(Proximal deep inguinal node)'),
    refZA: REF_ZA.ingle,
    descripcion: 'Grupos superficial y profundo de ganglios en la ingle, en torno a la desembocadura de la vena safena mayor.',
    ubicacion: 'Región inguinal, bajo el ligamento inguinal.',
    relacionesExtra: ['vena-femoral-d', 'vena-safena-mayor-d'],
    datosClinicos: 'Drenan el miembro inferior, el periné y los genitales externos (no los testículos, que drenan a los ganglios lumbares).',
  }),
  unica('conducto-toracico', {
    tipo: 'vaso',
    region: 'ganglios-conductos',
    pendienteModelo: SIN_MODELO,
    nombre: 'Conducto torácico',
    latin: 'Ductus thoracicus',
    ingles: 'Thoracic duct',
    descripcion: 'El mayor vaso linfático, de unos 40 cm; comienza en la cisterna del quilo (L1–L2) y asciende por el mediastino posterior.',
    funcion: 'Devuelve a la sangre la linfa de casi todo el cuerpo (excepto el lado derecho de la cabeza, el cuello, el tórax y el miembro superior derecho).',
    ubicacion: 'Desde el abdomen, a través del hiato aórtico, hasta la unión de las venas yugular interna y subclavia izquierdas.',
    relacionesExtra: ['aorta-toracica', 'vena-acigos', 'vena-subclavia-i', 'yugular-interna-i'],
    datosClinicos: 'Su lesión en cirugía torácica produce quilotórax (linfa lechosa en la pleura).',
  }),
  unica('amigdalas-palatinas', {
    tipo: 'organo',
    ...LIN,
    region: 'ganglios-conductos',
    fuenteZA: zaLados('Palatine tonsil'),
    refZA: REF_ZA.faringe,
    notaModelo: 'Representación simplificada: Z-Anatomy modela cada amígdala palatina como un ovoide.',
    nombre: 'Amígdalas palatinas',
    latin: 'Tonsillae palatinae',
    ingles: 'Palatine tonsils',
    descripcion: 'Masas de tejido linfoide con criptas, situadas a ambos lados de la orofaringe.',
    funcion: 'Forman parte del anillo linfático de Waldeyer, primera defensa frente a los microorganismos que entran por la boca.',
    ubicacion: 'Fosas amigdalinas, entre los pilares anterior y posterior del velo del paladar.',
    relacionesExtra: ['paladar-blando', 'lengua'],
    datosClinicos: 'La amigdalitis por estreptococo debe tratarse para prevenir la fiebre reumática.',
  }),
  unica('arteria-esplenica', {
    ...datosVaso('arteria'),
    region: 'organos-linfoides',
    nombre: 'Arteria esplénica',
    latin: 'Arteria splenica (lienalis)',
    ingles: 'Splenic artery',
    fuente: ['Splenic artery'],
    descripcion: 'La rama más grande del tronco celíaco; recorre con un trayecto tortuoso el borde superior del páncreas hasta el hilio del bazo.',
    funcion:
      'Irriga el bazo y da ramas al páncreas (pancreática dorsal y magna) y al estómago (gástricas cortas y gastroomental izquierda).',
    ubicacion: 'Detrás del estómago, en la pared posterior de la bolsa omental, a lo largo del borde superior del páncreas.',
    relacionesExtra: ['tronco-celiaco', 'bazo', 'pancreas', 'estomago', 'vena-esplenica'],
    datosClinicos: 'Es la localización más frecuente de los aneurismas de las arterias viscerales, con mayor riesgo de rotura durante el embarazo.',
  }),
];
