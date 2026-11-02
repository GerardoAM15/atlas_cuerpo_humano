import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  titulo: string;
  resumen: string;
  /** Si la representación es esquemática (no usa el modelo anatómico real), se rotula así. */
  esquematico?: boolean;
  controles: ReactNode;
  visual: ReactNode;
  lateral: ReactNode;
  pie?: ReactNode;
}

/** Disposición común de las simulaciones: cabecera, visual principal, panel lateral y gráficas. */
export default function MarcoSimulacion({ titulo, resumen, esquematico = true, controles, visual, lateral, pie }: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <nav aria-label="Ruta" className="text-xs text-tinta-400">
        <Link to="/simulaciones" className="hover:text-tinta-300">
          Simulaciones
        </Link>{' '}
        › {titulo}
      </nav>
      <header className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {esquematico && (
          <span
            className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300"
            title="Representación simplificada: no usa el modelo anatómico real"
          >
            Esquemático
          </span>
        )}
      </header>
      <p className="mt-1 max-w-3xl text-sm text-tinta-400">{resumen}</p>
      <div className="mt-3">{controles}</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">{visual}</div>
        <aside className="space-y-4">{lateral}</aside>
      </div>
      {pie && <div className="mt-4 grid gap-4 md:grid-cols-2">{pie}</div>}
      <p className="mt-6 text-xs text-tinta-400">
        Valores típicos de un adulto sano en reposo, redondeados con fines didácticos (fuentes generales en docs/FUENTES.md).
      </p>
    </div>
  );
}
