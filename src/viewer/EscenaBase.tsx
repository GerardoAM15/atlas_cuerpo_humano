import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import ModeloSistema from './ModeloSistema';

/**
 * Escena mínima para validar el stack (three + r3f + drei) y la salida del pipeline.
 * Unidades de la escena: 1 = 1 metro; el cuerpo mide ~1,7 m con el centro en y ≈ 0,9.
 * Sombras desactivadas por defecto (objetivo: 60 FPS sin GPU dedicada).
 */
export default function EscenaBase() {
  // r3f fija en línea `position: relative; height: 100%` en el Canvas, así que es el
  // contenedor absoluto el que le da un tamaño definido.
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 1, 3], fov: 40, near: 0.01, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#020617']} />
        <hemisphereLight args={['#e2e8f0', '#1e293b', 1.2]} />
        <directionalLight position={[2, 4, 3]} intensity={1.5} />
        <Grid
          args={[10, 10]}
          cellSize={0.1}
          sectionSize={1}
          cellColor="#1e293b"
          sectionColor="#334155"
          fadeDistance={8}
          infiniteGrid
        />
        <Suspense fallback={null}>
          <ModeloSistema sistema="esqueletico" />
        </Suspense>
        <OrbitControls target={[0, 0.9, 0]} enableDamping makeDefault />
      </Canvas>
    </div>
  );
}
