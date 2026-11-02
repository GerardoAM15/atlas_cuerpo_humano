import { nombreRegion } from '@/data/regiones';
import { useAtlasStore } from '@/store/useAtlasStore';
import { pinesDeRegion } from '../escena';

/** Leyenda numerada de los pines de la región activa. */
export default function LeyendaPines() {
  const etiquetas = useAtlasStore((s) => s.etiquetas);
  const region = useAtlasStore((s) => s.regionActiva);
  const seleccion = useAtlasStore((s) => s.seleccion);
  const seleccionar = useAtlasStore((s) => s.seleccionar);
  if (!etiquetas) return null;

  const pines = pinesDeRegion(region, seleccion);
  return (
    <div className="max-h-64 w-60 overflow-auto rounded-lg border border-tinta-800 bg-tinta-950/85 p-2 text-xs backdrop-blur">
      {pines.length === 0 ? (
        <p className="text-tinta-400">Elige una región en el árbol o selecciona una estructura para ver sus etiquetas.</p>
      ) : (
        <>
          <p className="mb-1 font-semibold text-tinta-300">{nombreRegion(pines[0]!.sistema, pines[0]!.region)}</p>
          <ol className="space-y-0.5">
            {pines.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => seleccionar(e.id, { enfocar: true })}
                  className={`w-full truncate rounded px-1 text-left hover:bg-tinta-800 ${e.id === seleccion ? 'text-oro-300' : 'text-tinta-400'}`}
                >
                  <span className="mr-1 inline-block w-5 text-right font-bold text-amber-300">{i + 1}</span>
                  {e.nombre}
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
