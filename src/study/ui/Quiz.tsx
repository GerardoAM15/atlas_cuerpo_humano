import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { POR_ID, cajaDe, sistemaTieneModelo, useFichas } from '@/data/catalogo';
import type { Caja } from '@/data/esquemas';
import { REGIONES } from '@/data/regiones';
import { SISTEMAS, SISTEMAS_POR_ID, type SistemaId } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';
import { unirCajas } from '@/viewer/escena';
import Visor from '@/viewer/Visor';
import { conceptos } from '../conceptos';
import { NOMBRE_TIPO, generarQuiz, tiposDisponibles, type Dificultad, type Pregunta, type TipoPregunta } from '../generador';
import { pendientes, useProgresoStore } from '../progreso';
import { CALIDAD_ESCRITA, evaluarEscrita, type ResultadoEscrito } from '../respuestas';
import { fechaLocal } from '../sm2';

const ES_3D = (t: TipoPregunta) => t === 'encontrar' || t === 'que-es';

interface Formulario {
  sistemas: SistemaId[];
  region: string;
  tipos: TipoPregunta[];
  dificultad: Dificultad;
  numero: number;
  segundos: number;
  priorizar: boolean;
}

interface Respuesta {
  pregunta: Pregunta;
  correcta: boolean;
  calidad: number;
  elegida?: string;
  nota?: string;
}

/** Caja que encuadra la región de una estructura (para las preguntas de «encontrar»). */
function cajaRegion(id: string): Caja | null {
  const e = POR_ID.get(id);
  if (!e) return null;
  const cajas = [...POR_ID.values()]
    .filter((x) => x.sistema === e.sistema && x.region === e.region)
    .map((x) => cajaDe(x.id))
    .filter((c): c is Caja => c !== null);
  return unirCajas(cajas);
}

