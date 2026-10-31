import { useMemo } from 'react';
import Controles from '../comun/Controles';
import GraficaLinea from '../comun/GraficaLinea';
import MarcoSimulacion from '../comun/MarcoSimulacion';
import Pasos, { type Paso } from '../comun/Pasos';
import { modulo, muestrear } from '../comun/matematicas';
import { useReloj } from '../comun/useReloj';
import {
  AXON_MM,
  CICLO_PA,
  INTERNODO_MM,
  PASOS_SINAPSIS,
  POTENCIALES,
  VELOCIDAD,
  pasoSinapsis,
  posicionImpulso,
  potencialAccion,
  type EstadoPA,
  type FasePA,
} from './modelo';

/** ms de potencial de acción por segundo de animación a velocidad 1×. */
const MS_POR_SEGUNDO_PA = 4;

const PASOS: (Paso & { id: FasePA; t: number })[] = [
  {
    id: 'reposo',
    t: 0.2,
    titulo: 'Potencial de reposo',
    texto:
      'La membrana está polarizada (≈ −70 mV, interior negativo). La bomba Na⁺/K⁺-ATPasa mantiene más Na⁺ fuera y más K⁺ dentro; en reposo la membrana es más permeable al K⁺.',
  },
  {
    id: 'estimulo',
    t: 1.1,
    titulo: 'Estímulo y umbral',
    texto: 'Un estímulo despolariza la membrana. Si alcanza el umbral (≈ −55 mV) se dispara el potencial de acción: es una respuesta «todo o nada».',
  },
  {
    id: 'despolarizacion',
    t: 1.5,
    titulo: 'Despolarización',
    texto: 'Se abren los canales de Na⁺ dependientes de voltaje: el Na⁺ entra a favor de su gradiente y el interior se vuelve positivo (≈ +30 mV).',
  },
  {
    id: 'repolarizacion',
    t: 2.2,
    titulo: 'Repolarización',
    texto:
      'Los canales de Na⁺ se inactivan y se abren los de K⁺: el K⁺ sale y el potencial vuelve a ser negativo. Durante este tiempo no puede dispararse otro potencial (periodo refractario absoluto).',
  },
  {
    id: 'hiperpolarizacion',
    t: 3.5,
    titulo: 'Hiperpolarización',
    texto:
      'Los canales de K⁺ tardan en cerrarse y el potencial baja por debajo del reposo (≈ −80 mV). Un estímulo más intenso de lo normal podría disparar un nuevo potencial (periodo refractario relativo).',
  },
];

function Membrana({ e, t }: { e: EstadoPA; t: number }) {
  const naAbierto = e.canalNa === 'abierto';
  const kAbierto = e.canalK === 'abierto';
  const iones = Array.from({ length: 5 }, (_, i) => modulo(t * 0.6 + i / 5, 1));
  const canal = (x: number, abierto: boolean, inactivado: boolean, etiqueta: string, color: string) => (
    <g>
      <rect x={x - 22} y={70} width={14} height={60} rx={4} fill={color} />
      <rect x={x + 8} y={70} width={14} height={60} rx={4} fill={color} />
      {!abierto && <rect x={x - 8} y={inactivado ? 118 : 70} width={16} height={12} rx={3} fill={inactivado ? '#f97316' : color} />}
      <text x={x} y={150} textAnchor="middle" className="fill-slate-300 text-[10px]">
        {etiqueta}
      </text>
      <text x={x} y={162} textAnchor="middle" className="fill-slate-500 text-[9px]">
        {inactivado ? 'inactivado' : abierto ? 'abierto' : 'cerrado'}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 360 175" className="mx-auto h-auto w-full max-w-xl" role="img" aria-label={`Membrana: canal de sodio ${e.canalNa}, canal de potasio ${e.canalK}`}>
      <text x={8} y={20} className="fill-slate-400 text-[10px]">
        Exterior (más Na⁺)
      </text>
      <text x={8} y={172} className="fill-slate-400 text-[10px]">
        Interior (más K⁺)
      </text>
      <rect x={0} y={80} width={360} height={40} fill="#334155" />
      <rect x={0} y={80} width={360} height={6} fill="#64748b" />
      <rect x={0} y={114} width={360} height={6} fill="#64748b" />
      {canal(110, naAbierto, e.canalNa === 'inactivado', 'Canal de Na⁺', '#0ea5e9')}
      {canal(250, kAbierto, false, 'Canal de K⁺', '#a855f7')}
      {naAbierto &&
        iones.map((p) => <circle key={`na${p}`} cx={110} cy={40 + p * 80} r={5} fill="#38bdf8" stroke="#0c4a6e" />)}
      {kAbierto &&
        iones.map((p) => <circle key={`k${p}`} cx={250} cy={150 - p * 100} r={5} fill="#c084fc" stroke="#3b0764" />)}
      <text x={340} y={20} textAnchor="end" className="fill-slate-200 text-[13px] font-bold tabular-nums">
        {Math.round(e.potencial)} mV
      </text>
    </svg>
  );
}

