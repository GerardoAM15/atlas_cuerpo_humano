export default function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-1 items-center justify-center gap-3 p-8 text-tinta-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-tinta-600 border-t-oro-400" />
      {texto}
    </div>
  );
}