// ---------------------------------------------------------------- Configuración
function Configuracion({ inicial, onEmpezar }: { inicial: Formulario; onEmpezar: (f: Formulario) => void }) {
  const [f, setF] = useState(inicial);
  // Las preguntas de texto leen las fichas completas: se cargan al elegir los sistemas.
  const fichasListas = useFichas(f.sistemas);
  const disponibles = useMemo(
    () => (fichasListas ? tiposDisponibles({ sistemas: f.sistemas, region: f.region || null }) : []),
    [f.sistemas, f.region, fichasListas],
  );
  const tipos = f.tipos.filter((t) => disponibles.includes(t));
  const regiones = f.sistemas.length === 1 ? (REGIONES[f.sistemas[0]!] ?? []) : [];
  const alternar = <T,>(lista: T[], x: T) => (lista.includes(x) ? lista.filter((y) => y !== x) : [...lista, x]);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onEmpezar({ ...f, tipos });
      }}
    >
      <fieldset>
        <legend className="text-sm font-semibold text-tinta-300">Sistemas</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SISTEMAS.map((s) => (
            <label key={s.id} className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${f.sistemas.includes(s.id) ? 'border-oro-400 bg-oro-500/15 text-oro-100' : 'border-tinta-700 text-tinta-400'}`}>
              <input type="checkbox" className="sr-only" checked={f.sistemas.includes(s.id)} onChange={() => setF({ ...f, sistemas: alternar(f.sistemas, s.id), region: '' })} />
              {s.nombre}
            </label>
          ))}
        </div>
      </fieldset>

      {regiones.length > 0 && (
        <label className="block text-sm text-tinta-300">
          Región
          <select
            value={f.region}
            onChange={(e) => setF({ ...f, region: e.target.value })}
            className="mt-1 block w-full max-w-sm rounded border border-tinta-700 bg-tinta-900 px-2 py-1.5 text-tinta-100"
          >
            <option value="">Todas</option>
            {regiones.map((r) => (
              <option key={r.id} value={`${f.sistemas[0]}/${r.id}`}>
                {r.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset>
        <legend className="text-sm font-semibold text-tinta-300">Tipos de pregunta</legend>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {(Object.keys(NOMBRE_TIPO) as TipoPregunta[]).map((t) => (
            <label key={t} className={`flex items-center gap-2 text-sm ${disponibles.includes(t) ? 'text-tinta-300' : 'text-tinta-600'}`}>
              <input type="checkbox" className="accent-oro-500" disabled={!disponibles.includes(t)} checked={tipos.includes(t)} onChange={() => setF({ ...f, tipos: alternar(f.tipos, t) })} />
              {NOMBRE_TIPO[t]}
              {fichasListas && !disponibles.includes(t) && <span className="text-[11px]">(no aplica a esta selección)</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm text-tinta-300">
          Dificultad
          <select value={f.dificultad} onChange={(e) => setF({ ...f, dificultad: e.target.value as Dificultad })} className="mt-1 block w-full rounded border border-tinta-700 bg-tinta-900 px-2 py-1.5 text-tinta-100">
            <option value="facil">Fácil: opciones de otras regiones</option>
            <option value="media">Media</option>
            <option value="dificil">Difícil: opciones parecidas y del otro lado</option>
          </select>
        </label>
        <label className="block text-sm text-tinta-300">
          Preguntas
          <select value={f.numero} onChange={(e) => setF({ ...f, numero: Number(e.target.value) })} className="mt-1 block w-full rounded border border-tinta-700 bg-tinta-900 px-2 py-1.5 text-tinta-100">
            {[5, 10, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-tinta-300">
          Temporizador
          <select value={f.segundos} onChange={(e) => setF({ ...f, segundos: Number(e.target.value) })} className="mt-1 block w-full rounded border border-tinta-700 bg-tinta-900 px-2 py-1.5 text-tinta-100">
            <option value={0}>Sin límite</option>
            <option value={15}>15 s por pregunta</option>
            <option value={30}>30 s por pregunta</option>
            <option value={60}>60 s por pregunta</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-tinta-300">
        <input type="checkbox" className="accent-oro-500" checked={f.priorizar} onChange={(e) => setF({ ...f, priorizar: e.target.checked })} />
        Preguntar primero por las estructuras pendientes de repaso
      </label>

      <button
        type="submit"
        disabled={!fichasListas || f.sistemas.length === 0 || tipos.length === 0}
        className="rounded-lg bg-oro-500 px-5 py-2.5 font-semibold text-tinta-950 hover:bg-oro-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {fichasListas ? 'Empezar' : 'Cargando fichas…'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- Sesión
function Sesion({ preguntas, form, onFin }: { preguntas: Pregunta[]; form: Formulario; onFin: (r: Respuesta[]) => void }) {
  const registrar = useProgresoStore((s) => s.registrar);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [escrito, setEscrito] = useState('');
  const [restante, setRestante] = useState(form.segundos);
  const p = preguntas[indice]!;
  const respondida = respuestas.length > indice;
  const actual = respuestas[indice];
  const hay3d = preguntas.some((x) => ES_3D(x.tipo));
  const inicioRef = useRef(Date.now());
  const estadoRef = useRef({ p, respondida });
  estadoRef.current = { p, respondida };

  // Preparar el visor: modo quiz, solo los sistemas del alcance y sin cortes ni explosión. Se restaura al salir.
  useEffect(() => {
    const s = useAtlasStore.getState();
    const previos = s.sistemasVisibles;
    s.setModoQuiz(true);
    s.mostrarTodas();
    s.setCorte({ activo: false });
    s.setExplosion({ factor: 0 });
    s.setSistemasVisibles(Object.fromEntries(SISTEMAS.map((x) => [x.id, form.sistemas.includes(x.id) && sistemaTieneModelo(x.id)])));
    return () => {
      const t = useAtlasStore.getState();
      t.setModoQuiz(false);
      t.seleccionar(null);
      t.setSistemasVisibles(previos);
    };
  }, [form.sistemas]);

  // Lee la pregunta actual de la referencia: también se llama desde la suscripción al store,
  // que se registra una sola vez.
  const responder = (r: Omit<Respuesta, 'pregunta'>) => {
    const { p: q, respondida: yaRespondida } = estadoRef.current;
    if (yaRespondida) return;
    estadoRef.current = { p: q, respondida: true };
    registrar(q.concepto, r.calidad, fechaLocal());
    setRespuestas((xs) => [...xs, { pregunta: q, ...r }]);
    // Tras responder se muestra la estructura correcta en el modelo.
    if (POR_ID.get(q.objetivo)?.nodoModelo) useAtlasStore.getState().seleccionar(q.objetivo, { enfocar: true });
  };

  /** Calidad SM-2 de un acierto: 5 si fue rápido (o sin temporizador), 4 si se apuró el tiempo. */
  const calidadAcierto = () => {
    if (!form.segundos) return 5;
    return (Date.now() - inicioRef.current) / 1000 < form.segundos / 2 ? 5 : 4;
  };

  // Preparar cada pregunta.
  useEffect(() => {
    inicioRef.current = Date.now();
    setEscrito('');
    setRestante(form.segundos);
    const s = useAtlasStore.getState();
    if (p.tipo === 'que-es') {
      s.seleccionar(p.objetivo, { enfocar: true });
    } else if (p.tipo === 'encontrar') {
      s.seleccionar(null);
      const caja = cajaRegion(p.objetivo);
      if (form.dificultad === 'dificil' || !caja) s.reiniciarCamara();
      else s.encuadrar(caja);
    } else {
      s.seleccionar(null);
    }
  }, [p, form.segundos, form.dificultad]);

  // «Encontrar»: la respuesta es el clic en el modelo (la selección del visor).
  useEffect(
    () =>
      useAtlasStore.subscribe((s, prev) => {
        const { p: actualP, respondida: yaRespondida } = estadoRef.current;
        if (actualP.tipo !== 'encontrar' || yaRespondida || !s.seleccion || s.seleccion === prev.seleccion) return;
        const ok = s.seleccion === actualP.objetivo;
        const otroLado = !ok && POR_ID.get(s.seleccion)?.lado && s.seleccion.replace(/-(d|i)$/, '') === actualP.objetivo.replace(/-(d|i)$/, '');
        responder({
          correcta: ok,
          calidad: ok ? calidadAcierto() : otroLado ? 2 : 1,
          elegida: s.seleccion,
          nota: ok ? undefined : otroLado ? 'Es la misma estructura, pero del otro lado.' : `Has seleccionado: ${POR_ID.get(s.seleccion)?.nombre ?? s.seleccion}`,
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Temporizador.
  useEffect(() => {
    if (!form.segundos || respondida) return;
    const id = setInterval(() => {
      const r = form.segundos - (Date.now() - inicioRef.current) / 1000;
      setRestante(Math.max(0, r));
      if (r <= 0) responder({ correcta: false, calidad: 0, nota: 'Se acabó el tiempo.' });
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, respondida, form.segundos]);

  const siguiente = () => (indice + 1 < preguntas.length ? setIndice(indice + 1) : onFin(respuestas));

  // Teclado: 1–4 eligen opción; Intro pasa a la siguiente.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      if (respondida && e.key === 'Enter') siguiente();
      const n = Number(e.key);
      if (!respondida && n >= 1 && n <= p.opciones.length) elegir(p.opciones[n - 1]!.id);
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  });

  const elegir = (id: string) => responder({ correcta: id === p.correcta, calidad: id === p.correcta ? calidadAcierto() : 1, elegida: id });

  const enviarEscrito = () => {
    const e = POR_ID.get(p.objetivo)!;
    const r: ResultadoEscrito = evaluarEscrita(escrito, e);
    const notas: Record<ResultadoEscrito, string | undefined> = {
      correcta: undefined,
      casi: 'Correcto, con una pequeña errata.',
      'falta-lado': `Correcto, pero falta el lado: es ${e.lado}.`,
      incorrecta: `Has escrito: «${escrito}».`,
    };
    responder({ correcta: r !== 'incorrecta', calidad: r === 'correcta' ? calidadAcierto() : CALIDAD_ESCRITA[r], nota: notas[r] });
  };

  const textoCorrecto = p.opciones.find((o) => o.id === p.correcta)?.texto ?? POR_ID.get(p.objetivo)?.nombre;
  const aciertos = respuestas.filter((r) => r.correcta).length;

  const panel = (
    <section aria-live="polite" className="rounded-xl border border-tinta-800 bg-tinta-900/70 p-4">
      <div className="flex items-center justify-between text-xs text-tinta-400">
        <span>
          Pregunta {indice + 1} de {preguntas.length} · {NOMBRE_TIPO[p.tipo]}
        </span>
        <span className="tabular-nums">Aciertos: {aciertos}</span>
      </div>
      {form.segundos > 0 && !respondida && (
        <div className="mt-2 h-1.5 overflow-hidden rounded bg-tinta-800" role="timer" aria-label={`${Math.ceil(restante)} segundos`}>
          <div className={`h-full ${restante < 5 ? 'bg-red-400' : 'bg-oro-400'}`} style={{ width: `${(restante / form.segundos) * 100}%` }} />
        </div>
      )}
      <h2 className="mt-3 text-lg font-semibold text-tinta-50">{p.enunciado}</h2>
      {p.detalle && <p className="mt-1 whitespace-pre-line text-sm text-tinta-300">{p.detalle}</p>}
      {p.tipo === 'encontrar' && !respondida && <p className="mt-2 text-xs text-tinta-400">Gira y acerca el modelo y haz clic en la estructura.</p>}

      {p.opciones.length > 0 && (
        <ol className="mt-4 space-y-2">
          {p.opciones.map((o, i) => {
            const esCorrecta = o.id === p.correcta;
            const elegida = actual?.elegida === o.id;
            const estilo = !respondida
              ? 'border-tinta-700 hover:border-oro-400 hover:bg-tinta-800'
              : esCorrecta
                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                : elegida
                  ? 'border-red-400 bg-red-500/15 text-red-100'
                  : 'border-tinta-800 opacity-60';
            return (
              <li key={o.id}>
                <button type="button" disabled={respondida} onClick={() => elegir(o.id)} className={`flex w-full gap-2 rounded-lg border px-3 py-2 text-left text-sm ${estilo}`}>
                  <span className="font-bold text-tinta-400">{i + 1}</span>
                  {o.texto}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {p.tipo === 'que-es' && !respondida && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (escrito.trim()) enviarEscrito();
          }}
        >
          <label className="sr-only" htmlFor="respuesta-escrita">
            O escribe el nombre
          </label>
          <input
            id="respuesta-escrita"
            value={escrito}
            onChange={(e) => setEscrito(e.target.value)}
            placeholder="…o escribe el nombre (español, latín o inglés)"
            className="min-w-0 flex-1 rounded border border-tinta-700 bg-tinta-950 px-2 py-1.5 text-sm text-tinta-100"
          />
          <button type="submit" className="rounded border border-tinta-600 px-3 text-sm text-tinta-200 hover:bg-tinta-800">
            Responder
          </button>
        </form>
      )}

      {respondida && actual && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${actual.correcta ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/10 text-red-200'}`}>
          <p className="font-semibold">{actual.correcta ? '¡Correcto!' : 'Incorrecto'}</p>
          {actual.nota && <p className="mt-1">{actual.nota}</p>}
          {!actual.correcta && <p className="mt-1 text-tinta-200">Respuesta: {textoCorrecto}</p>}
          <button type="button" onClick={siguiente} className="mt-3 rounded-md bg-oro-500 px-4 py-1.5 font-semibold text-tinta-950 hover:bg-oro-400" autoFocus>
            {indice + 1 < preguntas.length ? 'Siguiente (Intro)' : 'Ver resultados'}
          </button>
        </div>
      )}
    </section>
  );

  if (!hay3d) return <div className="mx-auto max-w-2xl">{panel}</div>;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="relative h-[60vh] min-h-80 overflow-hidden rounded-xl border border-tinta-800 lg:h-[70vh]">
        <Visor />
        <button type="button" onClick={() => useAtlasStore.getState().reiniciarCamara()} className="absolute right-2 top-2 rounded-md bg-tinta-800/90 px-2 py-1 text-xs text-tinta-200">
          ⟲ Cámara
        </button>
      </div>
      <div>{panel}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Resumen
