import { useMemo, useState } from 'react';
import Controles from '../comun/Controles';
import GraficaLinea from '../comun/GraficaLinea';
import MarcoSimulacion from '../comun/MarcoSimulacion';
import Pasos, { type Paso } from '../comun/Pasos';
import { muestrear } from '../comun/matematicas';
import { crearTrayecto } from '../comun/trayecto';
import { useReloj } from '../comun/useReloj';
import { NOMBRE_FASE, estado, eventos, indices, tramos, type Estado, type FaseId } from './modelo';

const PASOS: Paso[] = [
  {
    id: 'sistole-auricular',
    titulo: NOMBRE_FASE['sistole-auricular'],
    texto:
      'Tras la onda P, las aurículas se contraen y completan el llenado ventricular (aportan aprox. un 20 % del volumen). Las válvulas mitral y tricúspide siguen abiertas; al final, el ventrículo alcanza su volumen telediastólico (≈ 120 ml).',
  },
  {
    id: 'contraccion-isovolumetrica',
    titulo: NOMBRE_FASE['contraccion-isovolumetrica'],
    texto:
      'Tras el QRS, el ventrículo empieza a contraerse. Su presión supera a la auricular y se cierran las válvulas AV (primer ruido, S1). Todas las válvulas están cerradas: la presión sube rápido sin que cambie el volumen.',
  },
  {
    id: 'eyeccion',
    titulo: NOMBRE_FASE.eyeccion,
    texto:
      'Cuando la presión del ventrículo izquierdo supera la aórtica (≈ 80 mmHg) se abre la válvula aórtica y la sangre sale a la aorta, primero rápido y luego más lento. La presión llega a ≈ 120 mmHg. La onda T marca la repolarización ventricular.',
  },
  {
    id: 'relajacion-isovolumetrica',
    titulo: NOMBRE_FASE['relajacion-isovolumetrica'],
    texto:
      'El ventrículo se relaja y su presión cae por debajo de la aórtica: se cierran las semilunares (segundo ruido, S2) y aparece la muesca dicrótica en la curva aórtica. De nuevo todas las válvulas están cerradas y el volumen es mínimo (≈ 50 ml).',
  },
  {
    id: 'llenado-rapido',
    titulo: NOMBRE_FASE['llenado-rapido'],
    texto:
      'La presión ventricular cae por debajo de la auricular, se abren las válvulas AV y la sangre acumulada en las aurículas entra rápidamente en los ventrículos.',
  },
  {
    id: 'diastasis',
    titulo: NOMBRE_FASE.diastasis,
    texto:
      'El llenado continúa lentamente con la sangre que llega de las venas. Es la fase que más se acorta al aumentar la frecuencia cardíaca, por eso la taquicardia muy rápida compromete el llenado.',
  },
];

const COLOR_FASE: Record<FaseId, string> = {
  'sistole-auricular': 'rgba(56,189,248,0.07)',
  'contraccion-isovolumetrica': 'rgba(248,113,113,0.12)',
  eyeccion: 'rgba(248,113,113,0.06)',
  'relajacion-isovolumetrica': 'rgba(250,204,21,0.08)',
  'llenado-rapido': 'rgba(74,222,128,0.07)',
  diastasis: 'rgba(148,163,184,0.04)',
};
const ABREV: Record<FaseId, string> = {
  'sistole-auricular': 'SA',
  'contraccion-isovolumetrica': 'CIV',
  eyeccion: 'Eyección',
  'relajacion-isovolumetrica': 'RIV',
  'llenado-rapido': 'Llenado',
  diastasis: 'Diástasis',
};

