import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { POR_ID, sistemaTieneModelo } from '@/data/catalogo';
import { SISTEMAS, type SistemaId } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';
import ControlCamara from './ControlCamara';
import ModeloSistema from './ModeloSistema';
import Pines from './Pines';
import PlanoCorte from './PlanoCorte';
import BarraCarga from './ui/BarraCarga';

const SISTEMAS_CON_MODELO = SISTEMAS.map((s) => s.id).filter(sistemaTieneModelo);

/**
 * Lienzo 3D del atlas. Unidades: metros; +Y arriba, +Z anterior, −X derecha del paciente.
 * Rendimiento: render bajo demanda (solo cuando algo cambia), sin sombras y con dpr limitado.
 */
export default function Visor() {
  const visibles = useAtlasStore((s) => s.sistemasVisibles);
  const hoverReal = useAtlasStore((s) => s.hover);
  const modoQuiz = useAtlasStore((s) => s.modoQuiz);
  // En modo quiz no se muestra el nombre al pasar el ratón.
  const hover = modoQuiz ? null : hoverReal;
  const etiqueta = useRef<HTMLDivElement>(null);
  const sistemas = SISTEMAS_CON_MODELO.filter((s) => visibles[s]);

  // Carga diferida: un sistema se descarga la primera vez que se hace visible y después
  // permanece montado (oculto) para no volver a cargarlo.
  const [cargados, setCargados] = useState<SistemaId[]>([]);
  const claveVisibles = sistemas.join(',');
  useEffect(() => {
    setCargados((prev) => (sistemas.every((s) => prev.includes(s)) ? prev : [...new Set([...prev, ...sistemas])]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveVisibles]);

  return (
    <div
      className="absolute inset-0"
      onPointerMove={(e) => {
        // La etiqueta de hover sigue al puntero sin re-renderizar React.
        const el = etiqueta.current;
        if (!el) return;
        const r = e.currentTarget.getBoundingClientRect();
        el.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
      }}
      style={{ cursor: hoverReal ? 'pointer' : 'grab' }}
    >
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0.9, 3], fov: 35, near: 0.01, far: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        aria-label="Modelo 3D del cuerpo humano"
      >
        <color attach="background" args={['#020617']} />
        <hemisphereLight args={['#f1f5f9', '#1e293b', 1.3]} />
        <directionalLight position={[1.5, 3, 2.5]} intensity={1.6} />
        <directionalLight position={[-2, 1.5, -2]} intensity={0.6} />
        <Grid
          args={[10, 10]}
          cellSize={0.1}
          sectionSize={1}
          cellColor="#1e293b"
          sectionColor="#334155"
          fadeDistance={8}
          infiniteGrid
        />
        {cargados.map((s) => (
          <Suspense key={s} fallback={null}>
            <ModeloSistema sistema={s} />
          </Suspense>
        ))}
        {!modoQuiz && <Pines />}
        <PlanoCorte sistemas={sistemas.length ? sistemas : SISTEMAS_CON_MODELO} />
        <ControlCamara sistemas={sistemas.length ? sistemas : SISTEMAS_CON_MODELO} />
      </Canvas>

      <div
        ref={etiqueta}
        role="tooltip"
        className={`pointer-events-none absolute left-0 top-0 z-10 rounded-md border border-slate-700 bg-slate-950/90 px-2 py-1 text-xs text-slate-100 shadow ${
          hover ? '' : 'hidden'
        }`}
      >
        {hover ? POR_ID.get(hover)?.nombre : null}
      </div>
      <BarraCarga />
    </div>
  );
}
