import Controles from '../comun/Controles';
import MarcoSimulacion from '../comun/MarcoSimulacion';
import Pasos from '../comun/Pasos';
import { crearTrayecto, type Punto } from '../comun/trayecto';
import { useReloj } from '../comun/useReloj';
import { POR_ID } from '@/data/catalogo';
import { DURACION_TOTAL, SEGMENTOS, inicioSegmento, posicionBolo } from './modelo';

// Trazado esquemático de cada tramo (vista anterior: el lado derecho del paciente queda a la izquierda).
const TRAZADOS: Record<string, Punto[]> = {
  boca: [
    [150, 30],
    [150, 52],
  ],
  esofago: [
    [150, 52],
    [150, 160],
  ],
  estomago: [
    [150, 160],
    [178, 165],
    [202, 185],
    [206, 214],
    [186, 234],
    [160, 238],
  ],
  duodeno: [
    [160, 238],
    [140, 246],
    [132, 266],
    [146, 282],
    [168, 282],
  ],
  'intestino-delgado': [
    [168, 282],
    [205, 292],
    [118, 306],
    [205, 320],
    [118, 334],
    [205, 348],
    [128, 364],
  ],
  'intestino-grueso': [
    [128, 364],
    [86, 368],
    [82, 255],
    [228, 255],
    [234, 372],
  ],
  recto: [
    [234, 372],
    [196, 396],
    [164, 404],
    [158, 432],
  ],
};
const TRAYECTOS = Object.fromEntries(Object.entries(TRAZADOS).map(([k, v]) => [k, crearTrayecto(v)]));
const COLOR: Record<string, string> = {
  boca: '#fda4af',
  esofago: '#f9a8d4',
  estomago: '#fb923c',
  duodeno: '#facc15',
  'intestino-delgado': '#fcd34d',
  'intestino-grueso': '#a3e635',
  recto: '#84cc16',
};

function Tubo({ indice, progreso }: { indice: number; progreso: number }) {
  const seg = SEGMENTOS[indice]!;
  const bolo = TRAYECTOS[seg.id]!.en(progreso);
  return (
    <svg viewBox="0 0 300 445" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label={`Tubo digestivo esquemático; el bolo está en: ${seg.nombre}`}>
      <ellipse cx={150} cy={32} rx={34} ry={26} fill="none" stroke="#475569" strokeDasharray="3 3" />
      <path d="M 70 120 Q 150 90 230 120 L 255 420 Q 150 445 45 420 Z" fill="none" stroke="#334155" strokeDasharray="4 4" />
      {SEGMENTOS.map((s, i) => (
        <path
          key={s.id}
          d={TRAYECTOS[s.id]!.d}
          fill="none"
          stroke={COLOR[s.id]}
          strokeOpacity={i === indice ? 1 : 0.35}
          strokeWidth={s.id === 'estomago' ? 22 : s.id === 'intestino-grueso' ? 16 : s.id === 'intestino-delgado' ? 9 : 11}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <circle cx={bolo[0]} cy={bolo[1]} r={8} fill="#78350f" stroke="#fef3c7" strokeWidth={2} />
      <text x={244} y={210} className="fill-orange-300 text-[10px]">
        Estómago
      </text>
      <text x={160} y={110} className="fill-pink-300 text-[10px]">
        Esófago
      </text>
      <text x={60} y={300} textAnchor="end" className="fill-lime-300 text-[10px]" transform="translate(16 0)">
        Colon
      </text>
      <text x={212} y={300} className="fill-amber-200 text-[10px]">
        I. delgado
      </text>
      <text x={170} y={436} className="fill-lime-300 text-[10px]">
        Recto y ano
      </text>
    </svg>
  );
}

export default function Digestion() {
  const reloj = useReloj(1);
  const { indice, progreso } = posicionBolo(reloj.t);
  const seg = SEGMENTOS[indice]!;

  return (
    <MarcoSimulacion
      titulo="Digestión"
      resumen="Recorrido de un bolo alimenticio por el tubo digestivo, con los procesos mecánicos y químicos, las enzimas y la absorción de cada tramo. La animación no respeta las duraciones reales, que se indican en cada paso."
      controles={<Controles reloj={reloj} />}
      visual={
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <Tubo indice={indice} progreso={progreso} />
          </div>
          <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-4" aria-live="polite">
            <h2 className="text-lg font-semibold" style={{ color: '#fde68a' }}>
              {seg.nombre}
            </h2>
            <p className="text-xs text-slate-400">Tiempo típico de permanencia: {seg.tiempo}</p>
            <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Qué ocurre</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300">
              {seg.procesos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {seg.enzimas.length > 0 && (
              <>
                <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Enzimas</h3>
                <div className="mt-1 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-1 pr-2 font-medium">Enzima</th>
                        <th className="py-1 pr-2 font-medium">Origen</th>
                        <th className="py-1 pr-2 font-medium">Sustrato → producto</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {seg.enzimas.map((e) => (
                        <tr key={e.nombre} className="border-t border-slate-800 align-top">
                          <td className="py-1 pr-2 font-medium text-slate-100">{e.nombre}</td>
                          <td className="py-1 pr-2">{e.origen}</td>
                          <td className="py-1 pr-2">
                            {e.sustrato} → {e.producto}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {seg.absorcion && (
              <p className="mt-3 text-sm text-slate-300">
                <strong className="text-slate-100">Absorción:</strong> {seg.absorcion}
              </p>
            )}
            <p className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-500">
              En el atlas:
              {seg.estructuras.map((id) => (
                <span key={id} className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                  {POR_ID.get(id)?.nombre ?? id}
                </span>
              ))}
            </p>
          </article>
        </div>
      }
      lateral={
        <Pasos
          pasos={SEGMENTOS.map((s) => ({ id: s.id, titulo: s.nombre, texto: `${s.procesos[0]} Tiempo típico: ${s.tiempo}.` }))}
          activo={seg.id}
          onElegir={(id) => {
            const i = SEGMENTOS.findIndex((s) => s.id === id);
            reloj.setT(Math.floor(reloj.t / DURACION_TOTAL) * DURACION_TOTAL + inicioSegmento(i) + 0.01);
          }}
        />
      }
    />
  );
}
