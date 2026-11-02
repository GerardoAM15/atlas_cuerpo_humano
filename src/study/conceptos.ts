// Conceptos de estudio: las estructuras pares (derecha/izquierda) se estudian como un solo concepto
// («fémur»), aunque las preguntas sobre el modelo 3D pregunten por un lado concreto.
import { INDICE, POR_ID } from '@/data/catalogo';
import type { ResumenEstructura } from '@/data/esquemas';
import type { SistemaId } from '@/data/sistemas';

/** Id del concepto: el de la estructura sin el sufijo de lado. */
export const conceptoId = (e: Pick<ResumenEstructura, 'id' | 'lado'>) => (e.lado ? e.id.replace(/-(d|i)$/, '') : e.id);

/** Nombre sin el lado: «Fémur derecho» → «Fémur», «Lóbulo derecho del timo» → «Lóbulo del timo». */
export const nombreBase = (e: Pick<ResumenEstructura, 'nombre' | 'lado'>) =>
  e.lado ? e.nombre.replace(/\s(derech|izquierd)[oa]\b/u, '').replace(/\s{2,}/g, ' ').trim() : e.nombre;

export interface Concepto {
  id: string;
  /** Estructura representativa (la derecha si es par). */
  e: ResumenEstructura;
  lados: ResumenEstructura[];
  nombre: string;
  sistema: SistemaId;
  region: string;
  tieneModelo: boolean;
}

let cache: Map<string, Concepto> | null = null;

/** Todos los conceptos del atlas, indexados por id. */
export function conceptos(): Map<string, Concepto> {
  if (cache) return cache;
  const mapa = new Map<string, Concepto>();
  for (const e of INDICE) {
    const id = conceptoId(e);
    const c = mapa.get(id);
    if (c) {
      c.lados.push(e);
      c.tieneModelo ||= e.nodoModelo !== null;
      if (e.lado === 'derecho') c.e = e;
    } else {
      mapa.set(id, { id, e, lados: [e], nombre: nombreBase(e), sistema: e.sistema, region: e.region, tieneModelo: e.nodoModelo !== null });
    }
  }
  cache = mapa;
  return mapa;
}

export const conceptoDe = (idEstructura: string) => {
  const e = POR_ID.get(idEstructura);
  return e ? conceptos().get(conceptoId(e)) : undefined;
};

/** Filtro de alcance: sistemas y, opcionalmente, una región («sistema/región»). */
export interface Alcance {
  sistemas: readonly SistemaId[];
  region?: string | null;
}

export function conceptosEn(alcance: Alcance): Concepto[] {
  return [...conceptos().values()].filter(
    (c) => alcance.sistemas.includes(c.sistema) && (!alcance.region || `${c.sistema}/${c.region}` === alcance.region),
  );
}
