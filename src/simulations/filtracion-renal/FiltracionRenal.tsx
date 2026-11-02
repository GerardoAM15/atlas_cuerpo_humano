import Controles from '../comun/Controles';
import MarcoSimulacion from '../comun/MarcoSimulacion';
import Pasos from '../comun/Pasos';
import { modulo } from '../comun/matematicas';
import { crearTrayecto } from '../comun/trayecto';
import { useReloj } from '../comun/useReloj';
import { DURACION_PASO, SUSTANCIAS_ANIMADAS, TFG_ML_MIN, TRAMOS, destino, flujoTubular, fraccionRestante, pasoActual } from './modelo';

// Nefrona esquemática: glomérulo, túbulo proximal, asa de Henle, túbulo distal y colector.
const NEFRONA = crearTrayecto([
  [70, 70],
  [100, 70], // 1: fin de la filtración (cápsula de Bowman)
  [130, 48],
  [152, 92],
  [176, 52],
  [200, 95], // 5: fin del proximal
  [200, 300], // 6: fin de la rama descendente
  [215, 322],
  [230, 300],
  [230, 120], // 9: fin de la rama ascendente
  [250, 92],
  [270, 125],
  [292, 95], // 12: fin del distal
  [322, 110],
  [322, 330], // 14: fin del colector
  [322, 352],
]);
const LIMITES = [0, 1, 5, 6, 9, 12, 14, 15].map((v) => NEFRONA.fraccionDeVertice(v));
const tramoEn = (i: number) => [LIMITES[i]!, LIMITES[i + 1]!] as const;

const COLOR = { agua: '#38bdf8', sodio: '#a78bfa', glucosa: '#fbbf24', urea: '#a3e635', proteina: '#f87171' } as const;
const NOMBRE = { agua: 'Agua', sodio: 'Na⁺', glucosa: 'Glucosa', urea: 'Urea', proteina: 'Proteína' } as const;
const N = 45;
const fraccion = (x: number) => x - Math.floor(x);

