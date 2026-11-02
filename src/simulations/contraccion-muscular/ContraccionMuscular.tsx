import { useMemo, useState } from 'react';
import Controles from '../comun/Controles';
import GraficaLinea from '../comun/GraficaLinea';
import MarcoSimulacion from '../comun/MarcoSimulacion';
import Pasos, { type Paso } from '../comun/Pasos';
import { muestrear } from '../comun/matematicas';
import { useReloj } from '../comun/useReloj';
import {
  CICLO_MUSCULO,
  FILAMENTO,
  INICIO_FASE,
  PALANCA,
  TEXTO_PUENTE,
  anguloCodo,
  estadoMusculo,
  fuerzaBiceps,
  sarcomero,
  ventajaMecanica,
  type FaseMusculo,
} from './modelo';

const PASOS: (Paso & { id: FaseMusculo })[] = [
  { id: 'reposo', titulo: 'Músculo relajado', texto: 'Sin estímulo, la tropomiosina tapa los sitios de unión de la actina y la miosina no puede unirse: el sarcómero está estirado (≈ 2,5 µm).' },
  {
    id: 'excitacion',
    titulo: 'Excitación',
    texto: 'La motoneurona libera acetilcolina en la placa motora. El potencial de acción recorre el sarcolema y penetra en la fibra por los túbulos T.',
  },
  {
    id: 'calcio',
    titulo: 'Liberación de Ca²⁺',
    texto: 'La señal de los túbulos T abre los canales del retículo sarcoplásmico, que libera Ca²⁺ al citoplasma. El Ca²⁺ se une a la troponina C y la tropomiosina se desplaza, dejando libres los sitios de unión de la actina.',
  },
  {
    id: 'puentes',
    titulo: 'Ciclo de puentes cruzados',
    texto: 'Las cabezas de miosina se unen a la actina, giran (golpe de fuerza) y se sueltan gracias al ATP, una y otra vez. Los filamentos finos se deslizan hacia el centro: el sarcómero se acorta aunque ningún filamento cambia de longitud.',
  },
  {
    id: 'relajacion',
    titulo: 'Relajación',
    texto: 'Cesa el estímulo: la bomba SERCA devuelve el Ca²⁺ al retículo (gastando ATP), la tropomiosina vuelve a tapar la actina y el músculo se relaja. Sin ATP las cabezas no se sueltan (rigor mortis).',
  },
];

function Sarcomero({ activacion, calcio, golpe }: { activacion: number; calcio: number; golpe: boolean }) {
  const s = sarcomero(activacion);
  const escala = 120; // px por µm
  const cx = 180;
  const zIzq = cx - (s.longitud / 2) * escala;
  const zDer = cx + (s.longitud / 2) * escala;
  const finoPx = FILAMENTO.fino * escala;
  const gruesoPx = FILAMENTO.grueso * escala;
  const filas = [55, 95, 135];
  return (
    <svg viewBox="0 0 360 200" className="mx-auto h-auto w-full max-w-xl" role="img" aria-label={`Sarcómero de ${s.longitud.toFixed(2)} µm`}>
      {/* Bandas */}
      <rect x={cx - gruesoPx / 2} y={30} width={gruesoPx} height={130} fill="#7f1d1d" fillOpacity={0.18} />
      {s.zonaH > 0.01 && <rect x={cx - (s.zonaH / 2) * escala} y={30} width={s.zonaH * escala} height={130} fill="#facc15" fillOpacity={0.08} />}
      {[zIzq, zDer].map((x, i) => (
        <g key={i}>
          <line x1={x} x2={x} y1={30} y2={160} stroke="#e4dccd" strokeWidth={3} />
          <text x={x} y={24} textAnchor="middle" className="fill-tinta-300 text-[10px]">
            Z
          </text>
        </g>
      ))}
      {filas.map((y) => (
        <g key={y}>
          {/* Actina (filamentos finos) desde cada línea Z */}
          <line x1={zIzq} x2={zIzq + finoPx} y1={y - 12} y2={y - 12} stroke="#60a5fa" strokeWidth={4} />
          <line x1={zDer - finoPx} x2={zDer} y1={y - 12} y2={y - 12} stroke="#60a5fa" strokeWidth={4} />
          <line x1={zIzq} x2={zIzq + finoPx} y1={y + 12} y2={y + 12} stroke="#60a5fa" strokeWidth={4} />
          <line x1={zDer - finoPx} x2={zDer} y1={y + 12} y2={y + 12} stroke="#60a5fa" strokeWidth={4} />
          {/* Miosina (filamento grueso) con cabezas */}
          <line x1={cx - gruesoPx / 2} x2={cx + gruesoPx / 2} y1={y} y2={y} stroke="#ef4444" strokeWidth={7} strokeLinecap="round" />
          {[-1, 1].flatMap((lado) =>
            [0.15, 0.3, 0.45, 0.6, 0.75].map((f) => {
              const hx = cx + lado * f * (gruesoPx / 2);
              // Filamento bipolar: las cabezas apuntan hacia la línea Z de su lado y, en el golpe de
              // fuerza, giran hacia el centro (línea M) arrastrando la actina.
              const extremo = hx + lado * (golpe ? -4 : 6);
              return (
                <g key={`${lado}${f}`}>
                  <line x1={hx} y1={y} x2={extremo} y2={y - 10} stroke="#fca5a5" strokeWidth={2} />
                  <line x1={hx} y1={y} x2={extremo} y2={y + 10} stroke="#fca5a5" strokeWidth={2} />
                </g>
              );
            }),
          )}
        </g>
      ))}
      {calcio > 0.05 &&
        Array.from({ length: Math.round(calcio * 10) }, (_, i) => (
          <text key={i} x={60 + i * 26} y={178} className="fill-emerald-300 text-[9px] font-bold">
            Ca²⁺
          </text>
        ))}
      <text x={cx} y={196} textAnchor="middle" className="fill-tinta-400 text-[10px]">
        Sarcómero: {s.longitud.toFixed(2)} µm · banda I {s.bandaI.toFixed(2)} · zona H {s.zonaH.toFixed(2)} · banda A {s.bandaA.toFixed(1)}
      </text>
    </svg>
  );
}

