import { VELOCIDADES, type Reloj } from './useReloj';

/** Play/Pausa, reinicio y velocidad de una simulación. */
export default function Controles({ reloj, unidad = '×' }: { reloj: Reloj; unidad?: string }) {
  const { reproduciendo, setReproduciendo, velocidad, setVelocidad, reiniciar } = reloj;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Controles de la simulación">
      <button
        type="button"
        onClick={() => setReproduciendo(!reproduciendo)}
        className="min-w-24 rounded-md bg-oro-500 px-3 py-1.5 text-sm font-semibold text-tinta-950 hover:bg-oro-400"
      >
        {reproduciendo ? '❚❚ Pausa' : '▶ Play'}
      </button>
      <button type="button" onClick={reiniciar} className="rounded-md border border-tinta-700 px-3 py-1.5 text-sm text-tinta-200 hover:bg-tinta-800">
        ⟲ Reiniciar
      </button>
      <label className="ml-1 flex items-center gap-2 text-sm text-tinta-400">
        Velocidad
        <select
          value={velocidad}
          onChange={(e) => setVelocidad(Number(e.target.value))}
          className="rounded border border-tinta-700 bg-tinta-900 px-2 py-1 text-tinta-100"
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
