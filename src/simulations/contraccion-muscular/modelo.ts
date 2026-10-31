// Modelo didáctico de la contracción del músculo esquelético y de la palanca del codo.
import { modulo, suave } from '../comun/matematicas';

// ---------------------------------------------------------------- Sarcómero (µm)
export const FILAMENTO = { grueso: 1.6, fino: 1.0 } as const;
export const SARCOMERO = { reposo: 2.5, contraido: 2.0 } as const;

/** Longitud del sarcómero y de sus bandas para una activación entre 0 (relajado) y 1 (contraído). */
export function sarcomero(activacion: number) {
  const longitud = SARCOMERO.reposo - (SARCOMERO.reposo - SARCOMERO.contraido) * activacion;
  return {
    longitud,
    /** Banda A = longitud del filamento grueso: no cambia. */
    bandaA: FILAMENTO.grueso,
    /** Banda I: solo filamentos finos; se acorta. */
    bandaI: longitud - FILAMENTO.grueso,
    /** Zona H: solo filamentos gruesos; se acorta hasta desaparecer. */
    zonaH: Math.max(0, longitud - 2 * FILAMENTO.fino),
  };
}

// ---------------------------------------------------------------- Secuencia temporal (s)
export type FaseMusculo = 'reposo' | 'excitacion' | 'calcio' | 'puentes' | 'relajacion';
export const CICLO_MUSCULO = 8;
const TRAMOS: { fase: FaseMusculo; desde: number; hasta: number }[] = [
  { fase: 'reposo', desde: 0, hasta: 1 },
  { fase: 'excitacion', desde: 1, hasta: 2 },
  { fase: 'calcio', desde: 2, hasta: 3 },
  { fase: 'puentes', desde: 3, hasta: 6 },
  { fase: 'relajacion', desde: 6, hasta: 8 },
];

export function estadoMusculo(tAbsoluto: number) {
  const t = modulo(tAbsoluto, CICLO_MUSCULO);
  const tramo = TRAMOS.find((x) => t >= x.desde && t < x.hasta) ?? TRAMOS[0]!;
  const x = (t - tramo.desde) / (tramo.hasta - tramo.desde);
  const activacion = tramo.fase === 'puentes' ? suave(0, 1, x / 0.7) : tramo.fase === 'relajacion' ? suave(1, 0, x) : 0;
  const calcio = tramo.fase === 'calcio' ? x : tramo.fase === 'puentes' ? 1 : tramo.fase === 'relajacion' ? 1 - x : 0;
  // El ciclo de los puentes cruzados se repite muchas veces mientras hay Ca²⁺ y ATP.
  const puente = tramo.fase === 'puentes' ? PUENTE[Math.floor(modulo(t * 2, 4))]! : null;
  return { fase: tramo.fase, progreso: x, activacion, calcio, puente };
}

export const INICIO_FASE: Record<FaseMusculo, number> = Object.fromEntries(TRAMOS.map((t) => [t.fase, t.desde + 0.01])) as Record<FaseMusculo, number>;

export type EstadoPuente = 'union' | 'golpe' | 'separacion' | 'rearme';
const PUENTE: EstadoPuente[] = ['union', 'golpe', 'separacion', 'rearme'];

export const TEXTO_PUENTE: Record<EstadoPuente, string> = {
  union: 'La cabeza de miosina (con ADP + Pi) se une a la actina: se forma el puente cruzado.',
  golpe: 'Golpe de fuerza: se liberan ADP y Pi, la cabeza gira y desliza el filamento fino hacia el centro.',
  separacion: 'Un nuevo ATP se une a la cabeza de miosina y esta se separa de la actina.',
  rearme: 'La miosina hidroliza el ATP (ADP + Pi) y la cabeza vuelve a su posición «armada».',
};

// ---------------------------------------------------------------- Palanca del codo
/** Distancias (m) desde el eje del codo: inserción del bíceps (tuberosidad del radio) y carga en la mano. */
export const PALANCA = { brazoBiceps: 0.04, brazoCarga: 0.35 } as const;
export const G = 9.81;

/** Ángulo de flexión del codo (grados): 10° casi extendido, 120° muy flexionado. */
export const anguloCodo = (activacion: number) => 10 + 110 * activacion;

/**
 * Fuerza que debe hacer el bíceps (N) para sostener `masaKg` en la mano con el brazo vertical.
 * Simplificación: brazo de palanca del bíceps constante (en realidad varía con el ángulo).
 */
export function fuerzaBiceps(masaKg: number, anguloGrados: number) {
  const momentoCarga = masaKg * G * PALANCA.brazoCarga * Math.sin((anguloGrados * Math.PI) / 180);
  return momentoCarga / PALANCA.brazoBiceps;
}

/** Ventaja mecánica = brazo de potencia / brazo de resistencia (< 1 en las palancas de tercer género). */
export const ventajaMecanica = () => PALANCA.brazoBiceps / PALANCA.brazoCarga;
