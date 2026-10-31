// Algoritmo SM-2 (SuperMemo 2, P. Woźniak, 1987) para la repetición espaciada.
//
// Calidad de la respuesta (0–5): 5 perfecta · 4 correcta con duda · 3 correcta con dificultad ·
// 2 incorrecta pero «casi» · 1 incorrecta · 0 en blanco.

export interface Tarjeta {
  /** Factor de facilidad (EF), mínimo 1,3. */
  ef: number;
  /** Días hasta el próximo repaso. */
  intervalo: number;
  /** Repasos correctos consecutivos. */
  repeticiones: number;
  /** Fecha del próximo repaso (AAAA-MM-DD). */
  proxima: string;
  aciertos: number;
  fallos: number;
  /** Fecha del último repaso (AAAA-MM-DD). */
  ultima: string;
}

export const EF_INICIAL = 2.5;
export const EF_MINIMO = 1.3;

/** Fecha local en formato AAAA-MM-DD. */
export function fechaLocal(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split('-').map(Number) as [number, number, number];
  return fechaLocal(new Date(a, m - 1, d + dias));
}

export function diasEntre(desde: string, hasta: string): number {
  const f = (s: string) => {
    const [a, m, d] = s.split('-').map(Number) as [number, number, number];
    return Date.UTC(a, m - 1, d);
  };
  return Math.round((f(hasta) - f(desde)) / 86_400_000);
}

export function tarjetaNueva(hoy: string): Tarjeta {
  return { ef: EF_INICIAL, intervalo: 0, repeticiones: 0, proxima: hoy, aciertos: 0, fallos: 0, ultima: hoy };
}

/** Nuevo factor de facilidad: EF' = EF + (0,1 − (5 − q)·(0,08 + (5 − q)·0,02)), con mínimo 1,3. */
export function nuevoEf(ef: number, calidad: number): number {
  const q = Math.min(5, Math.max(0, Math.round(calidad)));
  return Math.max(EF_MINIMO, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
}

/** Aplica un repaso con calidad `calidad` (0–5) en la fecha `hoy`. */
export function repasar(t: Tarjeta, calidad: number, hoy: string): Tarjeta {
  const q = Math.min(5, Math.max(0, Math.round(calidad)));
  const correcta = q >= 3;
  let repeticiones: number;
  let intervalo: number;
  if (!correcta) {
    // Fallo: se vuelve a empezar la serie y se repasa al día siguiente.
    repeticiones = 0;
    intervalo = 1;
  } else {
    repeticiones = t.repeticiones + 1;
    intervalo = repeticiones === 1 ? 1 : repeticiones === 2 ? 6 : Math.round(t.intervalo * t.ef);
  }
  return {
    ef: nuevoEf(t.ef, q),
    intervalo,
    repeticiones,
    proxima: sumarDias(hoy, intervalo),
    aciertos: t.aciertos + (correcta ? 1 : 0),
    fallos: t.fallos + (correcta ? 0 : 1),
    ultima: hoy,
  };
}

/** Una tarjeta se considera dominada cuando su intervalo alcanza 6 días (dos repasos correctos seguidos). */
export const dominada = (t: Tarjeta | undefined) => !!t && t.intervalo >= 6 && t.repeticiones >= 2;

export const pendiente = (t: Tarjeta | undefined, hoy: string) => !!t && t.proxima <= hoy;