// Circuito de la sangre (coordenadas del SVG). Vista anterior: el corazón derecho queda a la izquierda.
const CIRCUITO = crearTrayecto([
  [120, 215], // ventrículo derecho
  [170, 185], // tronco pulmonar
  [170, 70],
  [200, 40], // pulmones
  [230, 70], // venas pulmonares
  [280, 120], // aurícula izquierda
  [280, 215], // ventrículo izquierdo
  [340, 250], // aorta
  [340, 300],
  [250, 330], // cuerpo
  [150, 330],
  [50, 300], // venas cavas (por fuera del corazón)
  [50, 120],
  [120, 120], // aurícula derecha
  [120, 215],
]);
const F_PULMONES = CIRCUITO.fraccionDeVertice(3);
const F_CUERPO = CIRCUITO.fraccionDeVertice(9);

function Corazon({ e, tGlobal }: { e: Estado; tGlobal: number }) {
  const escalaV = 0.72 + 0.28 * (e.volumenVI / 120);
  // Llenado auricular aproximado: se vacían en la sístole auricular y se llenan durante la sístole ventricular.
  const llenadoA = {
    'sistole-auricular': 1 - e.progreso,
    'contraccion-isovolumetrica': 0.1,
    eyeccion: 0.1 + 0.9 * e.progreso,
    'relajacion-isovolumetrica': 1,
    'llenado-rapido': 1 - 0.5 * e.progreso,
    diastasis: 0.5 + 0.5 * e.progreso,
  }[e.fase];
  const escalaA = 0.78 + 0.22 * llenadoA;
  const particulas = Array.from({ length: 36 }, (_, i) => {
    const f = (i / 36 + tGlobal * 0.12) % 1;
    const oxigenada = f > F_PULMONES && f < F_CUERPO;
    return { f, oxigenada, p: CIRCUITO.en(f) };
  });

  const camara = (cx: number, cy: number, w: number, h: number, escala: number, color: string, etiqueta: string) => (
    <g transform={`translate(${cx} ${cy}) scale(${escala}) translate(${-cx} ${-cy})`}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={18} fill={color} stroke="#0f172a" strokeWidth={2} />
      <text x={cx} y={cy + 4} textAnchor="middle" className="fill-slate-950 text-[12px] font-bold">
        {etiqueta}
      </text>
    </g>
  );
  const valvula = (x: number, y: number, abierta: boolean, horizontal = true) => {
    const s = abierta ? 14 : 2;
    return horizontal ? (
      <g stroke="#fde68a" strokeWidth={4} strokeLinecap="round">
        <line x1={x - 22} y1={y} x2={x - s} y2={y + (abierta ? 10 : 0)} />
        <line x1={x + 22} y1={y} x2={x + s} y2={y + (abierta ? 10 : 0)} />
      </g>
    ) : null;
  };

  return (
    <svg viewBox="0 0 400 375" className="mx-auto h-auto w-full max-w-md" role="img" aria-label={`Corazón esquemático en fase de ${NOMBRE_FASE[e.fase]}`}>
      <path d={CIRCUITO.d} fill="none" stroke="#334155" strokeWidth={10} strokeLinejoin="round" />
      <rect x={160} y={10} width={80} height={24} rx={8} className="fill-slate-700" />
      <text x={200} y={26} textAnchor="middle" className="fill-slate-100 text-[11px] font-semibold">
        Pulmones
      </text>
      <rect x={160} y={335} width={80} height={24} rx={8} className="fill-slate-700" />
      <text x={200} y={351} textAnchor="middle" className="fill-slate-100 text-[11px] font-semibold">
        Cuerpo
      </text>
      {camara(120, 120, 90, 70, escalaA, '#60a5fa', 'AD')}
      {camara(280, 120, 90, 70, escalaA, '#f87171', 'AI')}
      {camara(120, 215, 100, 100, escalaV, '#3b82f6', 'VD')}
      {camara(280, 215, 100, 100, escalaV, '#ef4444', 'VI')}
      {valvula(120, 160, e.avAbiertas)}
      {valvula(280, 160, e.avAbiertas)}
      {/* Semilunares (pulmonar y aórtica): en la salida de cada ventrículo. */}
      {valvula(150, 175, e.semilunaresAbiertas)}
      {valvula(310, 175, e.semilunaresAbiertas)}
      <text x={86} y={172} className="fill-amber-200 text-[9px]">Tricúspide</text>
      <text x={238} y={172} className="fill-amber-200 text-[9px]">Mitral</text>
      <text x={152} y={194} className="fill-amber-200 text-[9px]">Pulmonar</text>
      <text x={312} y={194} className="fill-amber-200 text-[9px]">Aórtica</text>
      {particulas.map(({ f, oxigenada, p }) => (
        <circle key={f} cx={p[0]} cy={p[1]} r={3.5} fill={oxigenada ? '#f87171' : '#60a5fa'} stroke="#0f172a" strokeWidth={0.8} />
      ))}
      <text x={200} y={372} textAnchor="middle" className="fill-slate-400 text-[10px]">
        Rojo: sangre oxigenada · Azul: desoxigenada
      </text>
    </svg>
  );
}

