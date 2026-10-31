import { Link } from 'react-router-dom';
import PanelProgreso from '@/study/ui/PanelProgreso';
import { pendientes, useProgresoStore } from '@/study/progreso';
import { fechaLocal } from '@/study/sm2';

const MODOS = [
  {
    ruta: '/estudio/quiz',
    titulo: 'Quiz',
    texto: 'Encuentra estructuras en el modelo 3D, identifica la resaltada, y preguntas de función, origen, inserción e inervación. Configurable por sistema, región y dificultad, con temporizador opcional.',
  },
  {
    ruta: '/estudio/flashcards',
    titulo: 'Flashcards',
    texto: 'Tarjetas con la estructura en 3D por delante y su ficha por detrás. Tú valoras lo bien que la recordabas y la repetición espaciada decide cuándo volver a verla.',
  },
] as const;

export default function Estudio() {
  const tarjetas = useProgresoStore((s) => s.tarjetas);
  const reiniciar = useProgresoStore((s) => s.reiniciarProgreso);
  const n = pendientes(tarjetas, fechaLocal()).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Modo estudio</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Practica con el atlas. Las estructuras que falles vuelven antes gracias a la repetición espaciada (algoritmo SM-2). Tu progreso
          se guarda solo en este navegador.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {MODOS.map((m) => (
          <Link key={m.ruta} to={m.ruta} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-sky-500/50 hover:bg-slate-900">
            <h2 className="text-lg font-semibold">{m.titulo}</h2>
            <p className="mt-2 text-sm text-slate-400">{m.texto}</p>
          </Link>
        ))}
        <Link
          to="/estudio/quiz?repaso=1"
          aria-disabled={n === 0}
          className={`rounded-xl border p-5 transition-colors ${
            n > 0 ? 'border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/15' : 'pointer-events-none border-slate-800 bg-slate-900/30 opacity-60'
          }`}
        >
          <h2 className="text-lg font-semibold">Repaso de hoy</h2>
          <p className="mt-2 text-sm text-slate-300">
            {n > 0 ? `${n} ${n === 1 ? 'estructura pendiente' : 'estructuras pendientes'} de repaso.` : 'No tienes repasos pendientes hoy.'}
          </p>
        </Link>
      </div>

      <PanelProgreso />

      <footer className="text-right">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('¿Borrar todo tu progreso de estudio? No se puede deshacer.')) reiniciar();
          }}
          className="text-xs text-slate-500 underline hover:text-red-300"
        >
          Borrar el progreso
        </button>
      </footer>
    </div>
  );
}