function Codo({ angulo, masa }: { angulo: number; masa: number }) {
  const escala = 360; // px por metro
  const codo = [130, 150] as const;
  const hombro = [130, 25] as const;
  const rad = (angulo * Math.PI) / 180;
  // Con el brazo vertical, el antebrazo cuelga a 0° y sube al flexionar (hacia la derecha = anterior).
  const dir = [Math.sin(rad), Math.cos(rad)] as const;
  const punto = (d: number) => [codo[0] + dir[0] * d * escala, codo[1] + dir[1] * d * escala] as const;
  const insercion = punto(PALANCA.brazoBiceps);
  const mano = punto(PALANCA.brazoCarga);
  return (
    <svg viewBox="0 0 320 330" className="mx-auto h-auto w-full max-w-xs" role="img" aria-label={`Codo flexionado ${Math.round(angulo)} grados`}>
      <line x1={hombro[0]} y1={hombro[1]} x2={codo[0]} y2={codo[1]} stroke="#e7e5e4" strokeWidth={14} strokeLinecap="round" />
      <text x={hombro[0] - 12} y={hombro[1] + 70} textAnchor="end" className="fill-tinta-400 text-[10px]">
        Húmero
      </text>
      <line x1={codo[0]} y1={codo[1]} x2={mano[0]} y2={mano[1]} stroke="#e7e5e4" strokeWidth={11} strokeLinecap="round" />
      <path d={`M ${hombro[0] + 8} ${hombro[1] + 20} Q ${hombro[0] + 40} ${(hombro[1] + insercion[1]) / 2} ${insercion[0]} ${insercion[1]}`} fill="none" stroke="#ef4444" strokeWidth={9} strokeLinecap="round" />
      <text x={hombro[0] + 30} y={hombro[1] + 70} className="fill-red-300 text-[10px]">
        Bíceps
      </text>
      <circle cx={codo[0]} cy={codo[1]} r={7} fill="#facc15" />
      <text x={codo[0] - 12} y={codo[1] + 4} textAnchor="end" className="fill-yellow-300 text-[10px]">
        Fulcro (codo)
      </text>
      <rect x={mano[0] - 12} y={mano[1] + 4} width={24} height={Math.max(10, 6 + masa * 2.5)} rx={3} fill="#857c6f" />
      <text x={mano[0]} y={mano[1] + Math.max(10, 6 + masa * 2.5) + 18} textAnchor="middle" className="fill-tinta-300 text-[10px]">
        {masa} kg
      </text>
      <circle cx={insercion[0]} cy={insercion[1]} r={4} fill="#fecaca" />
      <text x={160} y={322} textAnchor="middle" className="fill-tinta-500 text-[9px]">
        Palanca de 3.er género: la potencia está entre el fulcro y la resistencia
      </text>
    </svg>
  );
}

