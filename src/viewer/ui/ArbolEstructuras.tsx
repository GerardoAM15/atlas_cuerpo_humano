import { useEffect, useRef, useState } from 'react';
import { POR_ID, estructurasDe, sistemaTieneModelo } from '@/data/catalogo';
import { REGIONES } from '@/data/regiones';
import { SISTEMAS } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';
import { claveRegion } from '../escena';

function IconoOjo({ tachado }: { tachado: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {tachado && <path d="M3 3l18 18" />}
    </svg>
  );
}

/** Árbol Sistema → Región → Estructura, sincronizado con la selección del modelo 3D. */
export default function ArbolEstructuras() {
  const seleccion = useAtlasStore((s) => s.seleccion);
  const ocultas = useAtlasStore((s) => s.ocultas);
  const seleccionar = useAtlasStore((s) => s.seleccionar);
  const ocultar = useAtlasStore((s) => s.ocultarEstructura);
  const mostrar = useAtlasStore((s) => s.mostrarEstructura);
  const setRegionActiva = useAtlasStore((s) => s.setRegionActiva);
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set(['esqueletico']));
  const contenedor = useRef<HTMLDivElement>(null);

  const alternar = (clave: string) =>
    setAbiertos((prev) => {
      const sig = new Set(prev);
      if (sig.has(clave)) sig.delete(clave);
      else sig.add(clave);
      return sig;
    });

  // Al seleccionar en el 3D, despliega su rama y la desplaza a la vista.
  useEffect(() => {
    const e = seleccion ? POR_ID.get(seleccion) : undefined;
    if (!e) return;
    setAbiertos((prev) => new Set([...prev, e.sistema, `${e.sistema}/${e.region}`]));
    requestAnimationFrame(() => {
      contenedor.current?.querySelector(`[data-id="${e.id}"]`)?.scrollIntoView({ block: 'nearest' });
    });
  }, [seleccion]);

  return (
    <div ref={contenedor} role="tree" aria-label="Estructuras por sistema y región" className="text-sm">
      {SISTEMAS.filter((s) => sistemaTieneModelo(s.id)).map((s) => {
        const abiertoS = abiertos.has(s.id);
        return (
          <div key={s.id} role="treeitem" aria-expanded={abiertoS} aria-selected={false}>
            <button type="button" onClick={() => alternar(s.id)} className="flex w-full items-center gap-1.5 rounded px-1 py-1 font-semibold hover:bg-slate-800">
              <span aria-hidden className={`inline-block transition-transform ${abiertoS ? 'rotate-90' : ''}`}>▸</span>
              {s.nombre}
            </button>
            {abiertoS && (
              <div role="group" className="ml-3 border-l border-slate-800 pl-1">
                {(REGIONES[s.id] ?? []).map((r) => {
                  const clave = `${s.id}/${r.id}`;
                  const abiertoR = abiertos.has(clave);
                  const items = estructurasDe(s.id).filter((e) => e.region === r.id);
                  return (
                    <div key={r.id} role="treeitem" aria-expanded={abiertoR} aria-selected={false}>
                      <button
                        type="button"
                        onClick={() => {
                          alternar(clave);
                          setRegionActiva(claveRegion(s.id, r.id));
                        }}
                        className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-slate-300 hover:bg-slate-800"
                      >
                        <span aria-hidden className={`inline-block text-xs transition-transform ${abiertoR ? 'rotate-90' : ''}`}>▸</span>
                        {r.nombre}
                        <span className="ml-auto text-[10px] text-slate-500">{items.length}</span>
                      </button>
                      {abiertoR && (
                        <ul role="group" className="ml-3">
                          {items.map((e) => {
                            const oculta = ocultas.includes(e.id);
                            const sinModelo = e.nodoModelo === null;
                            const sel = e.id === seleccion;
                            return (
                              <li key={e.id} role="treeitem" aria-selected={sel} data-id={e.id} className="group flex items-center">
                                <button
                                  type="button"
                                  onClick={() => seleccionar(e.id, { enfocar: !sinModelo, region: claveRegion(e.sistema, e.region), sistema: e.sistema })}
                                  className={`flex-1 truncate rounded px-1 py-0.5 text-left text-xs ${
                                    sel ? 'bg-sky-500/20 text-sky-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                  } ${oculta ? 'line-through opacity-60' : ''} ${sinModelo ? 'italic text-slate-500' : ''}`}
                                  title={sinModelo ? `${e.nombre} (sin modelo 3D)` : e.nombre}
                                >
                                  {e.nombre}
                                  {sinModelo && <span className="ml-1 not-italic text-[9px] text-amber-400">sin modelo</span>}
                                </button>
                                {!sinModelo && (
                                  <button
                                    type="button"
                                    onClick={() => (oculta ? mostrar(e.id) : ocultar(e.id))}
                                    aria-label={oculta ? `Mostrar ${e.nombre}` : `Ocultar ${e.nombre}`}
                                    aria-pressed={oculta}
                                    className={`rounded p-1 text-slate-500 hover:text-slate-200 ${oculta ? '' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                                  >
                                    <IconoOjo tachado={oculta} />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