function Axones({ tc }: { tc: number }) {
  const ancho = 330;
  const x = (mm: number) => 15 + (mm / AXON_MM) * ancho;
  const pSin = posicionImpulso(tc, false);
  const pCon = posicionImpulso(tc, true);
  const nodos = Array.from({ length: AXON_MM / INTERNODO_MM + 1 }, (_, i) => i * INTERNODO_MM);
  return (
    <svg viewBox="0 0 360 150" className="mx-auto h-auto w-full max-w-xl" role="img" aria-label="Comparación de la conducción en fibras con y sin mielina">
      <text x={15} y={22} className="fill-slate-300 text-[10px]">
        Sin mielina (≈ {VELOCIDAD.sinMielina} m/s): conducción continua
      </text>
      <line x1={x(0)} x2={x(AXON_MM)} y1={38} y2={38} stroke="#94a3b8" strokeWidth={6} strokeLinecap="round" />
      <line x1={x(0)} x2={x(pSin)} y1={38} y2={38} stroke="#facc15" strokeWidth={6} strokeLinecap="round" />
      <circle cx={x(pSin)} cy={38} r={6} fill="#fde047" />

      <text x={15} y={82} className="fill-slate-300 text-[10px]">
        Con mielina (≈ {VELOCIDAD.conMielina} m/s): conducción saltatoria
      </text>
      <line x1={x(0)} x2={x(AXON_MM)} y1={100} y2={100} stroke="#94a3b8" strokeWidth={4} />
      {nodos.slice(0, -1).map((n) => (
        <rect key={n} x={x(n) + 0.8} y={93} width={x(n + INTERNODO_MM) - x(n) - 1.6} height={14} rx={4} fill="#e2e8f0" fillOpacity={n < pCon ? 0.35 : 0.85} />
      ))}
      <circle cx={x(pCon)} cy={100} r={6} fill="#fde047" />
      <text x={15} y={135} className="fill-slate-500 text-[9px]">
        t = {modulo(tc, 2.5).toFixed(2)} ms · claro: mielina · huecos: nódulos de Ranvier
      </text>
      <text x={345} y={122} textAnchor="end" className="fill-slate-500 text-[9px]">
        {AXON_MM} mm
      </text>
    </svg>
  );
}

function Sinapsis({ t }: { t: number }) {
  const { indice, progreso } = pasoSinapsis(t);
  const liberado = indice >= 2 && indice <= 4;
  const unidos = indice >= 3 && indice <= 4;
  return (
    <div>
      <svg viewBox="0 0 300 170" className="h-auto w-full" role="img" aria-label={`Sinapsis química: ${PASOS_SINAPSIS[indice]!.titulo}`}>
        <path d="M 40 10 L 260 10 L 260 70 Q 150 100 40 70 Z" fill="#1e3a8a" fillOpacity={0.6} stroke="#60a5fa" />
        <text x={150} y={28} textAnchor="middle" className="fill-blue-200 text-[10px]">
          Terminal presináptico
        </text>
        {indice === 0 && <circle cx={60 + progreso * 180} cy={18} r={5} fill="#fde047" />}
        {indice >= 1 &&
          [0, 1, 2].map((i) => (
            <text key={i} x={80 + i * 60} y={50 - (indice === 1 ? (1 - progreso) * 30 : 0)} className="fill-emerald-300 text-[10px] font-bold">
              Ca²⁺
            </text>
          ))}
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={95 + i * 36} cy={liberado ? 74 : 62} r={9} fill={liberado ? 'none' : '#f472b6'} stroke="#f472b6" strokeDasharray={liberado ? '2 2' : undefined} />
        ))}
        {liberado &&
          Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={90 + i * 13} cy={unidos ? 116 : 84 + progreso * 30} r={3} fill="#f472b6" />
          ))}
        <path d="M 40 125 Q 150 105 260 125 L 260 165 L 40 165 Z" fill="#14532d" fillOpacity={0.6} stroke="#4ade80" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={84 + i * 30} y={114} width={12} height={10} rx={2} fill={unidos ? '#22c55e' : '#166534'} />
        ))}
        {indice === 4 && (
          <text x={150} y={150} textAnchor="middle" className="fill-sky-300 text-[10px] font-bold">
            Na⁺ entra → despolarización
          </text>
        )}
        <text x={150} y={160} textAnchor="middle" className="fill-green-200 text-[9px]">
          Neurona postsináptica
        </text>
        <text x={268} y={100} className="fill-slate-500 text-[8px]">
          hendidura
        </text>
      </svg>
      <p className="mt-1 text-xs text-slate-300">
        <strong className="text-sky-200">
          {indice + 1}. {PASOS_SINAPSIS[indice]!.titulo}:
        </strong>{' '}
        {PASOS_SINAPSIS[indice]!.texto}
      </p>
    </div>
  );
}

