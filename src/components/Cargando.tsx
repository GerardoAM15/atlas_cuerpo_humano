export default function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-1 items-center justify-center gap-3 p-8 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
      {texto}
    </div>
  );
}
