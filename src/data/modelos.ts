import modelosJson from './modelos.json';
import type { ResumenModelos } from './esquemas';
import type { SistemaId } from './sistemas';

/**
 * Resumen de los modelos 3D (generado por `npm run datos`; validado con Zod en los tests).
 * Módulo ligero, sin Zod ni el índice: lo usa también la portada (descarga para usar sin conexión).
 */
export const MODELOS = modelosJson as ResumenModelos;

/** Sistemas que ya tienen modelo 3D generado. */
export function sistemaTieneModelo(sistema: SistemaId): boolean {
  return sistema in MODELOS.sistemas;
}

/** URL del .glb de un sistema, con su versión (hash) para que la caché offline se renueve. */
export function urlModelo(sistema: SistemaId): string {
  const m = MODELOS.sistemas[sistema];
  return `${import.meta.env.BASE_URL}${m?.archivo ?? `models/${sistema}.glb`}${m ? `?v=${m.version}` : ''}`;
}
