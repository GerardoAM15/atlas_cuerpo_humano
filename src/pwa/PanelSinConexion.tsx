import { useEffect, useRef, useState } from 'react';
import { SISTEMAS_POR_ID, type SistemaId } from '@/data/sistemas';
import { descargarModelos, modelosDescargables, modelosGuardados, pedirAlmacenamientoPersistente, type Progreso } from './descargas';
import { usePwaStore } from './estado';

const mb = (bytes: number) => `${(bytes / 1_048_576).toFixed(1).replace('.', ',')} MB`;

type Estado = { tipo: 'inactivo' } | { tipo: 'descargando'; progreso: Progreso } | { tipo: 'hecho' } | { tipo: 'error'; mensaje: string };

/** Estado offline de la app y botón para descargar todos los modelos 3D. */
export default function PanelSinConexion() {
  const soportado = usePwaStore((s) => s.soportado);
  const listaOffline = usePwaStore((s) => s.listaOffline);
  const [guardados, setGuardados] = useState<Set<SistemaId> | null>(null);
  const [estado, setEstado] = useState<Estado>({ tipo: 'inactivo' });
  const cancelar = useRef<AbortController | null>(null);
  const modelos = modelosDescargables();
  const bytesTotales = modelos.reduce((s, m) => s + m.bytes, 0);
  const disponible = soportado && typeof caches !== 'undefined';

  const actualizarGuardados = () => {
    if (!disponible) return;
    modelosGuardados(modelos)
      .then(setGuardados)
      .catch(() => setGuardados(new Set()));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(actualizarGuardados, [disponible]);
  useEffect(() => () => cancelar.current?.abort(), []);

  const descargar = async () => {
    const control = new AbortController();
    cancelar.current = control;
    setEstado({ tipo: 'descargando', progreso: { bytes: 0, bytesTotales, guardados: 0, total: modelos.length, actual: null } });
    void pedirAlmacenamientoPersistente();
    try {
      // La app en sí la precachea el service worker: se espera a que esté activo.
      await navigator.serviceWorker.ready;
      await descargarModelos((progreso) => setEstado({ tipo: 'descargando', progreso }), control.signal, modelos);
      setEstado({ tipo: 'hecho' });
    } catch (e) {
      setEstado(
        control.signal.aborted
          ? { tipo: 'inactivo' }
          : { tipo: 'error', mensaje: navigator.onLine === false ? 'No hay conexión a internet.' : e instanceof Error ? e.message : String(e) },
      );
    } finally {
      cancelar.current = null;
      actualizarGuardados();
    }
  };

  const nGuardados = guardados?.size ?? 0;
  const bytesGuardados = modelos.filter((m) => guardados?.has(m.sistema)).reduce((s, m) => s + m.bytes, 0);
  const completo = guardados !== null && nGuardados === modelos.length;

  return (
    <section aria-labelledby="sin-conexion" className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h2 id="sin-conexion" className="text-lg font-semibold">
        Usar sin conexión
      </h2>
      {!disponible ? (
        <p className="mt-2 text-sm text-slate-400">Este navegador no permite guardar la app para usarla sin conexión.</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-400">
            {listaOffline ? 'La aplicación ya funciona sin internet.' : 'Preparando la aplicación para funcionar sin internet…'} Los modelos 3D se
            guardan al abrir cada sistema; también puedes descargarlos todos ahora ({mb(bytesTotales)}).
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Modelos guardados: {guardados === null ? '…' : `${nGuardados} de ${modelos.length} sistemas (${mb(bytesGuardados)})`}
          </p>

          {estado.tipo === 'descargando' ? (
            <div className="mt-3 space-y-2" aria-live="polite">
              <div
                role="progressbar"
                aria-label="Descarga de los modelos 3D"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((estado.progreso.bytes / estado.progreso.bytesTotales) * 100)}
                className="h-2.5 overflow-hidden rounded bg-slate-800"
              >
                <div className="h-full rounded bg-sky-400 transition-[width]" style={{ width: `${(estado.progreso.bytes / estado.progreso.bytesTotales) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                  {estado.progreso.actual ? `Descargando ${SISTEMAS_POR_ID[estado.progreso.actual].nombre.toLowerCase()}… ` : 'Comprobando… '}
                  {mb(estado.progreso.bytes)} de {mb(estado.progreso.bytesTotales)} · {Math.round((estado.progreso.bytes / estado.progreso.bytesTotales) * 100)} %
                </span>
                <button type="button" onClick={() => cancelar.current?.abort()} className="rounded border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-800">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={descargar}
                disabled={completo}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-default disabled:opacity-50"
              >
                {completo ? 'Todo descargado' : 'Descargar todo para usar sin internet'}
              </button>
              {estado.tipo === 'hecho' && (
                <p role="status" className="text-sm text-emerald-300">
                  Listo: el atlas completo funciona sin conexión.
                </p>
              )}
              {estado.tipo === 'error' && (
                <p role="alert" className="text-sm text-red-300">
                  No se pudo completar la descarga. {estado.mensaje}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
