import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { cajaDe } from '@/data/catalogo';
import type { SistemaId } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';
import { DIRECCION_VISTA, cajaDeSistemas, centroCaja, distanciaEncuadre } from './escena';

/** Cámara orbital con transiciones suaves que ejecuta los comandos del store (vistas, enfocar, reiniciar). */
export default function ControlCamara({ sistemas }: { sistemas: readonly SistemaId[] }) {
  const ref = useRef<CameraControls>(null);
  const comando = useAtlasStore((s) => s.comandoCamara);
  const camara = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const aspecto = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const clave = sistemas.join(',');

  // Encuadre inicial del cuerpo completo (sin animación).
  useEffect(() => {
    encuadrarCuerpo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(() => {
    const cc = ref.current;
    if (!cc || !comando) return;
    if (comando.tipo === 'reiniciar') {
      encuadrarCuerpo(true);
    } else if (comando.tipo === 'enfocar') {
      const c = cajaDe(comando.id);
      if (!c) return;
      const caja = new THREE.Box3(new THREE.Vector3(...c.min), new THREE.Vector3(...c.max));
      const tam = caja.getSize(new THREE.Vector3()).length();
      // Margen proporcional, con mínimo para que los huesos pequeños no llenen la pantalla.
      const margen = Math.max(tam * 0.6, 0.06);
      void cc.fitToBox(caja, true, { paddingTop: margen, paddingBottom: margen, paddingLeft: margen, paddingRight: margen });
    } else {
      // Vista rápida: misma distancia y objetivo, nueva dirección.
      const objetivo = cc.getTarget(new THREE.Vector3());
      const d = DIRECCION_VISTA[comando.vista];
      const dist = cc.distance;
      void cc.setLookAt(objetivo.x + d[0] * dist, objetivo.y + d[1] * dist, objetivo.z + d[2] * dist, objetivo.x, objetivo.y, objetivo.z, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comando]);

  function encuadrarCuerpo(animar: boolean) {
    const cc = ref.current;
    const caja = cajaDeSistemas(sistemas);
    if (!cc || !caja) return;
    const [cx, cy, cz] = centroCaja(caja);
    const dist = distanciaEncuadre(caja, camara.fov, aspecto);
    void cc.setLookAt(cx, cy, cz + dist, cx, cy, cz, animar);
  }

  return <CameraControls ref={ref} makeDefault minDistance={0.05} maxDistance={8} smoothTime={0.35} dollyToCursor />;
}