export default function ContraccionMuscular() {
  const reloj = useReloj(0.5);
  const [masa, setMasa] = useState(5);
  const e = estadoMusculo(reloj.t);
  const angulo = anguloCodo(e.activacion);
  const fuerza = fuerzaBiceps(masa, angulo);
  const curva = useMemo(() => muestrear((a) => fuerzaBiceps(masa, a), 10, 120, 110), [masa]);

  return (
    <MarcoSimulacion
      titulo="Contracción muscular"
      resumen="Del potencial de acción al acortamiento: acoplamiento excitación–contracción, papel del Ca²⁺ y del ATP, deslizamiento de actina y miosina en el sarcómero y efecto sobre el codo al contraer el bíceps."
      controles={<Controles reloj={reloj} />}
      visual={
        <>
          <div className="rounded-lg border border-tinta-800 bg-tinta-900/40 p-3">
            <p className="text-center text-sm font-semibold text-oro-200" aria-live="polite">
              {PASOS.find((p) => p.id === e.fase)?.titulo}
            </p>
            <Sarcomero activacion={e.activacion} calcio={e.calcio} golpe={e.puente === 'golpe' || e.puente === 'separacion'} />
            <p className="mt-1 min-h-10 text-center text-xs text-tinta-300">
              {e.puente ? (
                <>
                  <strong className="text-red-300">Puente cruzado:</strong> {TEXTO_PUENTE[e.puente]}
                </>
              ) : (
                <span className="text-tinta-400">Azul: actina (filamento fino) · Rojo: miosina (filamento grueso) · Z: discos Z</span>
              )}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <figure className="rounded-lg border border-tinta-800 bg-tinta-950/60 p-2">
              <figcaption className="px-1 text-xs font-semibold text-tinta-300">El codo como palanca</figcaption>
              <Codo angulo={angulo} masa={masa} />
            </figure>
            <GraficaLinea
              titulo="Fuerza que debe hacer el bíceps"
              descripcion="Fuerza del bíceps necesaria para sostener la carga según el ángulo del codo"
              series={[{ nombre: 'Fuerza', color: '#f87171', puntos: curva }]}
              x={[10, 120]}
              y={[0, Math.max(100, Math.ceil(fuerzaBiceps(masa, 90) / 100) * 100)]}
              etiquetaX="flexión del codo (°)"
              etiquetaY="newtons"
              punto={[angulo, fuerza]}
              alto={260}
              ancho={400}
            />
          </div>
        </>
      }
      lateral={
        <>
          <section className="rounded-lg border border-tinta-800 bg-tinta-900/50 p-3 text-sm">
            <label className="block text-tinta-300">
              Carga en la mano: <strong className="tabular-nums">{masa} kg</strong>
              <input type="range" min={0} max={10} value={masa} onChange={(ev) => setMasa(Number(ev.target.value))} className="mt-1 w-full accent-oro-500" />
            </label>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-tinta-400">
              <dt>Flexión del codo</dt>
              <dd className="text-right tabular-nums text-tinta-200">{Math.round(angulo)}°</dd>
              <dt>Fuerza del bíceps</dt>
              <dd className="text-right tabular-nums text-tinta-200">{Math.round(fuerza)} N</dd>
              <dt>Peso de la carga</dt>
              <dd className="text-right tabular-nums text-tinta-200">{Math.round(masa * 9.81)} N</dd>
              <dt>Ventaja mecánica</dt>
              <dd className="text-right tabular-nums text-tinta-200">{ventajaMecanica().toFixed(2)}</dd>
            </dl>
            <p className="mt-2 text-[11px] text-tinta-400">
              El bíceps se inserta a ≈ 4 cm del codo y la carga está a ≈ 35 cm: necesita casi 9 veces más fuerza que el peso que sostiene,
              pero a cambio la mano recorre mucha más distancia y más rápido. Simplificación: el brazo de palanca del bíceps se toma constante.
            </p>
          </section>
          <Pasos
            pasos={PASOS}
            activo={e.fase}
            onElegir={(id) => reloj.setT(Math.floor(reloj.t / CICLO_MUSCULO) * CICLO_MUSCULO + INICIO_FASE[id as FaseMusculo])}
          />
        </>
      }
    />
  );
}
