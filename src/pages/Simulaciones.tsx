import { Link } from 'react-router-dom';
import { SIMULACIONES } from '@/simulations/catalogo';

export default function Simulaciones() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Simulaciones fisiológicas</h1>
      <p className="mt-2 max-w-3xl text-slate-400">
        Animaciones con Play/Pausa, control de velocidad y explicación paso a paso. Son representaciones esquemáticas: simplifican la
        anatomía para mostrar con claridad cómo funciona cada proceso.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SIMULACIONES.map((s, i) => (
          <li key={s.id}>
            <Link
              to={`/simulaciones/${s.id}`}
              className="block h-full rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-sky-500/50 hover:bg-slate-900"
            >
              <p className="text-xs font-semibold text-slate-500">{i + 1}</p>
              <h2 className="text-lg font-semibold text-slate-100">{s.titulo}</h2>
              <p className="mt-2 text-sm text-slate-400">{s.resumen}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
