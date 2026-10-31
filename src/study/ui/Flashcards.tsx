import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { nombreRegion } from '@/data/regiones';
import { SISTEMAS, SISTEMAS_POR_ID, type SistemaId } from '@/data/sistemas';
import type { Estructura } from '@/data/esquemas';
import { conceptosEn, type Concepto } from '../conceptos';
import { crearAzar } from '../generador';
import { useProgresoStore } from '../progreso';
import { fechaLocal, repasar, tarjetaNueva } from '../sm2';
import Vista3DEstructura from './Vista3DEstructura';

const NUEVAS_POR_SESION = 15;

const VALORACIONES = [
  { calidad: 1, texto: 'Otra vez', clase: 'border-red-400/60 text-red-200 hover:bg-red-500/15' },
  { calidad: 3, texto: 'Difícil', clase: 'border-amber-400/60 text-amber-200 hover:bg-amber-500/15' },
  { calidad: 4, texto: 'Bien', clase: 'border-sky-400/60 text-sky-200 hover:bg-sky-500/15' },
  { calidad: 5, texto: 'Fácil', clase: 'border-emerald-400/60 text-emerald-200 hover:bg-emerald-500/15' },
] as const;

const plazo = (dias: number) => (dias <= 1 ? 'mañana' : `${dias} días`);

/** Mazo: primero los repasos pendientes, luego conceptos nuevos (solo los que tienen modelo 3D). */
function crearMazo(sistemas: SistemaId[], tarjetas: ReturnType<typeof useProgresoStore.getState>['tarjetas'], semilla: number): Concepto[] {
  const azar = crearAzar(semilla);
  const hoy = fechaLocal();
  const conModelo = conceptosEn({ sistemas }).filter((c) => c.tieneModelo);
  const pendientesHoy = conModelo.filter((c) => tarjetas[c.id] && tarjetas[c.id]!.proxima <= hoy);
  const nuevas = azar.barajar(conModelo.filter((c) => !tarjetas[c.id])).slice(0, NUEVAS_POR_SESION);
  return [...azar.barajar(pendientesHoy), ...nuevas];
}

function Reverso({ e, c }: { e: Estructura; c: Concepto }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-2xl font-bold text-slate-50">{c.nombre}</p>
      <p className="text-slate-400">
        <i lang="la">{e.latin}</i> · <span lang="en">{e.ingles.replace(/^(Right|Left) /, '')}</span>
      </p>
      <p className="text-xs text-slate-500">
        {SISTEMAS_POR_ID[e.sistema].nombre} › {nombreRegion(e.sistema, e.region)}
      </p>
      <p className="text-slate-300">
        <strong className="text-slate-100">Función:</strong> {e.funcion}
      </p>
      {e.tipo === 'musculo' && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-slate-300">
          <dt className="text-slate-500">Origen</dt>
          <dd>{e.origen}</dd>
          <dt className="text-slate-500">Inserción</dt>
          <dd>{e.insercion}</dd>
          <dt className="text-slate-500">Inervación</dt>
          <dd>{e.inervacion}</dd>
          <dt className="text-slate-500">Acción</dt>
          <dd>{e.accion}</dd>
        </dl>
      )}
    </div>
  );
}

export default function Flashcards() {
  const tarjetas = useProgresoStore((s) => s.tarjetas);
  const registrar = useProgresoStore((s) => s.registrar);
  const [sistemas, setSistemas] = useState<SistemaId[]>(['esqueletico']);
  const [semilla, setSemilla] = useState(() => Date.now() % 1_000_000);
  // El mazo se fija al empezar (no se recalcula con cada valoración).
  const mazo = useMemo(() => crearMazo(sistemas, useProgresoStore.getState().tarjetas, semilla), [sistemas, semilla]);
  const [indice, setIndice] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const hoy = fechaLocal();
  const c = mazo[indice];
  const e = c ? (c.lados.find((x) => x.nodoModelo) ?? c.e) : undefined;

  const valorar = (calidad: number) => {
    if (!c) return;
    registrar(c.id, calidad, hoy);
    setVolteada(false);
    setIndice((i) => i + 1);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <nav aria-label="Ruta" className="text-xs text-slate-500">
        <Link to="/estudio" className="hover:text-slate-300">
          Modo estudio
        </Link>{' '}
        › Flashcards
      </nav>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Flashcards</h1>

      <fieldset className="mt-3">
        <legend className="sr-only">Sistemas</legend>
        <div className="flex flex-wrap gap-2">
          {SISTEMAS.map((s) => (
            <label key={s.id} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${sistemas.includes(s.id) ? 'border-sky-400 bg-sky-500/15 text-sky-100' : 'border-slate-700 text-slate-400'}`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={sistemas.includes(s.id)}
                onChange={() => {
                  setSistemas((xs) => (xs.includes(s.id) ? xs.filter((x) => x !== s.id) : [...xs, s.id]));
                  setIndice(0);
                  setVolteada(false);
                }}
              />
              {s.nombre}
            </label>
          ))}
        </div>
      </fieldset>

      {!c || !e ? (
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center">
          <p className="text-lg font-semibold">{mazo.length ? '¡Mazo terminado!' : 'No hay tarjetas para hoy en esta selección.'}</p>
          <p className="mt-1 text-sm text-slate-400">Las tarjetas volverán cuando les toque repaso.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSemilla((s) => s + 1);
                setIndice(0);
              }}
              className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400"
            >
              Nuevo mazo
            </button>
            <Link to="/estudio" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800">
              Volver
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4" aria-live="polite">
          <p className="mb-2 flex justify-between text-xs text-slate-500">
            <span>
              Tarjeta {indice + 1} de {mazo.length}
              {tarjetas[c.id] ? ' · repaso' : ' · nueva'}
            </span>
            <span>
              {SISTEMAS_POR_ID[e.sistema].nombre}
              {e.lado ? ` · lado ${e.lado}` : ''}
            </span>
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Vista3DEstructura e={e} />
            <div className="flex flex-col justify-center">
              {volteada ? (
                <Reverso e={e} c={c} />
              ) : (
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-200">¿Qué estructura es?</p>
                  <p className="mt-1 text-sm text-slate-500">Gírala con el ratón. Piensa la respuesta y dale la vuelta.</p>
                  <button type="button" onClick={() => setVolteada(true)} className="mt-4 rounded-lg bg-sky-500 px-5 py-2 font-semibold text-slate-950 hover:bg-sky-400" autoFocus>
                    Mostrar respuesta
                  </button>
                </div>
              )}
            </div>
          </div>
          {volteada && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="¿Qué tal la recordabas?">
              {VALORACIONES.map((v) => {
                const siguiente = repasar(tarjetas[c.id] ?? tarjetaNueva(hoy), v.calidad, hoy);
                return (
                  <button key={v.calidad} type="button" onClick={() => valorar(v.calidad)} className={`rounded-lg border px-3 py-2 text-sm ${v.clase}`}>
                    <span className="block font-semibold">{v.texto}</span>
                    <span className="block text-[11px] opacity-75">vuelve {plazo(siguiente.intervalo)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