export default function CicloCardiaco() {
  const reloj = useReloj(0.25);
  const [fc, setFc] = useState(75);
  const e = estado(reloj.t, fc);
  const periodo = 60 / fc;
  const ts = useMemo(() => tramos(fc), [fc]);
  const ev = useMemo(() => eventos(fc), [fc]);
  const curvas = useMemo(() => {
    const m = muestrear((t) => t, 0, periodo, 300).map(([t]) => [t, estado(t, fc)] as const);
    return {
      aorta: m.map(([t, s]) => [t, s.presionAorta] as const),
      vi: m.map(([t, s]) => [t, s.presionVI] as const),
      ai: m.map(([t, s]) => [t, s.presionAI] as const),
      volumen: m.map(([t, s]) => [t, s.volumenVI] as const),
      ecg: m.map(([t, s]) => [t, s.ecg] as const),
      pv: m.map(([, s]) => [s.volumenVI, s.presionVI] as const),
    };
  }, [fc, periodo]);
  const bandas = ts.map((t) => ({ desde: t.inicio, hasta: t.fin, etiqueta: t.fin - t.inicio > 0.06 ? ABREV[t.fase] : '', color: COLOR_FASE[t.fase] }));
  const marcas = [
    { x: ev.s1, etiqueta: 'S1' },
    { x: ev.s2, etiqueta: 'S2' },
  ];
  const ind = indices(fc);

  const irAFase = (id: string) => {
    const tramo = ts.find((t) => t.fase === id);
    if (!tramo) return;
    reloj.setT(Math.floor(reloj.t / periodo) * periodo + tramo.inicio + 0.001);
  };

  return (
    <MarcoSimulacion
      titulo="Ciclo cardíaco"
      resumen="Corazón izquierdo y derecho durante un latido: fases, válvulas, flujo sanguíneo por las circulaciones pulmonar y sistémica, ECG sincronizado y diagrama de Wiggers simplificado con su bucle presión–volumen."
      controles={<Controles reloj={reloj} />}
      visual={
        <>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-center text-sm font-semibold text-sky-200" aria-live="polite">
              {NOMBRE_FASE[e.fase]}
            </p>
            <Corazon e={e} tGlobal={reloj.t / periodo} />
          </div>
          <GraficaLinea
            titulo="Presiones (corazón izquierdo)"
            descripcion="Presiones aórtica, ventricular izquierda y auricular izquierda a lo largo de un ciclo"
            series={[
              { nombre: 'Aorta', color: '#f87171', puntos: curvas.aorta },
              { nombre: 'Ventrículo izquierdo', color: '#f1f5f9', puntos: curvas.vi },
              { nombre: 'Aurícula izquierda', color: '#60a5fa', puntos: curvas.ai, discontinua: true },
            ]}
            x={[0, periodo]}
            y={[0, 130]}
            ticksY={[0, 40, 80, 120]}
            etiquetaX="tiempo (s)"
            etiquetaY="mmHg"
            cursorX={e.tCiclo}
            bandas={bandas}
            marcas={marcas}
          />
          <div className="grid gap-4 md:grid-cols-2">
          <GraficaLinea
            titulo="Volumen del ventrículo izquierdo"
            descripcion="Volumen ventricular izquierdo entre 50 y 120 ml"
            series={[{ nombre: 'Volumen VI', color: '#facc15', puntos: curvas.volumen }]}
            x={[0, periodo]}
            y={[40, 130]}
            ticksY={[50, 90, 120]}
            etiquetaX="tiempo (s)"
            etiquetaY="ml"
            cursorX={e.tCiclo}
            bandas={bandas}
            alto={220}
            ancho={400}
          />
            <div>
          <GraficaLinea
            titulo="Bucle presión–volumen del VI"
            descripcion="Bucle presión-volumen del ventrículo izquierdo con el punto actual"
            series={[{ nombre: 'P–V', color: '#f472b6', puntos: curvas.pv }]}
            x={[40, 130]}
            y={[0, 130]}
            ticksY={[0, 40, 80, 120]}
            etiquetaX="volumen (ml)"
            etiquetaY="mmHg"
            punto={[e.volumenVI, e.presionVI]}
            alto={220}
            ancho={400}
          />
          <p className="text-[11px] text-slate-500">
            En el bucle: el lado derecho (vertical) es la contracción isovolumétrica, el superior la eyección, el izquierdo la relajación
            isovolumétrica y el inferior el llenado. El área encerrada es el trabajo sistólico.
          </p>
            </div>
          </div>
          <GraficaLinea
            titulo="Electrocardiograma (derivación II, esquemático)"
            descripcion="ECG con ondas P, complejo QRS y onda T"
            series={[{ nombre: 'ECG', color: '#4ade80', puntos: curvas.ecg }]}
            x={[0, periodo]}
            y={[-0.4, 1.3]}
            ticksY={[0, 1]}
            etiquetaX="tiempo (s)"
            etiquetaY="mV"
            cursorX={e.tCiclo}
            marcas={[
              { x: ev.p, etiqueta: 'P' },
              { x: ev.r, etiqueta: 'QRS' },
              { x: ev.t, etiqueta: 'T' },
            ]}
            alto={130}
          />
        </>
      }
      lateral={
        <>
          <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <label className="block text-sm text-slate-300">
              Frecuencia cardíaca: <strong className="tabular-nums">{fc} lpm</strong>
              <input type="range" min={40} max={180} value={fc} onChange={(ev2) => setFc(Number(ev2.target.value))} className="mt-1 w-full accent-sky-500" />
            </label>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-400">
              <dt>Periodo</dt>
              <dd className="text-right tabular-nums text-slate-200">{periodo.toFixed(2)} s</dd>
              <dt>Volumen sistólico</dt>
              <dd className="text-right tabular-nums text-slate-200">{ind.volumenSistolico} ml</dd>
              <dt>Fracción de eyección</dt>
              <dd className="text-right tabular-nums text-slate-200">{Math.round(ind.fraccionEyeccion * 100)} %</dd>
              <dt>Gasto cardíaco</dt>
              <dd className="text-right tabular-nums text-slate-200">{ind.gastoCardiaco.toFixed(1)} l/min</dd>
              <dt>Diástole</dt>
              <dd className="text-right tabular-nums text-slate-200">
                {(periodo - ((ts[1]!.fin - ts[1]!.inicio) + (ts[2]!.fin - ts[2]!.inicio))).toFixed(2)} s
              </dd>
            </dl>
            <p className="mt-2 text-[11px] text-slate-500">
              Modelo simplificado: el volumen sistólico se mantiene fijo al cambiar la frecuencia (en realidad depende del llenado y de la contractilidad).
            </p>
          </section>
          <Pasos pasos={PASOS} activo={e.fase} onElegir={irAFase} />
        </>
      }
    />
  );
}

