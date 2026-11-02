import { useState } from 'react';
import Controles from '../comun/Controles';
import GraficaLinea from '../comun/GraficaLinea';
import MarcoSimulacion from '../comun/MarcoSimulacion';
import Pasos, { type Paso } from '../comun/Pasos';
import { muestrear, modulo } from '../comun/matematicas';
import { useReloj } from '../comun/useReloj';
import { CAPACIDADES, DURACION_ESPIROMETRIA, GASES, MUSCULOS, VOL, estadoResp, ventilacion, type EstadoResp, type FaseResp, type Modo } from './modelo';

const PASOS: (Paso & { id: FaseResp })[] = [
  {
    id: 'inspiracion',
    titulo: 'Inspiración tranquila',
    texto:
      'El diafragma se contrae y desciende, y los intercostales externos elevan las costillas: el tórax se agranda, la presión alveolar cae ≈ 1 mmHg por debajo de la atmosférica y entra el aire (volumen corriente ≈ 500 ml).',
  },
  {
    id: 'espiracion',
    titulo: 'Espiración tranquila',
    texto:
      'Los músculos se relajan y el retroceso elástico de pulmones y pared torácica reduce el volumen: la presión alveolar supera a la atmosférica y el aire sale. Es un proceso pasivo; el pulmón vuelve a la capacidad residual funcional.',
  },
  {
    id: 'inspiracion-maxima',
    titulo: 'Inspiración máxima',
    texto:
      'Con ayuda de los músculos accesorios se inspira todo lo posible: además del volumen corriente entra el volumen de reserva inspiratorio (≈ 3100 ml) y se alcanza la capacidad pulmonar total (≈ 6000 ml).',
  },
  {
    id: 'espiracion-forzada',
    titulo: 'Espiración forzada',
    texto:
      'Los músculos abdominales y los intercostales internos expulsan el aire con fuerza: sale la capacidad vital (≈ 4800 ml), la mayor parte en el primer segundo (FEV1 ≈ 75–80 % de la CV). En los pulmones queda el volumen residual (≈ 1200 ml), que nunca se expulsa.',
  },
  {
    id: 'recuperacion',
    titulo: 'Vuelta al reposo',
    texto: 'Se vuelve a respirar con normalidad hasta la capacidad residual funcional (VRE + VR ≈ 2400 ml).',
  },
];

function Torax({ e }: { e: EstadoResp }) {
  const { cpt } = CAPACIDADES;
  const s = 0.74 + 0.34 * ((e.volumen - VOL.vr) / (cpt - VOL.vr));
  const yd = 262 + 46 * e.diafragma;
  const giroCostillas = -4 * e.diafragma;
  const entra = e.presionAlveolar < -0.05;
  const sale = e.presionAlveolar > 0.05;
  const pulmon = (lado: 1 | -1) => (
    <g transform={`translate(${180 + lado * 62} 100) scale(${s}) translate(${-(180 + lado * 62)} -100)`}>
      <path
        d={`M ${180 + lado * 22} 100 C ${180 + lado * 30} 80, ${180 + lado * 110} 80, ${180 + lado * 112} 170 C ${180 + lado * 114} 240, ${180 + lado * 70} 262, ${180 + lado * 22} 250 Z`}
        fill="#fda4af"
        fillOpacity={0.75}
        stroke="#9f1239"
        strokeWidth={2}
      />
    </g>
  );
  return (
    <svg viewBox="0 0 360 330" className="mx-auto h-auto w-full max-w-md" role="img" aria-label={`Tórax esquemático: volumen pulmonar ${Math.round(e.volumen)} ml`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`rotate(${giroCostillas} 180 ${110 + i * 30})`}>
          <path d={`M 70 ${120 + i * 30} Q 180 ${90 + i * 30} 290 ${120 + i * 30}`} fill="none" stroke="#e7e5e4" strokeOpacity={0.35} strokeWidth={6} />
        </g>
      ))}
      {pulmon(-1)}
      {pulmon(1)}
      <path d="M 180 15 L 180 100 M 180 100 L 150 125 M 180 100 L 210 125" stroke="#e4dccd" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d={`M 55 ${yd + 10} Q 180 ${yd - 70} 305 ${yd + 10}`} fill="none" stroke="#f87171" strokeWidth={7} strokeLinecap="round" />
      <text x={305} y={yd + 26} textAnchor="end" className="fill-red-300 text-[11px]">
        Diafragma
      </text>
      {(entra || sale) && (
        <g className={entra ? 'fill-oro-300' : 'fill-amber-300'}>
          <path d={entra ? 'M 200 20 l 10 0 l 0 22 l 7 0 l -12 14 l -12 -14 l 7 0 z' : 'M 200 56 l 10 0 l 0 -22 l 7 0 l -12 -14 l -12 14 l 7 0 z'} />
          <text x={222} y={40} className="text-[11px]">
            {entra ? 'Entra aire' : 'Sale aire'}
          </text>
        </g>
      )}
    </svg>
  );
}

