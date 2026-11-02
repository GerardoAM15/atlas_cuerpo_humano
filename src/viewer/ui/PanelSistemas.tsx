import { sistemaTieneModelo } from '@/data/catalogo';
import { SISTEMAS } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';

/** Activar/desactivar sistemas y ajustar su opacidad. */
export default function PanelSistemas() {
  const visibles = useAtlasStore((s) => s.sistemasVisibles);
  const opacidad = useAtlasStore((s) => s.opacidad);
  const alternar = useAtlasStore((s) => s.alternarSistema);
  const setOpacidad = useAtlasStore((s) => s.setOpacidad);

  return (
    <ul className="space-y-1">
      {SISTEMAS.map((s) => {
        const disponible = sistemaTieneModelo(s.id);
        const idCheck = `sistema-${s.id}`;
        return (
          <li key={s.id} className={`rounded-md px-2 py-1.5 ${disponible ? '' : 'opacity-50'}`}>
            <div className="flex items-center gap-2">
              <input
                id={idCheck}
                type="checkbox"
                checked={disponible && visibles[s.id]}
                disabled={!disponible}
                onChange={() => alternar(s.id)}
                className="h-4 w-4 accent-oro-500"
              />
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <label htmlFor={idCheck} className="flex-1 text-sm">
                {s.nombre}
              </label>
              {!disponible && <span className="text-[10px] text-tinta-400">sin modelo</span>}
            </div>
            {disponible && visibles[s.id] && (
              <label className="mt-1 flex items-center gap-2 pl-6 text-xs text-tinta-400">
                Opacidad
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={opacidad[s.id]}
                  onChange={(e) => setOpacidad(s.id, Number(e.target.value))}
                  className="flex-1 accent-oro-500"
                  aria-label={`Opacidad del sistema ${s.nombre}`}
                />
                <span className="w-8 text-right tabular-nums">{Math.round((opacidad[s.id] ?? 1) * 100)}%</span>
              </label>
            )}
          </li>
        );
      })}
    </ul>
  );
}
