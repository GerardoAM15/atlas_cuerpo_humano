import manifestJson from './manifest-modelos.json';
import { ArchivoEstructuras, ManifestModelos, type Caja, type EntradaManifest, type Estructura } from './esquemas';
import type { SistemaId } from './sistemas';

/**
 * Carga y valida (Zod) los datos de estructuras y el manifest de modelos.
 * Los JSON de src/data/estructuras se generan con `npm run datos`.
 */
const archivos = import.meta.glob<unknown>('./estructuras/*.json', { eager: true, import: 'default' });

export const MANIFEST = ManifestModelos.parse(manifestJson);

export const ESTRUCTURAS: readonly Estructura[] = Object.entries(archivos).flatMap(([ruta, json]) => {
  const res = ArchivoEstructuras.safeParse(json);
  if (!res.success) throw new Error(`Datos inválidos en ${ruta}: ${res.error.issues[0]?.message ?? ''}`);
  return res.data;
});

export const POR_ID: ReadonlyMap<string, Estructura> = new Map(ESTRUCTURAS.map((e) => [e.id, e]));

/** Nodo del modelo → id de estructura (hoy coinciden, pero se resuelve siempre por aquí). */
export const POR_NODO: ReadonlyMap<string, string> = new Map(
  ESTRUCTURAS.filter((e) => e.nodoModelo).map((e) => [e.nodoModelo!, e.id]),
);

const ENTRADAS_MANIFEST = new Map<string, EntradaManifest>(
  Object.values(MANIFEST.sistemas).flatMap((s) => s.estructuras.map((e) => [e.id, e] as const)),
);

/** Caja envolvente (coordenadas de escena) de una estructura con modelo. */
export function cajaDe(id: string): Caja | null {
  const e = ENTRADAS_MANIFEST.get(id);
  return e?.estado === 'disponible' ? (e.caja as Caja) : null;
}

export function centroDe(id: string): [number, number, number] | null {
  const c = cajaDe(id);
  if (!c) return null;
  return [(c.min[0] + c.max[0]) / 2, (c.min[1] + c.max[1]) / 2, (c.min[2] + c.max[2]) / 2];
}

export function estructurasDe(sistema: SistemaId): Estructura[] {
  return ESTRUCTURAS.filter((e) => e.sistema === sistema);
}

/** Sistemas que ya tienen modelo 3D generado. */
export function sistemaTieneModelo(sistema: SistemaId): boolean {
  return sistema in MANIFEST.sistemas;
}

export function urlModelo(sistema: SistemaId): string {
  return `${import.meta.env.BASE_URL}${MANIFEST.sistemas[sistema]?.archivo ?? `models/${sistema}.glb`}`;
}
