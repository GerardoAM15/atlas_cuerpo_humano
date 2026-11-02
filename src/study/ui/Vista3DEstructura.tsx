import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { urlModelo } from '@/data/catalogo';
import type { ResumenEstructura } from '@/data/esquemas';

/**
 * Copia aislada de una estructura del modelo del sistema, centrada y con materiales propios
 * (para no alterar los del visor principal, que comparten la caché de useGLTF).
 */
function Pieza({ e }: { e: ResumenEstructura }) {
  const { scene } = useGLTF(urlModelo(e.sistema), false, true);
  const { objeto, distancia } = useMemo(() => {
    scene.updateMatrixWorld(true);
    const original = scene.getObjectByName(e.nodoModelo ?? '');
    const grupo = new THREE.Group();
    if (!original) return { objeto: grupo, distancia: 1 };
    const copia = original.clone(true);
    copia.matrixAutoUpdate = false;
    copia.matrix.copy(original.matrixWorld);
    copia.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const base = m.material as THREE.MeshStandardMaterial;
        m.material = new THREE.MeshStandardMaterial({ color: base.color, roughness: 0.6, transparent: false, side: THREE.DoubleSide });
      }
    });
    grupo.add(copia);
    grupo.updateMatrixWorld(true);
    const caja = new THREE.Box3().setFromObject(grupo);
    const centro = caja.getCenter(new THREE.Vector3());
    const tam = caja.getSize(new THREE.Vector3()).length();
    copia.matrix.premultiply(new THREE.Matrix4().makeTranslation(-centro.x, -centro.y, -centro.z));
    return { objeto: grupo, distancia: Math.max(tam * 1.4, 0.05) };
  }, [scene, e.nodoModelo]);

  return (
    <>
      <primitive object={objeto} />
      <OrbitControls makeDefault autoRotate autoRotateSpeed={1.5} enablePan={false} minDistance={distancia * 0.3} maxDistance={distancia * 4} />
      <PosicionCamara distancia={distancia} />
    </>
  );
}

/** Coloca la cámara del lienzo a la distancia adecuada para el tamaño de la pieza. */
function PosicionCamara({ distancia }: { distancia: number }) {
  const camara = useThree((s) => s.camera);
  useEffect(() => {
    camara.position.set(distancia * 0.2, distancia * 0.15, distancia);
    camara.lookAt(0, 0, 0);
  }, [camara, distancia]);
  return null;
}

/** Vista 3D de una sola estructura, que se puede girar (la usan las flashcards). */
export default function Vista3DEstructura({ e }: { e: ResumenEstructura }) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg bg-slate-950 sm:h-80">
      <Canvas camera={{ position: [0, 0, 0.4], fov: 35, near: 0.001, far: 20 }} dpr={[1, 1.75]} aria-label="Estructura en 3D">
        <color attach="background" args={['#020617']} />
        <hemisphereLight args={['#f1f5f9', '#1e293b', 1.4]} />
        <directionalLight position={[1, 2, 3]} intensity={1.6} />
        <Suspense fallback={null}>
          <Pieza key={e.id} e={e} />
        </Suspense>
      </Canvas>
    </div>
  );
}
