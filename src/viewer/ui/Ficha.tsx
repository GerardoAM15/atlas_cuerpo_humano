import type { ReactNode } from 'react';
import { MANIFEST, POR_ID } from '@/data/catalogo';
import { nombreRegion } from '@/data/regiones';
import { SISTEMAS_POR_ID } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';

const CLASIFICACION: Record<string, string> = {
  largo: 'Hueso largo',
  corto: 'Hueso corto',
  plano: 'Hueso plano',
  irregular: 'Hueso irregular',
  sesamoideo: 'Hueso sesamoideo',
  neumatico: 'Neumático',
};
const TIPO: Record<string, string> = { hueso: 'Hueso', cartilago: 'Cartílago', musculo: 'Músculo' };

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</h3>
      <div className="mt-1 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

function Enlace({ id }: { id: string }) {
  const seleccionar = useAtlasStore((s) => s.seleccionar);
  const e = POR_ID.get(id);
  if (!e) return null;
  return (
    <button
      type="button"
      onClick={() => seleccionar(id, { enfocar: e.nodoModelo !== null, region: e.region })}
      className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-sky-300 hover:bg-slate-700"
    >
      {e.nombre}
    </button>
  );
}

/** Ficha de la estructura seleccionada. */
export default function Ficha({ onCerrar }: { onCerrar?: () => void }) {
  const seleccion = useAtlasStore((s) => s.seleccion);
  const aislar = useAtlasStore((s) => s.aislar);
  const seleccionar = useAtlasStore((s) => s.seleccionar);
  const enfocar = useAtlasStore((s) => s.enfocar);
  const ocultar = useAtlasStore((s) => s.ocultarEstructura);
  const setAislar = useAtlasStore((s) => s.setAislar);
  const e = seleccion ? POR_ID.get(seleccion) : undefined;
  if (!e) return null;

  const pendiente = e.nodoModelo === null;
  const motivo = MANIFEST.sistemas[e.sistema]?.estructuras.find((m) => m.id === e.id);
  const relacionesSinArticular =
    'articulaciones' in e && e.articulaciones
      ? e.relaciones.filter((r) => !e.articulaciones!.some((a) => a.con.includes(r)))
      : e.relaciones;

  return (
    <article aria-labelledby="ficha-titulo" className="p-4">
      <header className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-xs text-slate-500">
            {SISTEMAS_POR_ID[e.sistema].nombre} › {nombreRegion(e.sistema, e.region)}
          </p>
          <h2 id="ficha-titulo" className="mt-0.5 text-xl font-bold leading-tight text-slate-50">
            {e.nombre}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            <i lang="la">{e.latin}</i> · <span lang="en">{e.ingles}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            seleccionar(null);
            onCerrar?.();
          }}
          aria-label="Cerrar ficha"
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </header>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{TIPO[e.tipo] ?? e.tipo}</span>
        {e.tipo === 'hueso' &&
          e.clasificacion.map((c) => (
            <span key={c} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {CLASIFICACION[c] ?? c}
            </span>
          ))}
      </div>

      {pendiente ? (
        <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
          Sin modelo 3D. {motivo?.estado === 'pendiente' ? motivo.motivo : ''}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => enfocar(e.id)} className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400">
            Enfocar
          </button>
          <button
            type="button"
            onClick={() => setAislar(!aislar)}
            aria-pressed={aislar}
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${aislar ? 'border-sky-400 text-sky-300' : 'border-slate-700 text-slate-200 hover:bg-slate-800'}`}
          >
            {aislar ? 'Mostrar todo' : 'Aislar'}
          </button>
          <button type="button" onClick={() => ocultar(e.id)} className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800">
            Ocultar
          </button>
        </div>
      )}

      {e.revisar && (
        <p className="mt-3 rounded-md border border-orange-500/30 bg-orange-500/10 p-2 text-xs text-orange-200">
          <strong>Pendiente de revisión:</strong> {e.revisar}
        </p>
      )}

      <Seccion titulo="Descripción">{e.descripcion}</Seccion>
      <Seccion titulo="Función">{e.funcion}</Seccion>
      <Seccion titulo="Ubicación">{e.ubicacion}</Seccion>

      {'articulaciones' in e && e.articulaciones && e.articulaciones.length > 0 && (
        <Seccion titulo="Articulaciones">
          <ul className="space-y-2">
            {e.articulaciones.map((a) => (
              <li key={a.nombre + a.con.join()}>
                <p className="text-slate-200">
                  {a.nombre} <span className="text-xs text-slate-500">({a.tipo})</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {a.con.map((id) => (
                    <Enlace key={id} id={id} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {relacionesSinArticular.length > 0 && (
        <Seccion titulo="Relacionado con">
          <div className="flex flex-wrap gap-1">
            {relacionesSinArticular.map((id) => (
              <Enlace key={id} id={id} />
            ))}
          </div>
        </Seccion>
      )}

      <Seccion titulo="Datos clínicos">{e.datosClinicos}</Seccion>
      {e.curiosidad && <Seccion titulo="Curiosidad">{e.curiosidad}</Seccion>}

      {!pendiente && motivo?.estado === 'disponible' && (
        <p className="mt-4 text-[11px] text-slate-600">
          Modelo: BodyParts3D · {motivo.fma.join(', ')}
        </p>
      )}
    </article>
  );
}
