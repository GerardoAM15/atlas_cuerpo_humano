// Modelo simplificado de la ventilación pulmonar y del intercambio alveolar.
// Volúmenes típicos de un adulto (OpenStax Anatomy & Physiology): VT 500 ml, VRI 3100 ml, VRE 1200 ml, VR 1200 ml.
import { limitar, modulo, suave } from '../comun/matematicas';

export const VOL = { vt: 500, vri: 3100, vre: 1200, vr: 1200 } as const;

export const CAPACIDADES = {
  /** Capacidad inspiratoria = VT + VRI. */
  ci: VOL.vt + VOL.vri,
  /** Capacidad residual funcional = VRE + VR. */
  crf: VOL.vre + VOL.vr,
  /** Capacidad vital = VRI + VT + VRE. */
  cv: VOL.vri + VOL.vt + VOL.vre,
  /** Capacidad pulmonar total = CV + VR. */
  cpt: VOL.vri + VOL.vt + VOL.vre + VOL.vr,
} as const;

/** Espacio muerto anatómico (aire que no llega a los alvéolos). */
export const ESPACIO_MUERTO = 150;

/** Presiones parciales típicas (mmHg) a nivel del mar. */
export const GASES = {
  alveolo: { o2: 104, co2: 40 },
  sangreVenosa: { o2: 40, co2: 45 },
  sangreArterial: { o2: 100, co2: 40 },
} as const;

export type Modo = 'reposo' | 'espirometria';
export type FaseResp = 'inspiracion' | 'espiracion' | 'inspiracion-maxima' | 'espiracion-forzada' | 'recuperacion';

export interface EstadoResp {
  fase: FaseResp;
  /** Volumen pulmonar total (ml). */
  volumen: number;
  /** Volumen sobre la CRF, como en un espirograma de reposo (ml). */
  sobreCrf: number;
  /** Presión alveolar relativa a la atmosférica (mmHg): negativa al inspirar. */
  presionAlveolar: number;
  /** Presión intrapleural aproximada (mmHg). */
  presionPleural: number;
  /** Desplazamiento relativo del diafragma: 0 en la CRF, 1 en la CPT, negativo por debajo de la CRF. */
  diafragma: number;
}

export const DURACION_ESPIROMETRIA = 25;

/** Volumen pulmonar (ml) en el instante t (s). */
export function volumen(t: number, modo: Modo, fr = 12): { v: number; fase: FaseResp; flujo: number } {
  const { crf, cpt } = CAPACIDADES;
  const reposo = (tt: number) => {
    const periodo = 60 / fr;
    const ti = periodo / 3; // relación inspiración:espiración ≈ 1:2
    const x = modulo(tt, periodo);
    if (x < ti) return { v: crf + VOL.vt * (1 - Math.cos((Math.PI * x) / ti)) / 2, fase: 'inspiracion' as const, flujo: Math.sin((Math.PI * x) / ti) };
    const u = (x - ti) / (periodo - ti);
    return { v: crf + VOL.vt * (1 + Math.cos(Math.PI * u)) / 2, fase: 'espiracion' as const, flujo: -Math.sin(Math.PI * u) / 2 };
  };
  if (modo === 'reposo') return reposo(t);

  // Espirometría: 3 respiraciones tranquilas (15 s a 12 rpm), inspiración máxima (3 s),
  // espiración forzada máxima (5 s) y recuperación hasta la CRF (2 s).
  const x = modulo(t, DURACION_ESPIROMETRIA);
  if (x < 15) {
    const periodo = 5;
    const ti = periodo / 3;
    const y = modulo(x, periodo);
    if (y < ti) return { v: crf + VOL.vt * (1 - Math.cos((Math.PI * y) / ti)) / 2, fase: 'inspiracion', flujo: 0.5 };
    return { v: crf + VOL.vt * (1 + Math.cos((Math.PI * (y - ti)) / (periodo - ti))) / 2, fase: 'espiracion', flujo: -0.3 };
  }
  if (x < 18) return { v: suave(crf, cpt, (x - 15) / 3), fase: 'inspiracion-maxima', flujo: 1 };
  if (x < 23) {
    // Espiración forzada: rápida al principio; en el primer segundo sale ≈ 77 % de la CV (FEV1/FVC normal).
    const u = (x - 18) / 5;
    return { v: VOL.vr + (cpt - VOL.vr) * Math.exp(-7 * u) * (1 - u) ** 0.3, fase: 'espiracion-forzada', flujo: -1.5 };
  }
  return { v: suave(VOL.vr, crf, (x - 23) / 2), fase: 'recuperacion', flujo: 0.4 };
}

export function estadoResp(t: number, modo: Modo, fr = 12): EstadoResp {
  const { v, fase, flujo } = volumen(t, modo, fr);
  const { crf, cpt } = CAPACIDADES;
  return {
    fase,
    volumen: v,
    sobreCrf: v - crf,
    // En reposo la presión alveolar oscila ≈ ±1 mmHg; en las maniobras forzadas, más.
    presionAlveolar: limitar(-flujo, -3, 3),
    presionPleural: -4 - (2 * (v - crf)) / VOL.vt,
    diafragma: v >= crf ? (v - crf) / (cpt - crf) : (v - crf) / (crf - VOL.vr) / 2,
  };
}

/** Ventilación minuto y alveolar (ml/min). */
export function ventilacion(fr: number, vt: number = VOL.vt) {
  return { minuto: fr * vt, alveolar: fr * (vt - ESPACIO_MUERTO) };
}

export const MUSCULOS: Record<FaseResp, string> = {
  inspiracion: 'Diafragma (principal) e intercostales externos.',
  espiracion: 'Ninguno: espiración pasiva por el retroceso elástico de pulmones y tórax.',
  'inspiracion-maxima': 'Diafragma, intercostales externos y músculos accesorios: esternocleidomastoideos, escalenos y pectorales menores.',
  'espiracion-forzada': 'Músculos abdominales (recto, oblicuos, transverso) e intercostales internos.',
  recuperacion: 'Diafragma e intercostales externos, de vuelta a la respiración tranquila.',
};
