import { Html } from '@react-three/drei';
import { centroDe } from '@/data/catalogo';
import { useAtlasStore } from '@/store/useAtlasStore';
import { desplazamientosExplosion, pinesDeRegion } from './escena';

/** Pines numerados tipo atlas en el centro de cada estructura de la región activa. */
export default function Pines() {
  const etiquetas = useAtlasStore((s) => s.etiquetas);
  const region = useAtlasStore((s) => s.regionActiva);
  const seleccion = useAtlasStore((s) => s.seleccion);
  const ocultas = useAtlasStore((s) => s.ocultas);
  const explosion = useAtlasStore((s) => s.explosion);
  const seleccionar = useAtlasStore((s) => s.seleccionar);

  if (!etiquetas) return null;
  const pines = pinesDeRegion(region, seleccion);
  const sistema = pines[0]?.sistema;
  const desp = sistema ? desplazamientosExplosion(sistema, explosion.region, explosion.factor) : new Map();

  return (
    <>
      {pines.map((e, i) => {
        const c = centroDe(e.id);
        if (!c || ocultas.includes(e.id)) return null;
        const d = desp.get(e.id) ?? [0, 0, 0];
        const activo = e.id === seleccion;
        return (
          <Html key={e.id} position={[c[0] + d[0], c[1] + d[1], c[2] + d[2]]} center zIndexRange={[20, 0]}>
            <button
              type="button"
              onClick={() => seleccionar(e.id, { enfocar: true, sistema: e.sistema })}
              title={e.nombre}
              aria-label={`${i + 1}. ${e.nombre}`}
              className={`flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[10px] font-bold shadow ${
                activo ? 'border-sky-200 bg-sky-500 text-slate-950' : 'border-slate-900 bg-amber-300 text-slate-950 hover:bg-amber-200'
              }`}
            >
              {i + 1}
            </button>
          </Html>
        );
      })}
    </>
  );
}
