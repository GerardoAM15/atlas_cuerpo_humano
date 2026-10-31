import type { SistemaId } from './sistemas';

export interface Region {
  id: string;
  nombre: string;
  /** Las piezas de la región se pueden separar en el modo explosión. */
  explosion?: boolean;
}

/** Regiones por sistema, en el orden en que aparecen en el árbol. */
export const REGIONES: Partial<Record<SistemaId, readonly Region[]>> = {
  esqueletico: [
    { id: 'craneo', nombre: 'Cráneo', explosion: true },
    { id: 'oido-medio', nombre: 'Oído medio' },
    { id: 'cuello', nombre: 'Cuello' },
    { id: 'columna', nombre: 'Columna vertebral', explosion: true },
    { id: 'torax', nombre: 'Tórax', explosion: true },
    { id: 'cintura-escapular', nombre: 'Cintura escapular' },
    { id: 'brazo-antebrazo', nombre: 'Brazo y antebrazo' },
    { id: 'mano', nombre: 'Mano', explosion: true },
    { id: 'cintura-pelvica', nombre: 'Cintura pélvica' },
    { id: 'muslo-pierna', nombre: 'Muslo y pierna' },
    { id: 'pie', nombre: 'Pie', explosion: true },
  ],
  muscular: [
    { id: 'cabeza-cuello', nombre: 'Cabeza y cuello' },
    { id: 'ojo', nombre: 'Músculos extrínsecos del ojo', explosion: true },
    { id: 'dorso', nombre: 'Dorso' },
    { id: 'torax-abdomen', nombre: 'Tórax y abdomen' },
    { id: 'hombro-brazo', nombre: 'Hombro y brazo', explosion: true },
    { id: 'antebrazo-mano', nombre: 'Antebrazo y mano', explosion: true },
    { id: 'cadera-muslo', nombre: 'Cadera y muslo', explosion: true },
    { id: 'pierna-pie', nombre: 'Pierna y pie', explosion: true },
  ],
  cardiovascular: [
    { id: 'corazon', nombre: 'Corazón', explosion: true },
    { id: 'coronarios', nombre: 'Vasos coronarios' },
    { id: 'grandes-vasos', nombre: 'Grandes vasos' },
    { id: 'cabeza-cuello', nombre: 'Cabeza y cuello' },
    { id: 'miembro-superior', nombre: 'Miembro superior' },
    { id: 'abdomen-pelvis', nombre: 'Abdomen y pelvis' },
    { id: 'miembro-inferior', nombre: 'Miembro inferior' },
  ],
  respiratorio: [
    { id: 'vias-altas', nombre: 'Laringe' },
    { id: 'traquea-bronquios', nombre: 'Tráquea y bronquios', explosion: true },
    { id: 'pulmones', nombre: 'Pulmones' },
    { id: 'musculos-respiratorios', nombre: 'Músculos respiratorios' },
  ],
};

export function nombreRegion(sistema: SistemaId, region: string): string {
  return REGIONES[sistema]?.find((r) => r.id === region)?.nombre ?? region;
}
