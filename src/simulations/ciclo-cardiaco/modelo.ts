// Modelo simplificado del ciclo cardíaco izquierdo (diagrama de Wiggers didáctico).
// El ciclo empieza en el inicio de la onda P. Valores típicos de un adulto en reposo:
// VTD 120 ml, VTS 50 ml (volumen sistólico 70 ml, FE ≈ 58 %), presión aórtica 120/80 mmHg.
import { gauss, lineal, modulo, rapidaAlInicio, suave } from '../comun/matematicas';

export type FaseId =
  | 'sistole-auricular'
  | 'contraccion-isovolumetrica'
  | 'eyeccion'
  | 'relajacion-isovolumetrica'
  | 'llenado-rapido'
  | 'diastasis';

export const ORDEN_FASES: readonly FaseId[] = [
  'sistole-auricular',
  'contraccion-isovolumetrica',
  'eyeccion',
  'relajacion-isovolumetrica',
  'llenado-rapido',
  'diastasis',
];

/** Duraciones (s) a 75 lpm (periodo 0,8 s). */
const BASE: Record<FaseId, number> = {
  'sistole-auricular': 0.1,
  'contraccion-isovolumetrica': 0.05,
  eyeccion: 0.27,
  'relajacion-isovolumetrica': 0.08,
  'llenado-rapido': 0.15,
  diastasis: 0.15,
};

export const VOLUMENES = { vtd: 120, vts: 50, finLlenadoRapido: 90, antesSistoleAuricular: 100 } as const;
export const PRESIONES = { aorticaSistolica: 120, aorticaDiastolica: 80, cierreAortico: 100 } as const;

export interface Tramo {
  fase: FaseId;
  inicio: number;
  fin: number;
}

/**
 * Duración de cada fase para una frecuencia cardíaca (lpm). La sístole se acorta menos que la
 * diástole al subir la frecuencia (aprox. ∝ √periodo, como el QT); la diástasis absorbe el resto
 * y, si no queda tiempo, todas las fases se comprimen para caber en el periodo.
 */
export function tramos(fc: number): Tramo[] {
  const periodo = 60 / fc;
  const escala = Math.sqrt(periodo / 0.8);
  const dur = Object.fromEntries(ORDEN_FASES.map((f) => [f, BASE[f] * (f === 'diastasis' ? 0 : escala)])) as Record<FaseId, number>;
  const sinDiastasis = ORDEN_FASES.reduce((s, f) => s + dur[f], 0);
  if (sinDiastasis <= periodo) {
    dur.diastasis = periodo - sinDiastasis;
  } else {
    for (const f of ORDEN_FASES) dur[f] *= periodo / sinDiastasis;
  }
  let t = 0;
  return ORDEN_FASES.map((fase) => {
    const tramo = { fase, inicio: t, fin: t + dur[fase] };
    t += dur[fase];
    return tramo;
  });
}

export interface Estado {
  fase: FaseId;
  /** Tiempo dentro del ciclo (s) y progreso dentro de la fase (0–1). */
  tCiclo: number;
  progreso: number;
  periodo: number;
  presionVI: number;
  presionAorta: number;
  presionAI: number;
  volumenVI: number;
  ecg: number;
  /** Válvulas auriculoventriculares (mitral y tricúspide) y semilunares (aórtica y pulmonar). */
  avAbiertas: boolean;
  semilunaresAbiertas: boolean;
}

function buscarTramo(ts: Tramo[], t: number): Tramo {
  return ts.find((x) => t >= x.inicio && t < x.fin) ?? ts[ts.length - 1]!;
}

