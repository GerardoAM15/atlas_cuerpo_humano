import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  fase: number;
  children?: ReactNode;
}

/** Marcador para secciones que se implementan en fases posteriores. */
export default function PaginaEnConstruccion({ titulo, fase, children }: Props) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
      <p className="mt-2 inline-block rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
        En construcción · Fase {fase}
      </p>
      <div className="mt-6 space-y-4 text-slate-300">{children}</div>
    </section>
  );
}
