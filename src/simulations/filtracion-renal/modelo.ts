// Modelo didáctico de la nefrona. Fracciones aproximadas de la carga filtrada que se reabsorbe en cada
// tramo (adulto en reposo, con ADH presente). TFG ≈ 125 ml/min ≈ 180 l/día; orina ≈ 1–2 l/día.
import { modulo } from '../comun/matematicas';

export const TFG_ML_MIN = 125;

export type Sustancia = 'agua' | 'sodio' | 'glucosa' | 'urea';
export type TramoId = 'filtracion' | 'proximal' | 'descendente' | 'ascendente' | 'distal' | 'colector' | 'orina';

export interface TramoNefrona {
  id: TramoId;
  nombre: string;
  texto: string;
  /** Fracción de la carga FILTRADA que se reabsorbe en este tramo. */
  reabsorbe: Partial<Record<Sustancia, number>>;
  secreta?: string;
}

export const TRAMOS: readonly TramoNefrona[] = [
  {
    id: 'filtracion',
    nombre: 'Filtración glomerular',
    texto:
      'La presión de la sangre en los capilares del glomérulo empuja agua y solutos pequeños (Na⁺, glucosa, aminoácidos, urea) a la cápsula de Bowman. Las células sanguíneas y las proteínas grandes, como la albúmina, no atraviesan el filtro. Se filtran ≈ 125 ml/min (≈ 180 l al día).',
    reabsorbe: {},
  },
  {
    id: 'proximal',
    nombre: 'Túbulo contorneado proximal',
    texto:
      'Reabsorbe la mayor parte del filtrado: ≈ 65 % del Na⁺ y del agua, casi toda la glucosa y los aminoácidos (por cotransporte con Na⁺), ≈ 80 % del bicarbonato y ≈ 50 % de la urea. Secreta H⁺ y ácidos y bases orgánicos, entre ellos muchos fármacos.',
    reabsorbe: { agua: 0.65, sodio: 0.65, glucosa: 1, urea: 0.5 },
    secreta: 'H⁺, fármacos (p. ej. penicilina), creatinina (en pequeña cantidad)',
  },
  {
    id: 'descendente',
    nombre: 'Rama descendente del asa de Henle',
    texto: 'Es permeable al agua pero no a los solutos: al descender hacia la médula, cada vez más concentrada, pierde agua por ósmosis (≈ 15 % del agua filtrada).',
    reabsorbe: { agua: 0.15 },
  },
  {
    id: 'ascendente',
    nombre: 'Rama ascendente gruesa del asa',
    texto:
      'Es impermeable al agua y bombea Na⁺, K⁺ y Cl⁻ al intersticio (cotransportador NKCC2, ≈ 25 % del Na⁺): el filtrado se diluye y la médula se concentra (multiplicador por contracorriente). Aquí actúan los diuréticos de asa como la furosemida.',
    reabsorbe: { sodio: 0.25 },
  },
  {
    id: 'distal',
    nombre: 'Túbulo contorneado distal',
    texto:
      'Reabsorbe ≈ 5 % del Na⁺ (cotransportador NaCl, diana de las tiazidas) y Ca²⁺ bajo el control de la parathormona. Es poco permeable al agua.',
    reabsorbe: { sodio: 0.05 },
  },
  {
    id: 'colector',
    nombre: 'Túbulo colector',
    texto:
      'Ajuste fino: la aldosterona aumenta la reabsorción de Na⁺ y la secreción de K⁺ y H⁺; la ADH inserta acuaporinas y permite reabsorber agua hasta concentrar la orina. Sin ADH se eliminan grandes volúmenes de orina diluida.',
    reabsorbe: { agua: 0.19, sodio: 0.04, urea: 0.1 },
    secreta: 'K⁺ y H⁺',
  },
  {
    id: 'orina',
    nombre: 'Orina',
    texto: 'Sale ≈ 1 % del agua filtrada (≈ 1–2 l al día), con la urea y el exceso de iones y de ácidos, hacia la pelvis renal, el uréter y la vejiga.',
    reabsorbe: {},
  },
];

/** Fracción de la carga filtrada de `s` que sigue en el túbulo al FINAL del tramo `indice`. */
export function fraccionRestante(s: Sustancia, indice: number): number {
  let resto = 1;
  for (let i = 0; i <= indice; i++) resto -= TRAMOS[i]!.reabsorbe[s] ?? 0;
  return Math.max(0, resto);
}

/** Flujo de líquido tubular (ml/min) al final de cada tramo. */
export const flujoTubular = (indice: number) => TFG_ML_MIN * fraccionRestante('agua', indice);

// ---------------------------------------------------------------- Partículas de la animación
export const SUSTANCIAS_ANIMADAS: readonly (Sustancia | 'proteina')[] = ['agua', 'sodio', 'glucosa', 'urea', 'proteina'];

/**
 * Destino de una partícula: índice del tramo donde se reabsorbe, «orina» si se excreta o
 * «no-filtra» (proteínas). `azar` ∈ [0, 1) se reparte según las fracciones del modelo.
 */
export function destino(s: Sustancia | 'proteina', azar: number): number | 'orina' | 'no-filtra' {
  if (s === 'proteina') return 'no-filtra';
  let acumulado = 0;
  for (let i = 0; i < TRAMOS.length; i++) {
    acumulado += TRAMOS[i]!.reabsorbe[s] ?? 0;
    if (azar < acumulado) return i;
  }
  return 'orina';
}

export const DURACION_PASO = 4;
export function pasoActual(t: number) {
  const x = modulo(t, TRAMOS.length * DURACION_PASO);
  return Math.min(TRAMOS.length - 1, Math.floor(x / DURACION_PASO));
}
