// Descarga de todos los modelos 3D a la caché del service worker para usar el atlas sin conexión.
// La app (JS, CSS y fichas) ya la precachea el service worker al instalarse.
import { MODELOS, urlModelo } from '@/data/modelos';
import type { SistemaId } from '@/data/sistemas';
import { CACHE_MODELOS } from './cache';

export interface ModeloDescargable {
  sistema: SistemaId;
  /** URL absoluta (con ?v=hash): es la clave con la que la guarda el service worker. */
  url: string;
  bytes: number;
}

export interface Progreso {
  /** Bytes ya guardados (incluidos los modelos que ya estaban en caché). */
  bytes: number;
  bytesTotales: number;
  guardados: number;
  total: number;
  /** Sistema que se está descargando. */
  actual: SistemaId | null;
}

export interface Entorno {
  abrirCache: () => Promise<Pick<Cache, 'match' | 'put'>>;
  fetch: typeof fetch;
}

const entornoNavegador = (): Entorno => ({
  abrirCache: () => caches.open(CACHE_MODELOS),
  fetch: (...args) => fetch(...args),
});

export function modelosDescargables(base = globalThis.location?.href ?? 'http://localhost/'): ModeloDescargable[] {
  return (Object.keys(MODELOS.sistemas) as SistemaId[]).map((sistema) => ({
    sistema,
    url: new URL(urlModelo(sistema), base).href,
    bytes: MODELOS.sistemas[sistema]!.bytes,
  }));
}

/** Sistemas cuyo modelo ya está en la caché. */
export async function modelosGuardados(modelos = modelosDescargables(), entorno = entornoNavegador()): Promise<Set<SistemaId>> {
  const cache = await entorno.abrirCache();
  const guardados = new Set<SistemaId>();
  for (const m of modelos) if (await cache.match(m.url)) guardados.add(m.sistema);
  return guardados;
}

/**
 * Descarga y guarda en la caché los modelos que falten, informando del progreso por bytes.
 * Se puede cancelar con `senal`; lo ya guardado se conserva.
 */
export async function descargarModelos(
  onProgreso: (p: Progreso) => void,
  senal?: AbortSignal,
  modelos = modelosDescargables(),
  entorno = entornoNavegador(),
): Promise<void> {
  const cache = await entorno.abrirCache();
  const progreso: Progreso = {
    bytes: 0,
    bytesTotales: modelos.reduce((s, m) => s + m.bytes, 0),
    guardados: 0,
    total: modelos.length,
    actual: null,
  };
  const avisar = () => onProgreso({ ...progreso });

  for (const m of modelos) {
    senal?.throwIfAborted();
    if (await cache.match(m.url)) {
      progreso.bytes += m.bytes;
      progreso.guardados++;
      avisar();
      continue;
    }
    progreso.actual = m.sistema;
    avisar();
    const respuesta = await entorno.fetch(m.url, { signal: senal });
    if (!respuesta.ok) throw new Error(`No se pudo descargar el modelo ${m.sistema} (HTTP ${respuesta.status})`);

    // Lectura por trozos para mostrar el avance dentro de cada archivo.
    const trozos: Uint8Array[] = [];
    const inicio = progreso.bytes;
    const lector = respuesta.body?.getReader();
    if (lector) {
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        trozos.push(value);
        progreso.bytes = Math.min(inicio + trozos.reduce((s, t) => s + t.length, 0), inicio + m.bytes);
        avisar();
      }
    } else {
      trozos.push(new Uint8Array(await respuesta.arrayBuffer()));
    }
    const tipo = respuesta.headers.get('Content-Type') ?? 'model/gltf-binary';
    await cache.put(m.url, new Response(new Blob(trozos as BlobPart[], { type: tipo }), { status: 200, headers: { 'Content-Type': tipo } }));
    progreso.bytes = inicio + m.bytes;
    progreso.guardados++;
    avisar();
  }
  progreso.actual = null;
  avisar();
}

/** Pide al navegador que no borre la caché si falta espacio (puede negarse). */
export async function pedirAlmacenamientoPersistente(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
