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
};

export function nombreRegion(sistema: SistemaId, region: string): string {
  return REGIONES[sistema]?.find((r) => r.id === region)?.nombre ?? region;
}
