import { useProgress } from '@react-three/drei';

/** Barra de progreso de la carga de modelos (gestor de carga global de three.js). */
export default function BarraCarga() {
  const { active, progress } = useProgress();
  if (!active) return null;
  const pct = Math.round(progress);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-64 -translate-y-1/2 text-center" role="status" aria-live="polite">
      <p className="mb-2 text-sm text-tinta-300">Cargando modelo 3D… {pct} %</p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-tinta-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="h-full bg-oro-400 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
