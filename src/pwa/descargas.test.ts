import { describe, expect, it } from 'vitest';
import { MODELOS } from '@/data/modelos';
import { descargarModelos, modelosDescargables, modelosGuardados, type Entorno, type ModeloDescargable, type Progreso } from './descargas';

/** Caché y red simuladas: la red devuelve `bytes` bytes en trozos de 1000. */
function entornoFalso(enCache: string[] = []) {
  const guardado = new Map<string, Response>(enCache.map((u) => [u, new Response('x')]));
  const pedidas: string[] = [];
  const entorno: Entorno = {
    abrirCache: async () => ({
      match: async (url: RequestInfo | URL) => guardado.get(String(url)),
      put: async (url: RequestInfo | URL, r: Response) => void guardado.set(String(url), r),
    }),
    fetch: async (url, init) => {
      init?.signal?.throwIfAborted();
      pedidas.push(String(url));
      const bytes = Number(new URL(String(url)).searchParams.get('bytes'));
      const trozos = Array.from({ length: Math.ceil(bytes / 1000) }, (_, i) => new Uint8Array(Math.min(1000, bytes - i * 1000)));
      return new Response(new ReadableStream({ start: (c) => (trozos.forEach((t) => c.enqueue(t)), c.close()) }), { headers: { 'Content-Type': 'model/gltf-binary' } });
    },
  };
  return { entorno, guardado, pedidas };
}

const modelos: ModeloDescargable[] = [
  { sistema: 'esqueletico', url: 'https://x/models/esqueletico.glb?v=1&bytes=3500', bytes: 3500 },
  { sistema: 'muscular', url: 'https://x/models/muscular.glb?v=1&bytes=2000', bytes: 2000 },
  { sistema: 'urinario', url: 'https://x/models/urinario.glb?v=1&bytes=500', bytes: 500 },
];

describe('descarga de modelos para usar sin conexión', () => {
  it('lista un modelo por sistema con su versión en la URL', () => {
    const lista = modelosDescargables('https://ejemplo.org/atlas/');
    expect(lista).toHaveLength(Object.keys(MODELOS.sistemas).length);
    for (const m of lista) {
      // La URL se resuelve respecto a la página (en la app, base './'; en los tests, '/').
      expect(m.url.startsWith('https://ejemplo.org/')).toBe(true);
      expect(m.url.endsWith(`models/${m.sistema}.glb?v=${MODELOS.sistemas[m.sistema]!.version}`)).toBe(true);
      expect(m.bytes).toBeGreaterThan(0);
    }
  });

  it('guarda todos los modelos y el progreso avanza hasta el total', async () => {
    const { entorno, guardado } = entornoFalso();
    const avisos: Progreso[] = [];
    await descargarModelos((p) => avisos.push(p), undefined, modelos, entorno);
    expect([...guardado.keys()]).toEqual(modelos.map((m) => m.url));
    const bytes = avisos.map((p) => p.bytes);
    expect(bytes).toEqual([...bytes].sort((a, b) => a - b)); // nunca retrocede
    expect(avisos.at(-1)).toMatchObject({ bytes: 6000, bytesTotales: 6000, guardados: 3, total: 3, actual: null });
    // Hay avisos intermedios dentro del primer archivo (se lee por trozos).
    expect(avisos.some((p) => p.actual === 'esqueletico' && p.bytes > 0 && p.bytes < 3500)).toBe(true);
  });

  it('no vuelve a descargar lo que ya está en caché', async () => {
    const { entorno, pedidas } = entornoFalso([modelos[0]!.url]);
    expect(await modelosGuardados(modelos, entorno)).toEqual(new Set(['esqueletico']));
    await descargarModelos(() => {}, undefined, modelos, entorno);
    expect(pedidas).toEqual([modelos[1]!.url, modelos[2]!.url]);
    expect(await modelosGuardados(modelos, entorno)).toEqual(new Set(['esqueletico', 'muscular', 'urinario']));
  });

  it('se puede cancelar', async () => {
    const { entorno, guardado } = entornoFalso();
    const control = new AbortController();
    const promesa = descargarModelos((p) => p.guardados === 1 && control.abort(), control.signal, modelos, entorno);
    await expect(promesa).rejects.toThrow();
    expect(guardado.size).toBe(1);
  });

  it('informa de un error HTTP', async () => {
    const { entorno } = entornoFalso();
    entorno.fetch = async () => new Response('', { status: 404 });
    await expect(descargarModelos(() => {}, undefined, modelos, entorno)).rejects.toThrow(/HTTP 404/);
  });
});
