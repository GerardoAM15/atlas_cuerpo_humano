import { useGLTF } from '@react-three/drei';
import type { SistemaId } from '@/data/sistemas';

/** URL de un modelo de /public/models, relativa a la base de Vite (funciona en GitHub Pages). */
export const urlModelo = (sistema: SistemaId) => `${import.meta.env.BASE_URL}models/${sistema}.glb`;

/**
 * Carga diferida del .glb de un sistema (comprimido con meshopt).
 * Debe usarse dentro de <Suspense>.
 */
export default function ModeloSistema({ sistema }: { sistema: SistemaId }) {
  // useGLTF(url, draco = false, meshopt = true)
  const { scene } = useGLTF(urlModelo(sistema), false, true);
  return <primitive object={scene} />;
}