export function estado(tAbsoluto: number, fc: number): Estado {
  const ts = tramos(fc);
  const periodo = 60 / fc;
  const t = modulo(tAbsoluto, periodo);
  const tramo = buscarTramo(ts, t);
  const x = tramo.fin > tramo.inicio ? (t - tramo.inicio) / (tramo.fin - tramo.inicio) : 0;
  const de = (f: FaseId) => ts.find((r) => r.fase === f)!;

  // ---- Volumen del ventrículo izquierdo
  const v = VOLUMENES;
  const volumenVI = {
    'sistole-auricular': lineal(v.antesSistoleAuricular, v.vtd, x),
    'contraccion-isovolumetrica': v.vtd,
    eyeccion: rapidaAlInicio(v.vtd, v.vts, x),
    'relajacion-isovolumetrica': v.vts,
    'llenado-rapido': rapidaAlInicio(v.vts, v.finLlenadoRapido, x),
    diastasis: lineal(v.finLlenadoRapido, v.antesSistoleAuricular, x),
  }[tramo.fase];

  // ---- Presión del ventrículo izquierdo
  const p = PRESIONES;
  const presionVI = {
    'sistole-auricular': lineal(6, 10, x),
    'contraccion-isovolumetrica': suave(10, p.aorticaDiastolica, x),
    eyeccion: x < 0.4 ? suave(p.aorticaDiastolica, p.aorticaSistolica, x / 0.4) : suave(p.aorticaSistolica, p.cierreAortico, (x - 0.4) / 0.6),
    'relajacion-isovolumetrica': suave(p.cierreAortico, 4, x),
    'llenado-rapido': suave(4, 3, x),
    diastasis: lineal(3, 6, x),
  }[tramo.fase];

  // ---- Presión aórtica: igual a la ventricular en la eyección; después, muesca dicrótica y caída
  // exponencial hasta la diastólica justo antes de la siguiente eyección.
  const eye = de('eyeccion');
  let presionAorta: number;
  if (tramo.fase === 'eyeccion') {
    presionAorta = presionVI;
  } else {
    const desdeCierre = modulo(t - eye.fin, periodo);
    const hastaApertura = periodo - (eye.fin - eye.inicio);
    const muesca = 0.04;
    presionAorta =
      desdeCierre < muesca
        ? p.cierreAortico - 6 * Math.sin((Math.PI * desdeCierre) / muesca)
        : p.aorticaDiastolica + (p.cierreAortico - p.aorticaDiastolica) * (1 - (desdeCierre - muesca) / (hastaApertura - muesca)) ** 1.3;
  }

  // ---- Presión auricular izquierda: ondas a (sístole auricular), c, v y descenso y.
  const presionAI = {
    'sistole-auricular': 6 + 5 * Math.sin(Math.PI * x),
    'contraccion-isovolumetrica': 6 + 2 * Math.sin(Math.PI * x),
    eyeccion: suave(5, 11, x),
    'relajacion-isovolumetrica': 11 + Math.sin(Math.PI * x),
    'llenado-rapido': suave(11, 5, x),
    diastasis: lineal(5, 6, x),
  }[tramo.fase];

  return {
    fase: tramo.fase,
    tCiclo: t,
    progreso: x,
    periodo,
    presionVI,
    presionAorta,
    presionAI,
    volumenVI,
    ecg: ecg(t, ts),
    avAbiertas: ['llenado-rapido', 'diastasis', 'sistole-auricular'].includes(tramo.fase),
    semilunaresAbiertas: tramo.fase === 'eyeccion',
  };
}

/** Instantes clave del ciclo (s): ondas del ECG y ruidos cardíacos. */
export function eventos(fc: number) {
  const ts = tramos(fc);
  const de = (f: FaseId) => ts.find((r) => r.fase === f)!;
  const sa = de('sistole-auricular');
  const eye = de('eyeccion');
  return {
    p: sa.inicio + (sa.fin - sa.inicio) * 0.35,
    r: sa.fin - 0.015,
    t: eye.inicio + (eye.fin - eye.inicio) * 0.72,
    /** Primer ruido: cierre de las válvulas auriculoventriculares. */
    s1: de('contraccion-isovolumetrica').inicio,
    /** Segundo ruido: cierre de las válvulas semilunares. */
    s2: de('relajacion-isovolumetrica').inicio,
  };
}

function ecg(t: number, ts: Tramo[]): number {
  const sa = ts[0]!;
  const eye = ts.find((r) => r.fase === 'eyeccion')!;
  const r = sa.fin - 0.015;
  const tOnda = eye.inicio + (eye.fin - eye.inicio) * 0.72;
  return (
    gauss(t, sa.inicio + (sa.fin - sa.inicio) * 0.35, 0.018, 0.15) +
    gauss(t, r - 0.018, 0.006, -0.12) +
    gauss(t, r, 0.008, 1.1) +
    gauss(t, r + 0.02, 0.007, -0.28) +
    gauss(t, tOnda, 0.04, 0.32)
  );
}

export const NOMBRE_FASE: Record<FaseId, string> = {
  'sistole-auricular': 'Sístole auricular',
  'contraccion-isovolumetrica': 'Contracción isovolumétrica',
  eyeccion: 'Eyección ventricular',
  'relajacion-isovolumetrica': 'Relajación isovolumétrica',
  'llenado-rapido': 'Llenado ventricular rápido',
  diastasis: 'Diástasis (llenado lento)',
};

/** Volumen sistólico, fracción de eyección y gasto cardíaco para una frecuencia. */
export function indices(fc: number) {
  const vs = VOLUMENES.vtd - VOLUMENES.vts;
  return { volumenSistolico: vs, fraccionEyeccion: vs / VOLUMENES.vtd, gastoCardiaco: (vs * fc) / 1000 };
}