export default function ImpulsoNervioso() {
  const reloj = useReloj(0.5);
  const tms = reloj.t * MS_POR_SEGUNDO_PA;
  const e = potencialAccion(tms);
  const curva = useMemo(() => muestrear((t) => potencialAccion(t).potencial, 0, 6, 300), []);
  const cursor = modulo(tms, CICLO_PA);

  return (
    <MarcoSimulacion
      titulo="Impulso nervioso"
      resumen="Potencial de acción en un punto de la membrana de un axón, con los canales de Na⁺ y K⁺ dependientes de voltaje; comparación de la conducción continua y saltatoria, y transmisión en una sinapsis química."
      controles={<Controles reloj={reloj} />}
      visual={
        <>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-center text-sm font-semibold text-sky-200" aria-live="polite">
              {PASOS.find((p) => p.id === e.fase)?.titulo}
              {e.refractario !== 'ninguno' && <span className="ml-2 text-xs text-amber-300">(periodo refractario {e.refractario})</span>}
            </p>
            <Membrana e={e} t={reloj.t} />
          </div>
          <GraficaLinea
            titulo="Potencial de membrana"
            descripcion="Potencial de acción: reposo, despolarización hasta +30 mV, repolarización e hiperpolarización"
            series={[{ nombre: 'Potencial', color: '#facc15', puntos: curva }]}
            x={[0, 6]}
            y={[-90, 40]}
            ticksY={[POTENCIALES.hiperpolarizacion, POTENCIALES.reposo, POTENCIALES.umbral, 0, POTENCIALES.pico]}
            etiquetaX="tiempo (ms)"
            etiquetaY="mV"
            cursorX={cursor < 6 ? cursor : undefined}
            bandas={[
              { desde: 1.4, hasta: 3.2, etiqueta: 'refr. absoluto', color: 'rgba(248,113,113,0.1)' },
              { desde: 3.2, hasta: 5.5, etiqueta: 'refr. relativo', color: 'rgba(250,204,21,0.07)' },
            ]}
          />
          <figure className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
            <figcaption className="px-1 text-xs font-semibold text-slate-300">Conducción del impulso (mismo tiempo transcurrido)</figcaption>
            <Axones tc={reloj.t} />
            <p className="px-1 text-[11px] text-slate-500">
              La mielina aísla el axón: el potencial de acción solo se regenera en los nódulos de Ranvier y «salta» entre ellos. Por eso es
              más rápida y gasta menos energía. La desmielinización (p. ej. en la esclerosis múltiple) enlentece o bloquea la conducción.
            </p>
          </figure>
        </>
      }
      lateral={
        <>
          <Pasos
            pasos={PASOS}
            activo={e.fase}
            onElegir={(id) => {
              const p = PASOS.find((x) => x.id === id);
              if (p) reloj.setT((Math.floor(tms / CICLO_PA) * CICLO_PA + p.t) / MS_POR_SEGUNDO_PA);
            }}
          />
          <figure className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <figcaption className="text-xs font-semibold text-slate-300">Sinapsis química</figcaption>
            <Sinapsis t={reloj.t} />
          </figure>
        </>
      }
    />
  );
}
