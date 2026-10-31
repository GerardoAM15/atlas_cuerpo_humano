// Recorrido didáctico del bolo alimenticio. Tiempos de tránsito típicos en un adulto (muy variables).
import { modulo } from '../comun/matematicas';

export interface Enzima {
  nombre: string;
  origen: string;
  sustrato: string;
  producto: string;
}

export interface Segmento {
  id: string;
  nombre: string;
  /** Tiempo de tránsito típico (texto, porque varía mucho). */
  tiempo: string;
  /** Segundos de animación (no proporcionales al tiempo real). */
  duracion: number;
  procesos: string[];
  enzimas: Enzima[];
  absorcion?: string;
  /** Ids de estructuras del atlas relacionadas. */
  estructuras: string[];
}

export const SEGMENTOS: readonly Segmento[] = [
  {
    id: 'boca',
    nombre: 'Boca',
    tiempo: 'de segundos a 1 minuto',
    duracion: 3,
    procesos: ['Masticación: los dientes trocean el alimento y la lengua lo mezcla con la saliva.', 'Se forma el bolo, que la lengua empuja hacia la faringe.'],
    enzimas: [
      { nombre: 'Amilasa salival (ptialina)', origen: 'Glándulas salivales', sustrato: 'Almidón', producto: 'Maltosa y dextrinas' },
      { nombre: 'Lipasa lingual', origen: 'Glándulas de la lengua', sustrato: 'Triglicéridos', producto: 'Ácidos grasos y diglicéridos (actúa sobre todo en el estómago)' },
    ],
    estructuras: ['lengua', 'molares-superiores', 'glandula-submandibular-d'],
  },
  {
    id: 'esofago',
    nombre: 'Faringe y esófago',
    tiempo: '≈ 5–10 segundos',
    duracion: 3,
    procesos: [
      'Deglución: el paladar blando cierra la nasofaringe y la epiglotis se inclina sobre la laringe.',
      'Ondas peristálticas llevan el bolo hasta el estómago; el esfínter esofágico inferior se relaja para dejarlo pasar.',
    ],
    enzimas: [],
    estructuras: ['esofago', 'paladar-blando', 'epiglotis'],
  },
  {
    id: 'estomago',
    nombre: 'Estómago',
    tiempo: '≈ 2–4 horas',
    duracion: 5,
    procesos: [
      'Almacena y mezcla el alimento con el jugo gástrico hasta formar el quimo.',
      'El ácido clorhídrico (células parietales) desnaturaliza las proteínas, activa el pepsinógeno y destruye microorganismos.',
      'Las células parietales secretan también factor intrínseco, necesario para absorber la vitamina B12 en el íleon.',
      'El píloro deja pasar el quimo al duodeno poco a poco.',
    ],
    enzimas: [
      { nombre: 'Pepsina', origen: 'Células principales (como pepsinógeno)', sustrato: 'Proteínas', producto: 'Polipéptidos' },
      { nombre: 'Lipasa gástrica', origen: 'Células principales', sustrato: 'Triglicéridos', producto: 'Ácidos grasos y diglicéridos' },
    ],
    absorcion: 'Muy escasa: agua, alcohol y algunos fármacos (como el ácido acetilsalicílico).',
    estructuras: ['estomago'],
  },
  {
    id: 'duodeno',
    nombre: 'Duodeno',
    tiempo: 'minutos',
    duracion: 4,
    procesos: [
      'Llegan la bilis (hígado y vesícula) y el jugo pancreático por la papila duodenal mayor.',
      'El bicarbonato pancreático neutraliza la acidez del quimo.',
      'Las sales biliares emulsionan las grasas (no son enzimas: fragmentan las gotas para que actúe la lipasa).',
      'La secretina y la colecistocinina (CCK) regulan la secreción pancreática y biliar.',
    ],
    enzimas: [
      { nombre: 'Tripsina, quimotripsina y carboxipeptidasa', origen: 'Páncreas', sustrato: 'Proteínas y polipéptidos', producto: 'Péptidos cortos y aminoácidos' },
      { nombre: 'Amilasa pancreática', origen: 'Páncreas', sustrato: 'Almidón', producto: 'Maltosa y oligosacáridos' },
      { nombre: 'Lipasa pancreática', origen: 'Páncreas', sustrato: 'Triglicéridos', producto: 'Ácidos grasos y monoglicéridos' },
      { nombre: 'Nucleasas', origen: 'Páncreas', sustrato: 'Ácidos nucleicos', producto: 'Nucleótidos' },
    ],
    absorcion: 'Hierro y calcio, entre otros.',
    estructuras: ['duodeno', 'pancreas', 'vesicula-biliar'],
  },
  {
    id: 'intestino-delgado',
    nombre: 'Yeyuno e íleon',
    tiempo: '≈ 3–5 horas',
    duracion: 6,
    procesos: [
      'Las enzimas del borde en cepillo de los enterocitos completan la digestión.',
      'Pliegues, vellosidades y microvellosidades multiplican la superficie de absorción.',
      'El íleon terminal absorbe la vitamina B12 (unida al factor intrínseco) y recupera las sales biliares.',
    ],
    enzimas: [
      { nombre: 'Maltasa, sacarasa y lactasa', origen: 'Borde en cepillo', sustrato: 'Maltosa, sacarosa y lactosa', producto: 'Glucosa, fructosa y galactosa' },
      { nombre: 'Aminopeptidasas y dipeptidasas', origen: 'Borde en cepillo', sustrato: 'Péptidos', producto: 'Aminoácidos' },
    ],
    absorcion: 'Casi todos los nutrientes: monosacáridos, aminoácidos, lípidos (en micelas y luego quilomicrones, por la linfa), vitaminas y la mayor parte del agua.',
    estructuras: ['yeyuno', 'ileon'],
  },
  {
    id: 'intestino-grueso',
    nombre: 'Intestino grueso',
    tiempo: 'habitualmente 12–48 horas',
    duracion: 5,
    procesos: [
      'Absorbe agua y electrolitos: el contenido líquido se convierte en heces.',
      'La microbiota fermenta la fibra (produce ácidos grasos de cadena corta) y sintetiza vitamina K.',
      'Movimientos de masa empujan el contenido hacia el recto unas pocas veces al día.',
    ],
    enzimas: [],
    absorcion: 'Agua, sodio, ácidos grasos de cadena corta y vitamina K.',
    estructuras: ['ciego', 'colon-ascendente', 'colon-transverso', 'colon-descendente'],
  },
  {
    id: 'recto',
    nombre: 'Recto y ano',
    tiempo: 'variable',
    duracion: 3,
    procesos: [
      'La distensión del recto desencadena el reflejo de la defecación.',
      'El esfínter anal interno (involuntario) se relaja; el externo (voluntario) permite retrasar la defecación.',
    ],
    enzimas: [],
    estructuras: ['recto', 'esfinter-anal-externo'],
  },
];

export const DURACION_TOTAL = SEGMENTOS.reduce((s, x) => s + x.duracion, 0);

/** Segmento actual y progreso (0–1) dentro de él y en todo el recorrido. */
export function posicionBolo(t: number) {
  const x = modulo(t, DURACION_TOTAL);
  let acumulado = 0;
  for (let i = 0; i < SEGMENTOS.length; i++) {
    const seg = SEGMENTOS[i]!;
    if (x < acumulado + seg.duracion || i === SEGMENTOS.length - 1) {
      const progreso = Math.min(1, (x - acumulado) / seg.duracion);
      return { indice: i, segmento: seg, progreso, inicio: acumulado };
    }
    acumulado += seg.duracion;
  }
  throw new Error('inalcanzable');
}

export const inicioSegmento = (indice: number) => SEGMENTOS.slice(0, indice).reduce((s, x) => s + x.duracion, 0);