function Nefrona({ t, paso }: { t: number; paso: number }) {
  const particulas = Array.from({ length: N }, (_, i) => {
    const tipo = SUSTANCIAS_ANIMADAS[i % SUSTANCIAS_ANIMADAS.length]!;
    const azar = fraccion(i * 0.6180339887);
    const d = destino(tipo, azar);
    const s = modulo(t * 0.07 + i / N, 1);
    if (d === 'no-filtra') {
      // Las proteínas siguen en la sangre del glomérulo.
      const a = t * 2 + i;
      return { tipo, x: 70 + 16 * Math.cos(a), y: 70 + 16 * Math.sin(a), opacidad: 1, key: i };
    }
    if (typeof d === 'number') {
      const [ini, fin] = tramoEn(d);
      const salida = ini + (fin - ini) * (0.25 + 0.5 * fraccion(i * 0.37));
      if (s > salida) {
        // Reabsorbida: sale del túbulo hacia el capilar peritubular y se desvanece.
        const [x, y] = NEFRONA.en(salida);
        const avance = (s - salida) * 600;
        return { tipo, x: x - avance, y: y - avance * 0.3, opacidad: Math.max(0, 1 - (s - salida) * 14), key: i };
      }
    }
    const [x, y] = NEFRONA.en(s);
    return { tipo, x, y, opacidad: 1, key: i };
  });

  return (
    <svg viewBox="0 0 360 370" className="mx-auto h-auto w-full max-w-md" role="img" aria-label={`Nefrona esquemática; paso actual: ${TRAMOS[paso]!.nombre}`}>
      <circle cx={70} cy={70} r={30} fill="none" stroke="#94a3b8" strokeWidth={3} />
      <circle cx={70} cy={70} r={20} fill="#7f1d1d" fillOpacity={0.6} />
      <text x={70} y={120} textAnchor="middle" className="fill-slate-400 text-[9px]">
        Glomérulo y
      </text>
      <text x={70} y={131} textAnchor="middle" className="fill-slate-400 text-[9px]">
        cápsula de Bowman
      </text>
      <path d={NEFRONA.d} fill="none" stroke="#334155" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
      {TRAMOS.slice(0, -1).map((_, i) => {
        const [ini, fin] = tramoEn(i);
        const pts = Array.from({ length: 21 }, (_, k) => NEFRONA.en(ini + ((fin - ini) * k) / 20));
        return (
          <polyline
            key={i}
            points={pts.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke={i === paso ? '#fde68a' : '#64748b'}
            strokeOpacity={i === paso ? 0.9 : 0.5}
            strokeWidth={i === paso ? 10 : 8}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}
      {particulas.map((p) => (
        <circle key={p.key} cx={p.x} cy={p.y} r={3.6} fill={COLOR[p.tipo]} opacity={p.opacidad} stroke="#0f172a" strokeWidth={0.6} />
      ))}
      <text x={140} y={30} className="fill-slate-400 text-[9px]">
        Túbulo proximal
      </text>
      <text x={160} y={210} textAnchor="end" className="fill-slate-400 text-[9px]">
        Asa de Henle
      </text>
      <text x={258} y={78} className="fill-slate-400 text-[9px]">
        Túbulo distal
      </text>
      <text x={330} y={220} className="fill-slate-400 text-[9px]" transform="rotate(90 330 220)">
        Túbulo colector
      </text>
      <text x={300} y={366} className="fill-slate-300 text-[10px] font-semibold">
        Orina ↓
      </text>
      <text x={10} y={360} className="fill-slate-500 text-[9px]">
        Médula renal (más concentrada) ↓
      </text>
    </svg>
  );
}

function FlujoTubular() {
  return (
    <figure className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <figcaption className="text-xs font-semibold text-slate-300">Volumen de líquido tubular a lo largo de la nefrona</figcaption>
      <ul className="mt-2 space-y-1.5">
        {TRAMOS.slice(0, -1).map((t, i) => {
          const flujo = flujoTubular(i);
          return (
            <li key={t.id} className="text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>{t.nombre}</span>
                <span className="tabular-nums text-slate-200">{flujo.toFixed(flujo < 10 ? 1 : 0)} ml/min</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded bg-slate-800">
                <div className="h-full rounded bg-sky-400" style={{ width: `${(flujo / TFG_ML_MIN) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-slate-400">
        Al final queda ≈ {Math.round(fraccionRestante('agua', TRAMOS.length - 1) * 100)} % del agua filtrada (con ADH). Valores medios aproximados.
      </p>
    </figure>
  );
}

export default function FiltracionRenal() {
  const reloj = useReloj(1);
  const paso = pasoActual(reloj.t);
  const tramo = TRAMOS[paso]!;
  return (
    <MarcoSimulacion
      titulo="Filtración renal"
      resumen="Recorrido del filtrado por una nefrona: filtración en el glomérulo, reabsorción y secreción en los túbulos y formación de la orina. Cada partícula sigue el destino que le corresponde según las fracciones medias reabsorbidas en cada tramo."
      controles={<Controles reloj={reloj} />}
      visual={
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <Nefrona t={reloj.t} paso={paso} />
            <ul className="mt-1 flex flex-wrap justify-center gap-3 text-[11px] text-slate-400">
              {SUSTANCIAS_ANIMADAS.map((s) => (
                <li key={s} className="flex items-center gap-1">
                  <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLOR[s] }} />
                  {NOMBRE[s]}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-4" aria-live="polite">
              <h2 className="text-lg font-semibold text-amber-200">{tramo.nombre}</h2>
              <p className="mt-1 text-sm text-slate-300">{tramo.texto}</p>
              {Object.keys(tramo.reabsorbe).length > 0 && (
                <p className="mt-2 text-xs text-slate-400">
                  <strong className="text-slate-200">Reabsorbe (de lo filtrado):</strong>{' '}
                  {Object.entries(tramo.reabsorbe)
                    .map(([s, f]) => `${NOMBRE[s as keyof typeof NOMBRE]} ${Math.round((f ?? 0) * 100)} %`)
                    .join(' · ')}
                </p>
              )}
              {tramo.secreta && (
                <p className="mt-1 text-xs text-slate-400">
                  <strong className="text-slate-200">Secreta:</strong> {tramo.secreta}
                </p>
              )}
            </article>
            <FlujoTubular />
          </div>
        </div>
      }
      lateral={
        <Pasos
          pasos={TRAMOS.map((t) => ({ id: t.id, titulo: t.nombre, texto: t.texto }))}
          activo={tramo.id}
          onElegir={(id) => {
            const i = TRAMOS.findIndex((t) => t.id === id);
            const ciclo = TRAMOS.length * DURACION_PASO;
            reloj.setT(Math.floor(reloj.t / ciclo) * ciclo + i * DURACION_PASO + 0.01);
          }}
        />
      }
    />
  );
}
