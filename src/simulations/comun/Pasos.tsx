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
    <section aria-labelledby="pasos-titulo" className="rounded-lg border border-tinta-800 bg-tinta-900/50 p-3">
      <h2 id="pasos-titulo" className="text-xs font-semibold uppercase tracking-wide text-tinta-400">
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
                  esActivo ? 'bg-oro-500/15 text-oro-200' : 'text-tinta-400 enabled:hover:bg-tinta-800'
                }`}
              >
                <span className={`font-bold ${esActivo ? 'text-oro-300' : 'text-tinta-400'}`}>{i + 1}.</span>
                {p.titulo}
              </button>
            </li>
          );
        })}
      </ol>
      <p aria-live="polite" className="mt-3 min-h-16 rounded-md bg-tinta-950/60 p-2 text-sm leading-relaxed text-tinta-300">
        {actual?.texto}
      </p>
    </section>
  );
}
