import { useEffect } from 'react';
import { create } from 'zustand';
import indiceJson from './indice.json';
import { ArchivoEstructuras, Indice, type Caja, type Estructura, type ResumenEstructura } from './esquemas';
import type { SistemaId } from './sistemas';

export { MODELOS, sistemaTieneModelo, urlModelo } from './modelos';

/**
 * Catálogo de estructuras en dos niveles (los JSON se generan con `npm run datos`):
 * - Índice (src/data/indice.json): resumen de todas las estructuras, disponible al momento.
 * - Fichas completas (src/data/estructuras/<sistema>.json): un chunk por sistema que se carga
 *   bajo demanda con `cargarSistemas` / `useFichas` y se valida con Zod al llegar.
 */

export const INDICE: readonly ResumenEstructura[] = Indice.parse(indiceJson);

export const POR_ID: ReadonlyMap<string, ResumenEstructura> = new Map(INDICE.map((e) => [e.id, e]));

/** Nodo del modelo → id de estructura (hoy coinciden, pero se resuelve siempre por aquí). */
export const POR_NODO: ReadonlyMap<string, string> = new Map(INDICE.filter((e) => e.nodoModelo).map((e) => [e.nodoModelo!, e.id]));

/** Caja envolvente (coordenadas de escena) de una estructura con modelo. */
export function cajaDe(id: string): Caja | null {
  return (POR_ID.get(id)?.caja as Caja | undefined) ?? null;
}

export function centroDe(id: string): [number, number, number] | null {
  const c = cajaDe(id);
  if (!c) return null;
  return [(c.min[0] + c.max[0]) / 2, (c.min[1] + c.max[1]) / 2, (c.min[2] + c.max[2]) / 2];
}

export function estructurasDe(sistema: SistemaId): ResumenEstructura[] {
  return INDICE.filter((e) => e.sistema === sistema);
}


// ---------------------------------------------------------------- Fichas completas (bajo demanda)

const archivos = import.meta.glob<unknown>('./estructuras/*.json', { import: 'default' });
const FICHAS = new Map<string, Estructura>();
const cargas = new Map<SistemaId, Promise<void>>();

/** Sistemas cuyas fichas ya están cargadas (para que los componentes se actualicen). */
const useCargados = create<{ cargados: ReadonlySet<SistemaId> }>(() => ({ cargados: new Set() }));

function cargarSistema(sistema: SistemaId): Promise<void> {
  let carga = cargas.get(sistema);
  if (!carga) {
    const ruta = `./estructuras/${sistema}.json`;
    const importar = archivos[ruta];
    carga = (importar ? importar() : Promise.resolve([]))
      .then((json) => {
        const res = ArchivoEstructuras.safeParse(json);
        if (!res.success) throw new Error(`Datos inválidos en ${ruta}: ${res.error.issues[0]?.message ?? ''}`);
        for (const e of res.data) FICHAS.set(e.id, e);
        useCargados.setState((s) => ({ cargados: new Set([...s.cargados, sistema]) }));
      })
      .catch((error: unknown) => {
        cargas.delete(sistema); // permite reintentar (p. ej. tras recuperar la conexión)
        throw error;
      });
    cargas.set(sistema, carga);
  }
  return carga;
}

/** Carga (una sola vez) las fichas completas de los sistemas indicados. */
export async function cargarSistemas(sistemas: readonly SistemaId[]): Promise<void> {
  await Promise.all(sistemas.map(cargarSistema));
}

/** Ficha completa de una estructura, si su sistema ya está cargado. */
export function fichaDe(id: string): Estructura | undefined {
  return FICHAS.get(id);
}

/** Fichas cargadas (todas las de los sistemas ya cargados). */
export function fichasCargadas(): Estructura[] {
  return [...FICHAS.values()];
}

/** Pide las fichas de los sistemas indicados y devuelve true cuando están todas cargadas. */
export function useFichas(sistemas: readonly SistemaId[]): boolean {
  const clave = [...sistemas].sort().join(',');
  const listo = useCargados((s) => sistemas.every((x) => s.cargados.has(x)));
  useEffect(() => {
    if (!listo) cargarSistemas(clave ? (clave.split(',') as SistemaId[]) : []).catch((e: unknown) => console.error(e));
  }, [clave, listo]);
  return listo;
}
