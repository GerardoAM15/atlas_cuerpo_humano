import { useState, type ReactNode } from 'react';
import { REGIONES } from '@/data/regiones';
import { sistemaTieneModelo } from '@/data/catalogo';
import { SISTEMAS } from '@/data/sistemas';
import { useAtlasStore, type EjeCorte, type Vista } from '@/store/useAtlasStore';
import { EJE_INDICE, cajaDeSistemas, centroCaja } from '../escena';

const VISTAS: { vista: Vista; etiqueta: string; corta: string }[] = [
  { vista: 'anterior', etiqueta: 'Vista anterior', corta: 'Ant' },
  { vista: 'posterior', etiqueta: 'Vista posterior', corta: 'Post' },
  { vista: 'lateral-derecha', etiqueta: 'Vista lateral derecha', corta: 'Lat D' },
  { vista: 'lateral-izquierda', etiqueta: 'Vista lateral izquierda', corta: 'Lat I' },
  { vista: 'superior', etiqueta: 'Vista superior', corta: 'Sup' },
];

const EJES: { eje: EjeCorte; nombre: string }[] = [
  { eje: 'sagital', nombre: 'Sagital' },
  { eje: 'coronal', nombre: 'Coronal' },
  { eje: 'transversal', nombre: 'Transversal' },
];

const SISTEMAS_CON_MODELO = SISTEMAS.map((s) => s.id).filter(sistemaTieneModelo);
const REGIONES_EXPLOSION = SISTEMAS_CON_MODELO.flatMap((s) => (REGIONES[s] ?? []).filter((r) => r.explosion));

const boton = (activo = false) =>
  `rounded-md px-2 py-1 text-xs font-medium transition-colors ${
    activo ? 'bg-sky-500 text-slate-950' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
  }`;

function Desplegable({ titulo, activo, children }: { titulo: string; activo: boolean; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-expanded={abierto} onClick={() => setAbierto((v) => !v)} className={boton(activo)}>
        {titulo} ▾
      </button>
      {abierto && (
        <div className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
          {children}
        </div>
      )}
    </div>
  );
}

/** Herramientas sobre el lienzo: vistas rápidas, cortes, explosión y etiquetas. */
export default function BarraHerramientas() {
  const vista = useAtlasStore((s) => s.vista);
  const reiniciarCamara = useAtlasStore((s) => s.reiniciarCamara);
  const corte = useAtlasStore((s) => s.corte);
  const setCorte = useAtlasStore((s) => s.setCorte);
  const explosion = useAtlasStore((s) => s.explosion);
  const setExplosion = useAtlasStore((s) => s.setExplosion);
  const etiquetas = useAtlasStore((s) => s.etiquetas);
  const setEtiquetas = useAtlasStore((s) => s.setEtiquetas);
  const ocultas = useAtlasStore((s) => s.ocultas);
  const aislar = useAtlasStore((s) => s.aislar);
  const mostrarTodas = useAtlasStore((s) => s.mostrarTodas);

  const caja = cajaDeSistemas(SISTEMAS_CON_MODELO);
  const k = EJE_INDICE[corte.eje];
  const rango = caja ? { min: caja.min[k]!, max: caja.max[k]! } : { min: -1, max: 1 };

  const cambiarEje = (eje: EjeCorte) => {
    // Al cambiar de eje, el plano empieza en el centro del cuerpo.
    const centro = caja ? centroCaja(caja)[EJE_INDICE[eje]] : 0;
    setCorte({ eje, posicion: centro });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5" role="toolbar" aria-label="Herramientas del visor">
      <div className="flex gap-1" role="group" aria-label="Vistas rápidas">
        {VISTAS.map((v) => (
          <button key={v.vista} type="button" onClick={() => vista(v.vista)} title={v.etiqueta} aria-label={v.etiqueta} className={boton()}>
            {v.corta}
          </button>
        ))}
        <button type="button" onClick={reiniciarCamara} title="Reiniciar cámara" className={boton()}>
          ⟲
        </button>
      </div>

      <Desplegable titulo="Corte" activo={corte.activo}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={corte.activo}
            onChange={(e) => {
              if (e.target.checked && !corte.activo) cambiarEje(corte.eje);
              setCorte({ activo: e.target.checked });
            }}
            className="accent-sky-500"
          />
          Activar plano de corte
        </label>
        <fieldset className="mt-2 flex gap-1" disabled={!corte.activo}>
          <legend className="sr-only">Plano anatómico</legend>
          {EJES.map((e) => (
            <button key={e.eje} type="button" onClick={() => cambiarEje(e.eje)} aria-pressed={corte.eje === e.eje} className={boton(corte.eje === e.eje)}>
              {e.nombre}
            </button>
          ))}
        </fieldset>
        <label className="mt-3 block text-xs text-slate-400">
          Posición del plano
          <input
            type="range"
            min={rango.min}
            max={rango.max}
            step={0.002}
            value={corte.posicion}
            disabled={!corte.activo}
            onChange={(e) => setCorte({ posicion: Number(e.target.value) })}
            className="mt-1 w-full accent-sky-500"
          />
        </label>
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" checked={corte.invertir} disabled={!corte.activo} onChange={(e) => setCorte({ invertir: e.target.checked })} className="accent-sky-500" />
          Invertir lado conservado
        </label>
      </Desplegable>

      <Desplegable titulo="Explosión" activo={explosion.factor > 0}>
        <label className="block text-xs text-slate-400">
          Región
          <select
            value={explosion.region}
            onChange={(e) => setExplosion({ region: e.target.value })}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
          >
            {REGIONES_EXPLOSION.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs text-slate-400">
          Separación
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={explosion.factor}
            onChange={(e) => setExplosion({ factor: Number(e.target.value) })}
            className="mt-1 w-full accent-sky-500"
          />
        </label>
      </Desplegable>

      <button type="button" onClick={() => setEtiquetas(!etiquetas)} aria-pressed={etiquetas} className={boton(etiquetas)}>
        Etiquetas
      </button>

      {(ocultas.length > 0 || aislar) && (
        <button type="button" onClick={mostrarTodas} className={boton()}>
          Mostrar todo{ocultas.length ? ` (${ocultas.length} ocultas)` : ''}
        </button>
      )}
    </div>
  );
}
