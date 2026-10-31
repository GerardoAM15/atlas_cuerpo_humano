// Utilidades numéricas para construir curvas fisiológicas suaves a trozos.

export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Interpolación con suavizado coseno entre a y b (x en [0, 1]). */
export const suave = (a: number, b: number, x: number) => a + (b - a) * (1 - Math.cos(Math.PI * limitar(x, 0, 1))) / 2;

/** Interpolación «rápida al principio» (ease-out cuadrático). */
export const rapidaAlInicio = (a: number, b: number, x: number) => {
  const u = limitar(x, 0, 1);
  return a + (b - a) * (1 - (1 - u) * (1 - u));
};

export const lineal = (a: number, b: number, x: number) => a + (b - a) * limitar(x, 0, 1);

/** Campana gaussiana centrada en `centro` con anchura `sigma`. */
export const gauss = (t: number, centro: number, sigma: number, amplitud: number) =>
  amplitud * Math.exp(-((t - centro) ** 2) / (2 * sigma * sigma));

/** Módulo positivo (para tiempos cíclicos). */
export const modulo = (a: number, n: number) => ((a % n) + n) % n;

/** Muestrea f en [desde, hasta] con n puntos. */
export function muestrear(f: (x: number) => number, desde: number, hasta: number, n = 200): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = desde + ((hasta - desde) * i) / n;
    return [x, f(x)] as [number, number];
  });
}
