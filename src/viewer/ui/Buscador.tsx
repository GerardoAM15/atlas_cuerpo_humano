import { useEffect, useId, useMemo, useState } from 'react';
import { INDICE } from '@/data/catalogo';
import type { ResumenEstructura } from '@/data/esquemas';
import { useAtlasStore } from '@/store/useAtlasStore';
import { claveRegion } from '../escena';

type Buscar = (consulta: string, limite?: number) => ResumenEstructura[];

// El índice de Fuse.js (y la propia librería) se crean la primera vez que se usa el buscador.
let buscador: Promise<Buscar> | null = null;
const cargarBuscador = () => (buscador ??= import('@/data/busqueda').then((m) => m.crearBuscador(INDICE)));

/** Búsqueda difusa con autocompletado (español, latín e inglés). Patrón ARIA combobox. */
export default function Buscador() {
  const [texto, setTexto] = useState('');
  const [activo, setActivo] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const seleccionar = useAtlasStore((s) => s.seleccionar);
  const idLista = useId();
  const [buscar, setBuscar] = useState<Buscar | null>(null);
  const resultados = useMemo(() => buscar?.(texto, 8) ?? [], [buscar, texto]);

  useEffect(() => {
    if (!abierto || buscar) return;
    let vigente = true;
    cargarBuscador()
      .then((b) => vigente && setBuscar(() => b))
      .catch((e: unknown) => console.error(e));
    return () => {
      vigente = false;
    };
  }, [abierto, buscar]);

  const elegir = (i: number) => {
    const e = resultados[i];
    if (!e) return;
    seleccionar(e.id, { enfocar: e.nodoModelo !== null, region: claveRegion(e.sistema, e.region), sistema: e.sistema });
    setTexto('');
    setAbierto(false);
  };

  const mostrarLista = abierto && texto.trim().length >= 2;

  return (
    <div className="relative">
      <label htmlFor={`${idLista}-input`} className="sr-only">
        Buscar estructura
      </label>
      <input
        id={`${idLista}-input`}
        type="search"
        role="combobox"
        aria-expanded={mostrarLista}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={mostrarLista && resultados[activo] ? `${idLista}-${activo}` : undefined}
        autoComplete="off"
        placeholder="Buscar: fémur, os hyoideum, clavicle…"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setActivo(0);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActivo((a) => Math.min(a + 1, resultados.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActivo((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            elegir(activo);
          } else if (e.key === 'Escape') {
            setAbierto(false);
          }
        }}
        className="w-full rounded-lg border border-tinta-700 bg-tinta-900 px-3 py-2 text-sm text-tinta-100 placeholder:text-tinta-400 focus:border-oro-500 focus:outline-none"
      />
      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-tinta-700 bg-tinta-900 py-1 shadow-xl"
        >
          {resultados.length === 0 && <li className="px-3 py-2 text-sm text-tinta-400">{buscar ? 'Sin resultados' : 'Preparando la búsqueda…'}</li>}
          {resultados.map((e, i) => (
            <li
              key={e.id}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => elegir(i)}
              onMouseEnter={() => setActivo(i)}
              className={`cursor-pointer px-3 py-1.5 ${i === activo ? 'bg-oro-500/15' : ''}`}
            >
              <p className="text-sm text-tinta-100">
                {e.nombre}
                {e.nodoModelo === null && <span className="ml-2 text-[10px] text-amber-400">sin modelo</span>}
              </p>
              <p className="text-xs text-tinta-400">
                <i>{e.latin}</i> · {e.ingles}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
