import { useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { CameraControls } from '@react-three/drei';

/**
 * Medidor de rendimiento. Con `frameloop="demand"` el lienzo solo se dibuja al interactuar, así
 * que mientras está activo fuerza el render continuo y gira la cámara (como al arrastrar el modelo).
 * Escribe el resultado directamente en el DOM (`salida`) para no re-renderizar React cada segundo.
 */
export default function MedidorFps({ salida }: { salida: RefObject<HTMLElement> }) {
  const controles = useThree((s) => s.controls) as CameraControls | null;
  const gl = useThree((s) => s.gl);
  const medida = useRef({ fotogramas: 0, desde: performance.now() });

  useFrame((estado, delta) => {
    controles?.rotate(delta * 0.5, 0, false);
    estado.invalidate();
    const m = medida.current;
    m.fotogramas++;
    const ahora = performance.now();
    if (ahora - m.desde >= 1000 && salida.current) {
      const fps = (m.fotogramas * 1000) / (ahora - m.desde);
      const { triangles, calls } = gl.info.render;
      salida.current.textContent = `${fps.toFixed(0)} FPS · ${(triangles / 1e6).toFixed(2).replace('.', ',')} M triángulos · ${calls} llamadas de dibujo`;
      salida.current.dataset.fps = fps.toFixed(1);
      m.fotogramas = 0;
      m.desde = ahora;
    }
  });
  return null;
}
