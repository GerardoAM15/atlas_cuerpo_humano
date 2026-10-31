export interface RutaNav {
  ruta: string;
  etiqueta: string;
}

export const RUTAS_NAV: readonly RutaNav[] = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/atlas', etiqueta: 'Atlas 3D' },
  { ruta: '/simulaciones', etiqueta: 'Simulaciones' },
  { ruta: '/estudio', etiqueta: 'Estudio' },
  { ruta: '/creditos', etiqueta: 'Créditos' },
];

/** Opta por el comportamiento de React Router v7 (evita avisos y facilita migrar). */
export const FUTURO_ROUTER = { v7_startTransition: true, v7_relativeSplatPath: true } as const;
