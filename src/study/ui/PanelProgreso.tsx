import { conceptos } from '../conceptos';
import { dificiles, dominioPorSistema, mejorRacha, pendientes, racha, useProgresoStore } from '../progreso';
import { fechaLocal } from '../sm2';
import { SISTEMAS_POR_ID } from '@/data/sistemas';

/** Resumen del progreso: racha, repasos pendientes, dominio por sistema y estructuras difíciles. */
export default function PanelProgreso() {
  const tarjetas = useProgresoStore((s) => s.tarjetas);
  const dias = useProgresoStore((s) => s.diasActivos);
  const hoy = fechaLocal();
  const dominio = dominioPorSistema(tarjetas);
  const listaDificiles = dificiles(tarjetas, 8);
  const nPendientes = pendientes(tarjetas, hoy).length;
  const vistos = Object.keys(tarjetas).length;

  const tarjeta = (titulo: string, valor: string | number, pie?: string) => (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-50">{valor}</p>
      {pie && <p className="text-xs text-slate-500">{pie}</p>}
    </div>
  );

  return (
    <section aria-labelledby="progreso-titulo" className="space-y-4">
      <h2 id="progreso-titulo" className="text-xl font-semibold">
        Tu progreso
      </h2>
      <div className="grid gap-3 sm:grid-cols-4">
        {tarjeta('Racha', `${racha(dias, hoy)} ${racha(dias, hoy) === 1 ? 'día' : 'días'}`, `Mejor racha: ${mejorRacha(dias)}`)}
        {tarjeta('Repasos para hoy', nPendientes, 'según la repetición espaciada')}
        {tarjeta('Estructuras estudiadas', vistos, `de ${conceptos().size} conceptos`)}
        {tarjeta('Dominadas', dominio.reduce((s, d) => s + d.dominados, 0), 'dos aciertos seguidos o más')}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-semibold text-slate-300">Dominio por sistema</h3>
          <ul className="mt-3 space-y-2">
            {dominio.map((d) => {
              const sis = SISTEMAS_POR_ID[d.sistema];
              const pct = Math.round(d.porcentaje * 100);
              return (
                <li key={d.sistema} className="text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{sis.nombre}</span>
                    <span className="tabular-nums">
                      {pct} % · {d.dominados}/{d.total}
                    </span>
                  </div>
                  <div
                    className="mt-1 h-2 overflow-hidden rounded bg-slate-800"
                    role="progressbar"
                    aria-label={`Dominio del sistema ${sis.nombre}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                  >
                    <div className="h-full rounded" style={{ width: `${Math.max(pct, d.vistos ? 1 : 0)}%`, backgroundColor: sis.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-semibold text-slate-300">Estructuras difíciles</h3>
          {listaDificiles.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Aún no hay fallos registrados. Cuando falles alguna estructura aparecerá aquí.</p>
          ) : (
            <ol className="mt-3 space-y-1.5 text-sm">
              {listaDificiles.map(({ id, tarjeta: t, tasaFallo }) => (
                <li key={id} className="flex items-center justify-between gap-2">
                  <span className="text-slate-200">{conceptos().get(id)?.nombre ?? id}</span>
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">
                    {Math.round(tasaFallo * 100)} % fallos · repaso {t.proxima <= hoy ? 'hoy' : t.proxima}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