function ColumnaVolumenes({ volumen }: { volumen: number }) {
  const alto = 260;
  const y = (v: number) => 10 + alto - (v / CAPACIDADES.cpt) * alto;
  const tramos = [
    { nombre: 'VR', desde: 0, hasta: VOL.vr, color: '#5f584f' },
    { nombre: 'VRE', desde: VOL.vr, hasta: CAPACIDADES.crf, color: '#0ea5e9' },
    { nombre: 'VT', desde: CAPACIDADES.crf, hasta: CAPACIDADES.crf + VOL.vt, color: '#22c55e' },
    { nombre: 'VRI', desde: CAPACIDADES.crf + VOL.vt, hasta: CAPACIDADES.cpt, color: '#a855f7' },
  ];
  const llaves = [
    { nombre: 'CV', desde: VOL.vr, hasta: CAPACIDADES.cpt, x: 150 },
    { nombre: 'CRF', desde: 0, hasta: CAPACIDADES.crf, x: 125 },
    { nombre: 'CI', desde: CAPACIDADES.crf, hasta: CAPACIDADES.cpt, x: 125 },
    { nombre: 'CPT', desde: 0, hasta: CAPACIDADES.cpt, x: 175 },
  ];
  return (
    <svg viewBox="0 0 210 280" className="h-auto w-full" role="img" aria-label="Volúmenes y capacidades pulmonares con el volumen actual">
      {tramos.map((t) => (
        <g key={t.nombre}>
          <rect x={40} y={y(t.hasta)} width={60} height={y(t.desde) - y(t.hasta)} fill={t.color} fillOpacity={0.55} stroke="#1d1a17" />
          <text x={70} y={(y(t.desde) + y(t.hasta)) / 2 + 4} textAnchor="middle" className="fill-white text-[11px] font-bold">
            {t.nombre}
          </text>
          <text x={36} y={(y(t.desde) + y(t.hasta)) / 2 + 4} textAnchor="end" className="fill-tinta-400 text-[9px]">
            {t.hasta - t.desde}
          </text>
        </g>
      ))}
      {llaves.map((l) => (
        <g key={l.nombre} className="stroke-tinta-500">
          <line x1={l.x} x2={l.x} y1={y(l.hasta) + 2} y2={y(l.desde) - 2} strokeWidth={1.5} />
          <line x1={l.x - 4} x2={l.x} y1={y(l.hasta) + 2} y2={y(l.hasta) + 2} />
          <line x1={l.x - 4} x2={l.x} y1={y(l.desde) - 2} y2={y(l.desde) - 2} />
          <text x={l.x + 3} y={(y(l.desde) + y(l.hasta)) / 2 + 3} className="fill-tinta-300 stroke-none text-[9px]">
            {l.nombre}
          </text>
        </g>
      ))}
      <line x1={30} x2={110} y1={y(volumen)} y2={y(volumen)} stroke="#faf7f1" strokeWidth={2.5} />
      <text x={112} y={y(volumen) - 3} className="fill-white text-[9px]">
        {Math.round(volumen)} ml
      </text>
    </svg>
  );
}

