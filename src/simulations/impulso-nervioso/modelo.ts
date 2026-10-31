// Modelo didáctico del potencial de acción de una neurona y de su conducción.
// Tiempo en milisegundos. Valores típicos: reposo −70 mV, umbral −55 mV, pico +30 mV, poshiperpolarización −80 mV.
import { lineal, modulo, suave } from '../comun/matematicas';

export const POTENCIALES = { reposo: -70, umbral: -55, pico: 30, hiperpolarizacion: -80 } as const;

/** Duración de un ciclo de la animación (ms) e instantes de cada fase. */
export const CICLO_PA = 10;
const T = { estimulo: 1, umbral: 1.4, pico: 1.9, minimo: 3.2, recuperado: 5.5 } as const;

export type FasePA = 'reposo' | 'estimulo' | 'despolarizacion' | 'repolarizacion' | 'hiperpolarizacion';
export type EstadoCanalNa = 'cerrado' | 'abierto' | 'inactivado';
export type EstadoCanalK = 'cerrado' | 'abierto';

export interface EstadoPA {
  fase: FasePA;
  potencial: number;
  canalNa: EstadoCanalNa;
  canalK: EstadoCanalK;
  refractario: 'ninguno' | 'absoluto' | 'relativo';
}

export function potencialAccion(tAbsoluto: number): EstadoPA {
  const t = modulo(tAbsoluto, CICLO_PA);
  const P = POTENCIALES;
  let fase: FasePA;
  let potencial: number;
  if (t < T.estimulo) {
    fase = 'reposo';
    potencial = P.reposo;
  } else if (t < T.umbral) {
    fase = 'estimulo';
    potencial = lineal(P.reposo, P.umbral, (t - T.estimulo) / (T.umbral - T.estimulo));
  } else if (t < T.pico) {
    fase = 'despolarizacion';
    potencial = suave(P.umbral, P.pico, (t - T.umbral) / (T.pico - T.umbral));
  } else if (t < T.minimo) {
    fase = 'repolarizacion';
    potencial = suave(P.pico, P.hiperpolarizacion, (t - T.pico) / (T.minimo - T.pico));
  } else if (t < T.recuperado) {
    fase = 'hiperpolarizacion';
    potencial = suave(P.hiperpolarizacion, P.reposo, (t - T.minimo) / (T.recuperado - T.minimo));
  } else {
    fase = 'reposo';
    potencial = P.reposo;
  }
  const canalNa: EstadoCanalNa = fase === 'despolarizacion' ? 'abierto' : fase === 'repolarizacion' ? 'inactivado' : 'cerrado';
  // Los canales de K⁺ dependientes de voltaje se abren con retraso y se cierran lentamente.
  const canalK: EstadoCanalK = t >= T.pico - 0.2 && t < T.recuperado - 0.5 ? 'abierto' : 'cerrado';
  const refractario = t >= T.umbral && t < T.minimo ? 'absoluto' : t >= T.minimo && t < T.recuperado ? 'relativo' : 'ninguno';
  return { fase, potencial, canalNa, canalK, refractario };
}

// ---------------------------------------------------------------- Conducción
/** Velocidades de conducción típicas (m/s = mm/ms). */
export const VELOCIDAD = { sinMielina: 1, conMielina: 50 } as const;
/** Longitud representada de axón (mm) y distancia entre nódulos de Ranvier (mm). */
export const AXON_MM = 100;
export const INTERNODO_MM = 2;
export const CICLO_CONDUCCION = 2.5;

/** Posición (mm) del frente del impulso tras `t` ms. En la fibra mielinizada avanza a saltos de nódulo en nódulo. */
export function posicionImpulso(tAbsoluto: number, mielinizada: boolean): number {
  const t = modulo(tAbsoluto, CICLO_CONDUCCION);
  if (!mielinizada) return Math.min(AXON_MM, VELOCIDAD.sinMielina * t);
  const continua = Math.min(AXON_MM, VELOCIDAD.conMielina * t);
  return Math.floor(continua / INTERNODO_MM) * INTERNODO_MM;
}

// ---------------------------------------------------------------- Sinapsis química
export const PASOS_SINAPSIS = [
  { id: 'llegada', titulo: 'Llega el potencial de acción', texto: 'El impulso despolariza el botón terminal de la neurona presináptica.' },
  {
    id: 'calcio',
    titulo: 'Entra Ca²⁺',
    texto: 'La despolarización abre canales de calcio dependientes de voltaje; el Ca²⁺ entra en el terminal.',
  },
  {
    id: 'exocitosis',
    titulo: 'Exocitosis del neurotransmisor',
    texto: 'El Ca²⁺ hace que las vesículas se fusionen con la membrana y liberen el neurotransmisor (p. ej. acetilcolina) a la hendidura sináptica.',
  },
  {
    id: 'receptores',
    titulo: 'Unión a los receptores',
    texto: 'El neurotransmisor difunde y se une a receptores de la membrana postsináptica que son canales iónicos.',
  },
  {
    id: 'pps',
    titulo: 'Potencial postsináptico',
    texto: 'Se abren los canales: entra Na⁺ y se produce un potencial postsináptico excitador. Si la suma alcanza el umbral, la neurona siguiente dispara.',
  },
  {
    id: 'fin',
    titulo: 'Fin de la señal',
    texto: 'El neurotransmisor se degrada (la acetilcolinesterasa hidroliza la acetilcolina) o se recapta, y la sinapsis queda lista de nuevo.',
  },
] as const;

export const DURACION_PASO_SINAPSIS = 1.5;
export function pasoSinapsis(t: number) {
  const n = PASOS_SINAPSIS.length;
  const x = modulo(t, n * DURACION_PASO_SINAPSIS);
  const i = Math.min(n - 1, Math.floor(x / DURACION_PASO_SINAPSIS));
  return { indice: i, progreso: (x - i * DURACION_PASO_SINAPSIS) / DURACION_PASO_SINAPSIS };
}
