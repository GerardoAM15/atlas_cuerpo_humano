import { VELOCIDADES, type Reloj } from './useReloj';

/** Play/Pausa, reinicio y velocidad de una simulación. */
export default function Controles({ reloj, unidad = '×' }: { reloj: Reloj; unidad?: string }) {
  const { reproduciendo, setReproduciendo, velocidad, setVelocidad, reiniciar } = reloj;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Controles de la simulación">
      <button
        type="button"
        onClick={() => setReproduciendo(!reproduciendo)}
        className="min-w-24 rounded-md bg-sky-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
      >
        {reproduciendo ? '❚❚ Pausa' : '▶ Play'}
      </button>
      <button type="button" onClick={reiniciar} className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800">
        ⟲ Reiniciar
      </button>
      <label className="ml-1 flex items-center gap-2 text-sm text-slate-400">
        Velocidad
        <select
          value={velocidad}
          onChange={(e) => setVelocidad(Number(e.target.value))}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
        >
          {VELOCIDADES.map((v) => (
            <option key={v} value={v}>
              {v}
              {unidad}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