function Resumen({ respuestas, onOtra, onConfigurar }: { respuestas: Respuesta[]; onOtra: () => void; onConfigurar: () => void }) {
  const aciertos = respuestas.filter((r) => r.correcta).length;
  const fallos = respuestas.filter((r) => !r.correcta);
  const pct = respuestas.length ? Math.round((aciertos / respuestas.length) * 100) : 0;
  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-tinta-800 bg-tinta-900/70 p-6">
      <h2 className="text-2xl font-bold">Resultado: {pct} %</h2>
      <p className="mt-1 text-tinta-400">
        {aciertos} de {respuestas.length} aciertos. Las estructuras falladas volverán antes en tus repasos.
      </p>
      {fallos.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-semibold text-tinta-300">Para repasar</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {fallos.map((r) => (
              <li key={r.pregunta.n} className="flex justify-between gap-3 border-t border-tinta-800 pt-1">
                <span className="text-tinta-200">{conceptos().get(r.pregunta.concepto)?.nombre ?? r.pregunta.concepto}</span>
                <span className="text-xs text-tinta-400">{NOMBRE_TIPO[r.pregunta.tipo]}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onOtra} className="rounded-lg bg-oro-500 px-4 py-2 font-semibold text-tinta-950 hover:bg-oro-400">
          Otra ronda
        </button>
        <button type="button" onClick={onConfigurar} className="rounded-lg border border-tinta-700 px-4 py-2 text-tinta-200 hover:bg-tinta-800">
          Cambiar configuración
        </button>
        <Link to="/estudio" className="rounded-lg px-4 py-2 text-tinta-400 hover:text-tinta-200">
          Volver al modo estudio
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Página
export default function Quiz() {
  const [params] = useSearchParams();
  const tarjetas = useProgresoStore((s) => s.tarjetas);
  const [form, setForm] = useState<Formulario>(() => {
    const pend = pendientes(useProgresoStore.getState().tarjetas, fechaLocal());
    const sistemasPend = [...new Set(pend.map((id) => conceptos().get(id)?.sistema).filter((s): s is SistemaId => !!s))];
    const repaso = params.get('repaso') === '1' && pend.length > 0;
    return {
      sistemas: repaso ? sistemasPend : ['esqueletico'],
      region: '',
      tipos: ['encontrar', 'que-es', 'funcion', 'origen-insercion', 'inervacion'],
      dificultad: 'media',
      numero: repaso ? Math.min(30, Math.max(5, pend.length)) : 10,
      segundos: 0,
      priorizar: true,
    };
  });
  const [preguntas, setPreguntas] = useState<Pregunta[] | null>(null);
  const [resultado, setResultado] = useState<Respuesta[] | null>(null);
  const [ronda, setRonda] = useState(0);

  const empezar = (f: Formulario) => {
    setForm(f);
    setResultado(null);
    setRonda((r) => r + 1);
    setPreguntas(
      generarQuiz({
        alcance: { sistemas: f.sistemas, region: f.region || null },
        tipos: f.tipos,
        dificultad: f.dificultad,
        numero: f.numero,
        semilla: (Date.now() % 1_000_000_007) + ronda,
        prioridad: f.priorizar ? pendientes(tarjetas, fechaLocal()) : [],
        vistos: new Set(Object.keys(tarjetas)),
      }),
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <nav aria-label="Ruta" className="text-xs text-tinta-400">
        <Link to="/estudio" className="hover:text-tinta-300">
          Modo estudio
        </Link>{' '}
        › Quiz
      </nav>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Quiz</h1>
      <p className="mb-5 text-sm text-tinta-400">{form.sistemas.map((s) => SISTEMAS_POR_ID[s].nombre).join(', ')}</p>

      {resultado ? (
        <Resumen respuestas={resultado} onOtra={() => empezar(form)} onConfigurar={() => (setResultado(null), setPreguntas(null))} />
      ) : preguntas ? (
        preguntas.length === 0 ? (
          <p className="text-tinta-400">
            No hay preguntas posibles con esta configuración.{' '}
            <button type="button" className="underline" onClick={() => setPreguntas(null)}>
              Cambiarla
            </button>
          </p>
        ) : (
          <Sesion key={ronda} preguntas={preguntas} form={form} onFin={setResultado} />
        )
      ) : (
        <div className="max-w-3xl rounded-xl border border-tinta-800 bg-tinta-900/50 p-5">
          <Configuracion inicial={form} onEmpezar={empezar} />
        </div>
      )}
    </div>
  );
}