function Alveolo({ t }: { t: number }) {
  const g = GASES;
  const particulas = Array.from({ length: 6 }, (_, i) => modulo(t * 0.5 + i / 6, 1));
  return (
    <svg viewBox="0 0 300 190" className="h-auto w-full" role="img" aria-label="Intercambio de oxígeno y dióxido de carbono entre el alvéolo y el capilar">
      <defs>
        <linearGradient id="capilar" x1="0" x2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <circle cx={150} cy={60} r={52} fill="#fecdd3" fillOpacity={0.25} stroke="#fda4af" strokeWidth={2} />
      <text x={150} y={34} textAnchor="middle" className="fill-rose-200 text-[10px] font-semibold">
        Alvéolo
      </text>
      <text x={150} y={50} textAnchor="middle" className="fill-tinta-300 text-[9px]">
        PO₂ {g.alveolo.o2} · PCO₂ {g.alveolo.co2} mmHg
      </text>
      <rect x={20} y={120} width={260} height={30} rx={15} fill="url(#capilar)" fillOpacity={0.8} />
      <text x={24} y={170} className="fill-blue-300 text-[9px]">
        Llega: PO₂ {g.sangreVenosa.o2} · PCO₂ {g.sangreVenosa.co2}
      </text>
      <text x={276} y={170} textAnchor="end" className="fill-red-300 text-[9px]">
        Sale: PO₂ {g.sangreArterial.o2} · PCO₂ {g.sangreArterial.co2}
      </text>
      <text x={150} y={185} textAnchor="middle" className="fill-tinta-400 text-[9px]">
        Capilar pulmonar →
      </text>
      {particulas.map((p, i) => (
        <g key={i}>
          {/* O₂: del alvéolo a la sangre */}
          <circle cx={110 + i * 8} cy={70 + p * 60} r={4} fill="#38bdf8" />
          {/* CO₂: de la sangre al alvéolo */}
          <circle cx={170 + i * 8} cy={130 - p * 60} r={4} fill="#fbbf24" />
        </g>
      ))}
      <text x={60} y={100} className="fill-oro-300 text-[10px]">
        O₂ ↓
      </text>
      <text x={222} y={100} className="fill-amber-300 text-[10px]">
        CO₂ ↑
      </text>
    </svg>
  );
}

