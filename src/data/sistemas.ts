/**
 * Catálogo de los sistemas del atlas.
 * Nombres latinos según Terminologia Anatomica (TA98/TA2).
 */
export type SistemaId =
  | 'esqueletico'
  | 'muscular'
  | 'cardiovascular'
  | 'respiratorio'
  | 'nervioso'
  | 'digestivo'
  | 'urinario'
  | 'endocrino'
  | 'linfatico'
  | 'reproductor'
  | 'sentidos';

export interface Sistema {
  id: SistemaId;
  nombre: string;
  latin: string;
  ingles: string;
  descripcion: string;
  /** Color de acento para la UI (hex). */
  color: string;
  /** Fase del plan en que se incorporan modelo y datos. */
  fase: number;
}

export const SISTEMAS: readonly Sistema[] = [
  {
    id: 'esqueletico',
    nombre: 'Esquelético',
    latin: 'Systema skeletale',
    ingles: 'Skeletal system',
    descripcion: 'Los 206 huesos del adulto y sus articulaciones principales.',
    color: '#e7e5e4',
    fase: 2,
  },
  {
    id: 'muscular',
    nombre: 'Muscular',
    latin: 'Systema musculare',
    ingles: 'Muscular system',
    descripcion: 'Músculos esqueléticos superficiales y profundos: origen, inserción, inervación y acción.',
    color: '#f87171',
    fase: 3,
  },
  {
    id: 'cardiovascular',
    nombre: 'Cardiovascular',
    latin: 'Systema cardiovasculare',
    ingles: 'Cardiovascular system',
    descripcion: 'Corazón, grandes arterias y venas, y vasos principales de miembros y órganos.',
    color: '#ef4444',
    fase: 3,
  },
  {
    id: 'respiratorio',
    nombre: 'Respiratorio',
    latin: 'Systema respiratorium',
    ingles: 'Respiratory system',
    descripcion: 'Vías aéreas superiores e inferiores, pulmones por lóbulos y diafragma.',
    color: '#7dd3fc',
    fase: 3,
  },
  {
    id: 'nervioso',
    nombre: 'Nervioso',
    latin: 'Systema nervosum',
    ingles: 'Nervous system',
    descripcion: 'Encéfalo, médula espinal, nervios craneales y nervios periféricos principales.',
    color: '#facc15',
    fase: 4,
  },
  {
    id: 'digestivo',
    nombre: 'Digestivo',
    latin: 'Systema digestorium',
    ingles: 'Digestive system',
    descripcion: 'Tubo digestivo de la boca al ano y glándulas anexas: hígado, vesícula y páncreas.',
    color: '#fb923c',
    fase: 4,
  },
  {
    id: 'urinario',
    nombre: 'Urinario',
    latin: 'Systema urinarium',
    ingles: 'Urinary system',
    descripcion: 'Riñones, uréteres, vejiga urinaria y uretra.',
    color: '#fde047',
    fase: 4,
  },
  {
    id: 'endocrino',
    nombre: 'Endocrino',
    latin: 'Glandulae endocrinae',
    ingles: 'Endocrine glands',
    descripcion: 'Hipófisis, tiroides, paratiroides, suprarrenales, páncreas endocrino y gónadas.',
    color: '#c084fc',
    fase: 4,
  },
  {
    id: 'linfatico',
    nombre: 'Linfático e inmune',
    latin: 'Systema lymphoideum',
    ingles: 'Lymphoid system',
    descripcion: 'Ganglios linfáticos principales, bazo, timo y conductos linfáticos.',
    color: '#4ade80',
    fase: 4,
  },
  {
    id: 'reproductor',
    nombre: 'Reproductor',
    latin: 'Systemata genitalia',
    ingles: 'Genital systems',
    descripcion: 'Órganos genitales masculinos y femeninos (contenido académico).',
    color: '#f472b6',
    fase: 4,
  },
  {
    id: 'sentidos',
    nombre: 'Órganos de los sentidos',
    latin: 'Organa sensuum',
    ingles: 'Sense organs',
    descripcion: 'Ojo y oído con modelos de detalle ampliados.',
    color: '#2dd4bf',
    fase: 4,
  },
] as const;

export const SISTEMAS_POR_ID: Readonly<Record<SistemaId, Sistema>> = Object.fromEntries(
  SISTEMAS.map((s) => [s.id, s]),
) as Record<SistemaId, Sistema>;
