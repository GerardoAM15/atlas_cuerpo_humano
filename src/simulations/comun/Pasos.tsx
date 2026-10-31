export interface Paso {
  id: string;
  titulo: string;
  texto: string;
}

/**
 * Explicación narrada: lista de pasos con el actual resaltado. Al pulsar un paso, la
 * simulación salta a él (si se proporciona `onElegir`). El texto del paso activo se anuncia
 * a los lectores de pantalla.
 */
export default function Pasos({ pasos, activo, onElegir }: { pasos: readonly Paso[]; activo: string; onElegir?: (id: string) => void }) {
  const actual = pasos.find((p) => p.id === activo);
  return (
    <section aria-labelledby="pasos-titulo" className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <h2 id="pasos-titulo" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Paso a paso
      </h2>
      <ol className="mt-2 space-y-1">
        {pasos.map((p, i) => {
          const esActivo = p.id === activo;
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={!onElegir}
                onClick={() => onElegir?.(p.id)}
                aria-current={esActivo ? 'step' : undefined}
                className={`flex w-full gap-2 rounded px-2 py-1 text-left text-sm ${
                  esActivo ? 'bg-sky-500/15 text-sky-200' : 'text-slate-400 enabled:hover:bg-slate-800'
                }`}
              >
                <span className={`font-bold ${esActivo ? 'text-sky-300' : 'text-slate-600'}`}>{i + 1}.</span>
                {p.titulo}
              </button>
            </li>
          );
        })}
      </ol>
      <p aria-live="polite" className="mt-3 min-h-16 rounded-md bg-slate-950/60 p-2 text-sm leading-relaxed text-slate-300">
        {actual?.texto}
      </p>
    </section>
  );
}