export default function Respiracion() {
  const reloj = useReloj(1);
  const [modo, setModo] = useState<Modo>('reposo');
  const [fr, setFr] = useState(12);
  const e = estadoResp(reloj.t, modo, fr);
  const vent = ventilacion(fr);

  const ventana = modo === 'reposo' ? 15 : DURACION_ESPIROMETRIA;
  const xIni = modo === 'reposo' ? Math.max(0, reloj.t - ventana) : 0;
  const cursor = modo === 'reposo' ? reloj.t : modulo(reloj.t, DURACION_ESPIROMETRIA);
  // En reposo la ventana avanza con el tiempo (se dibuja hasta el instante actual); en espirometría
  // se muestra el ciclo completo de la maniobra.
  const xFin = modo === 'reposo' ? Math.max(reloj.t, 0.01) : ventana;
  const curva = muestrear((x) => estadoResp(x, modo, fr).volumen, xIni, xFin, 300);

  const elegirPaso = (id: string) => {
    const inicios: Record<string, [Modo, number]> = {
      'inspiracion-maxima': ['espirometria', 15.01],
      'espiracion-forzada': ['espirometria', 18.01],
      recuperacion: ['espirometria', 23.01],
    };
    if (inicios[id]) {
      setModo(inicios[id][0]);
      reloj.setT(inicios[id][1]);
      return;
    }
    const periodo = modo === 'reposo' ? 60 / fr : 5;
    const base = modo === 'reposo' ? Math.floor(reloj.t / periodo) * periodo : 0;
    reloj.setT(base + (id === 'inspiracion' ? 0.01 : periodo / 3 + 0.01));
  };

  return (
    <MarcoSimulacion
      titulo="Respiración"
      resumen="Mecánica de la ventilación: pulmones y diafragma en inspiración y espiración, presiones, volúmenes pulmonares en un espirograma e intercambio de O₂ y CO₂ en el alvéolo."
      controles={
        <div className="flex flex-wrap items-center gap-4">
          <Controles reloj={reloj} />
          <div className="flex rounded-md border border-tinta-700 p-0.5 text-sm" role="group" aria-label="Modo">
            {(
              [
                ['reposo', 'Respiración en reposo'],
                ['espirometria', 'Espirometría'],
              ] as const
            ).map(([m, nombre]) => (
              <button
                key={m}
                type="button"
                aria-pressed={modo === m}
                onClick={() => {
                  setModo(m);
                  reloj.reiniciar();
                }}
                className={`rounded px-3 py-1 ${modo === m ? 'bg-oro-500 text-tinta-950' : 'text-tinta-300 hover:bg-tinta-800'}`}
              >
                {nombre}
              </button>
            ))}
          </div>
        </div>
      }
      visual={
        <>
          <div className="grid gap-4 rounded-lg border border-tinta-800 bg-tinta-900/40 p-3 sm:grid-cols-[minmax(0,1fr)_200px]">
            <div>
              <p className="text-center text-sm font-semibold text-oro-200" aria-live="polite">
                {PASOS.find((p) => p.id === e.fase)?.titulo}
              </p>
              <Torax e={e} />
            </div>
            <ColumnaVolumenes volumen={e.volumen} />
          </div>
          <GraficaLinea
            titulo={modo === 'reposo' ? 'Espirograma (respiración tranquila)' : 'Espirograma con maniobra de capacidad vital'}
            descripcion="Volumen pulmonar a lo largo del tiempo"
            series={[{ nombre: 'Volumen pulmonar', color: '#4ade80', puntos: curva }]}
            x={[xIni, xIni + ventana]}
            y={[0, 6500]}
            ticksY={[VOL.vr, CAPACIDADES.crf, CAPACIDADES.crf + VOL.vt, CAPACIDADES.cpt]}
            etiquetaX="tiempo (s)"
            etiquetaY="volumen (ml)"
            cursorX={cursor}
            alto={200}
          />
        </>
      }
      lateral={
        <>
          <section className="rounded-lg border border-tinta-800 bg-tinta-900/50 p-3 text-sm">
            {modo === 'reposo' && (
              <label className="block text-tinta-300">
                Frecuencia respiratoria: <strong className="tabular-nums">{fr} rpm</strong>
                <input type="range" min={8} max={30} value={fr} onChange={(ev) => setFr(Number(ev.target.value))} className="mt-1 w-full accent-oro-500" />
              </label>
            )}
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-tinta-400">
              <dt>Volumen pulmonar</dt>
              <dd className="text-right tabular-nums text-tinta-200">{Math.round(e.volumen)} ml</dd>
              <dt>Presión alveolar</dt>
              <dd className="text-right tabular-nums text-tinta-200">
                {e.presionAlveolar > 0 ? '+' : ''}
                {e.presionAlveolar.toFixed(1)} mmHg
              </dd>
              <dt>Presión intrapleural (aprox.)</dt>
              <dd className="text-right tabular-nums text-tinta-200">{e.presionPleural.toFixed(1)} mmHg</dd>
              {modo === 'reposo' && (
                <>
                  <dt>Ventilación minuto</dt>
                  <dd className="text-right tabular-nums text-tinta-200">{(vent.minuto / 1000).toFixed(1)} l/min</dd>
                  <dt>Ventilación alveolar</dt>
                  <dd className="text-right tabular-nums text-tinta-200">{(vent.alveolar / 1000).toFixed(1)} l/min</dd>
                </>
              )}
            </dl>
            <p className="mt-2 text-xs text-tinta-400">
              <strong className="text-tinta-300">Músculos activos:</strong> {MUSCULOS[e.fase]}
            </p>
          </section>
          <Pasos pasos={PASOS} activo={e.fase} onElegir={elegirPaso} />
          <figure className="rounded-lg border border-tinta-800 bg-tinta-950/60 p-2">
            <figcaption className="px-1 text-xs font-semibold text-tinta-300">Intercambio alveolar (difusión)</figcaption>
            <Alveolo t={reloj.t} />
            <p className="px-1 text-[11px] text-tinta-400">
              Cada gas difunde a favor de su gradiente de presión parcial a través de la membrana respiratoria (≈ 0,5 µm). El equilibrio se
              alcanza en el primer tercio del recorrido capilar en reposo.
            </p>
          </figure>
        </>
      }
    />
  );
}
