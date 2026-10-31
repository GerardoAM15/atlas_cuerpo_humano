import EscenaBase from '@/viewer/EscenaBase';

export default function Atlas() {
  return (
    <div className="relative flex min-h-[70vh] flex-1">
      <EscenaBase />
      <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
        <p className="font-semibold text-slate-100">Visor 3D</p>
        <p className="mt-1">
          Escena base de prueba. Los modelos del esqueleto llegan en la Fase 1 (pipeline) y el visor completo en la Fase 2.
        </p>
      </div>
    </div>
  );
}
