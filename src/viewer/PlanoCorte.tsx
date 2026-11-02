import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { SistemaId } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';
import { EJE_INDICE, cajaDeSistemas, centroCaja, planoCorte } from './escena';
import { PLANO_CORTE } from './recursos';

/** Mantiene sincronizado el plano de corte compartido y dibuja un indicador translúcido. */
export default function PlanoCorte({ sistemas }: { sistemas: readonly SistemaId[] }) {
  const corte = useAtlasStore((s) => s.corte);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    gl.localClippingEnabled = corte.activo;
    const { normal, constante } = planoCorte(corte.eje, corte.posicion, corte.invertir);
    PLANO_CORTE.normal.set(...normal);
    PLANO_CORTE.constant = constante;
    invalidate();
  }, [gl, corte, invalidate]);

  const caja = cajaDeSistemas(sistemas);
  if (!corte.activo || !caja) return null;

  // Cuadrado translúcido del tamaño del cuerpo, orientado según el plano anatómico.
  const centro = centroCaja(caja);
  const k = EJE_INDICE[corte.eje];
  const posicion = [...centro] as [number, number, number];
  posicion[k] = corte.posicion;
  const tam = Math.max(...[0, 1, 2].map((i) => caja.max[i]! - caja.min[i]!)) * 1.1;
  const rotacion: [number, number, number] =
    corte.eje === 'sagital' ? [0, Math.PI / 2, 0] : corte.eje === 'transversal' ? [-Math.PI / 2, 0, 0] : [0, 0, 0];

  return (
    <mesh position={posicion} rotation={rotacion} raycast={() => null} renderOrder={10}>
      <planeGeometry args={[tam, tam]} />
      <meshBasicMaterial color="#d6b26a" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}
