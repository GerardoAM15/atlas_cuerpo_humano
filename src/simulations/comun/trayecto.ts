export type Punto = readonly [number, number];

/** Trayecto poligonal con parametrización por longitud de arco (0 = inicio, 1 = final). */
export function crearTrayecto(puntos: readonly Punto[]) {
  const acumulado = [0];
  for (let i = 1; i < puntos.length; i++) {
    const [x0, y0] = puntos[i - 1]!;
    const [x1, y1] = puntos[i]!;
    acumulado.push(acumulado[i - 1]! + Math.hypot(x1 - x0, y1 - y0));
  }
  const total = acumulado[acumulado.length - 1]!;

  /** Punto en la fracción `f` del recorrido (se recorta a [0, 1]). */
  const en = (f: number): Punto => {
    const objetivo = Math.min(1, Math.max(0, f)) * total;
    let i = 1;
    while (i < acumulado.length - 1 && acumulado[i]! < objetivo) i++;
    const tramo = acumulado[i]! - acumulado[i - 1]! || 1;
    const u = (objetivo - acumulado[i - 1]!) / tramo;
    const [x0, y0] = puntos[i - 1]!;
    const [x1, y1] = puntos[i]!;
    return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
  };

  /** Fracción del recorrido en la que está el vértice `indice`. */
  const fraccionDeVertice = (indice: number) => acumulado[indice]! / total;

  return { en, total, fraccionDeVertice, d: `M ${puntos.map((p) => p.join(' ')).join(' L ')}` };
}
