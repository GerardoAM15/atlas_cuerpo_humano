import { Link } from 'react-router-dom';
import { SISTEMAS } from '@/data/sistemas';

const SECCIONES = [
  {
    ruta: '/atlas',
    titulo: 'Atlas 3D',
    texto: 'Explora el cuerpo por sistemas, haz clic en cualquier estructura y consulta su ficha en español, latín e inglés.',
  },
  {
    ruta: '/simulaciones',
    titulo: 'Simulaciones',
    texto: 'Ciclo cardíaco, respiración, impulso nervioso, contracción muscular, digestión y filtración renal, paso a paso.',
  },
  {
    ruta: '/estudio',
    titulo: 'Modo estudio',
    texto: 'Quizzes sobre el modelo 3D, flashcards y repetición espaciada (SM-2) con tu progreso por sistema.',
  },
] as const;

export default function Inicio() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <section className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Atlas 3D interactivo <span className="text-sky-400">del cuerpo humano</span>
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Una herramienta de estudio de anatomía y fisiología construida sobre modelos anatómicos reales de licencia
          libre. Cada estructura incluye su nombre según la <em>Terminologia Anatomica</em> y en inglés.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/atlas"
            className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            Abrir el atlas
          </Link>
          <Link
            to="/estudio"
            className="rounded-lg border border-slate-700 px-5 py-2.5 font-semibold text-slate-200 hover:bg-slate-800"
          >
            Empezar a estudiar
          </Link>
        </div>
      </section>

      <section aria-labelledby="secciones" className="mt-12">
        <h2 id="secciones" className="sr-only">
          Secciones
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {SECCIONES.map((s) => (
            <li key={s.ruta}>
              <Link
                to={s.ruta}
                className="block h-full rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-sky-500/50 hover:bg-slate-900"
              >
                <h3 className="text-lg font-semibold">{s.titulo}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.texto}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sistemas" className="mt-12">
        <h2 id="sistemas" className="text-2xl font-semibold tracking-tight">
          Sistemas
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SISTEMAS.map((s) => (
            <li key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <h3 className="font-semibold">{s.nombre}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                  Fase {s.fase}
                </span>
              </div>
              <p className="mt-1 text-xs italic text-slate-500">
                {s.latin} · {s.ingles}
              </p>
              <p className="mt-2 text-sm text-slate-400">{s.descripcion}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
