import { Fragment, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF, Outlines } from '@react-three/drei';
import { createPortal, useThree, type ThreeEvent } from '@react-three/fiber';
import { POR_ID, POR_NODO, urlModelo } from '@/data/catalogo';
import type { SistemaId } from '@/data/sistemas';
import { useAtlasStore } from '@/store/useAtlasStore';
import { claveRegion, desplazamientosExplosion } from './escena';
import { COLOR_HOVER, COLOR_SELECCION, PLANO_CORTE } from './recursos';

interface EntradaRegistro {
  nodo: THREE.Object3D;
  mallas: THREE.Mesh[];
  posicionOriginal: THREE.Vector3;
}

interface Materiales {
  base: THREE.MeshStandardMaterial;
  seleccion: THREE.MeshStandardMaterial;
  hover: THREE.MeshStandardMaterial;
}

/**
 * Recorre la escena del .glb y asocia cada nodo con nombre de estructura a sus mallas.
 * Se ejecuta una vez por escena (useGLTF la cachea por URL).
 */
function construirRegistro(escena: THREE.Object3D, sistema: SistemaId) {
  const registro = new Map<string, EntradaRegistro>();
  const materiales = new Map<THREE.Material, Materiales>();

  escena.traverse((obj) => {
    const id = POR_NODO.get(obj.name);
    if (!id || registro.has(id)) return;
    const mallas: THREE.Mesh[] = [];
    obj.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) {
        const malla = m as THREE.Mesh;
        malla.userData.estructura = id;
        malla.userData.sistema = sistema;
        mallas.push(malla);
      }
    });
    registro.set(id, { nodo: obj, mallas, posicionOriginal: obj.position.clone() });
  });

  for (const { mallas } of registro.values()) {
    for (const m of mallas) {
      const base = m.material as THREE.MeshStandardMaterial;
      if (!materiales.has(base)) {
        const seleccion = base.clone();
        seleccion.emissive = new THREE.Color(COLOR_SELECCION);
        seleccion.emissiveIntensity = 0.35;
        const hover = base.clone();
        hover.emissive = new THREE.Color(COLOR_HOVER);
        hover.emissiveIntensity = 0.25;
        materiales.set(base, { base, seleccion, hover });
      }
      m.userData.materiales = materiales.get(base);
    }
  }
  return { registro, materiales: [...materiales.values()] };
}

/** Por debajo de esta opacidad un sistema no captura clics ni hover: se selecciona lo que hay detrás. */
export const OPACIDAD_MINIMA_SELECCION = 0.35;

/** Grosor del contorno de selección, en metros. */
const GROSOR_CONTORNO = 0.0025;

/** ¿El punto queda en la parte visible del plano de corte? */
const visibleTrasCorte = (p: THREE.Vector3, corteActivo: boolean) => !corteActivo || PLANO_CORTE.distanceToPoint(p) >= 0;

function ancestrosVisibles(obj: THREE.Object3D | null): boolean {
  for (let o = obj; o; o = o.parent) if (!o.visible) return false;
  return true;
}

/**
 * Carga diferida (Suspense) del .glb de un sistema, comprimido con meshopt,
 * y aplica sobre él el estado del visor.
 */
export default function ModeloSistema({ sistema }: { sistema: SistemaId }) {
  const { scene } = useGLTF(urlModelo(sistema), false, true);
  const invalidate = useThree((s) => s.invalidate);
  const { registro, materiales } = useMemo(() => construirRegistro(scene, sistema), [scene, sistema]);

  const visible = useAtlasStore((s) => s.sistemasVisibles[sistema]);
  const opacidad = useAtlasStore((s) => s.opacidad[sistema]);
  const seleccion = useAtlasStore((s) => s.seleccion);
  const hover = useAtlasStore((s) => s.hover);
  const ocultas = useAtlasStore((s) => s.ocultas);
  const aislar = useAtlasStore((s) => s.aislar);
  const corteActivo = useAtlasStore((s) => s.corte.activo);
  const explosion = useAtlasStore((s) => s.explosion);
  const seleccionar = useAtlasStore((s) => s.seleccionar);
  const setHover = useAtlasStore((s) => s.setHover);

  // Visibilidad por estructura y material (normal / hover / selección).
  useEffect(() => {
    const ocultasSet = new Set(ocultas);
    for (const [id, { nodo, mallas }] of registro) {
      nodo.visible = !ocultasSet.has(id) && (!aislar || id === seleccion);
      for (const m of mallas) {
        const mats = m.userData.materiales as Materiales;
        m.material = id === seleccion ? mats.seleccion : id === hover ? mats.hover : mats.base;
      }
    }
    invalidate();
  }, [registro, ocultas, aislar, seleccion, hover, invalidate]);

  // Opacidad del sistema y planos de corte (compartidos por todos sus materiales).
  useEffect(() => {
    const op = opacidad ?? 1;
    for (const grupo of materiales) {
      for (const mat of [grupo.base, grupo.seleccion, grupo.hover]) {
        mat.transparent = op < 1;
        mat.opacity = op;
        mat.depthWrite = op >= 0.999;
        mat.clippingPlanes = corteActivo ? [PLANO_CORTE] : [];
        // Con corte se ve el interior hueco de la malla en lugar de un agujero.
        mat.side = corteActivo ? THREE.DoubleSide : THREE.FrontSide;
        mat.needsUpdate = true;
      }
    }
    invalidate();
  }, [materiales, opacidad, corteActivo, invalidate]);

  // Modo explosión: desplaza las piezas de la región respecto a su posición original.
  useEffect(() => {
    const desp = desplazamientosExplosion(sistema, explosion.region, explosion.factor);
    for (const [id, { nodo, posicionOriginal }] of registro) {
      const d = desp.get(id);
      nodo.position.copy(posicionOriginal);
      if (d) nodo.position.add(new THREE.Vector3(...d));
    }
    invalidate();
  }, [registro, sistema, explosion.region, explosion.factor, invalidate]);

  /**
   * Primera intersección válida entre todos los sistemas: visible, no recortada y de un sistema
   * con opacidad suficiente (así se puede seleccionar un hueso a través de músculos translúcidos).
   */
  const primerImpacto = (e: ThreeEvent<PointerEvent | MouseEvent>): string | null => {
    const opacidades = useAtlasStore.getState().opacidad;
    for (const i of e.intersections) {
      const id = i.object.userData.estructura as string | undefined;
      const sis = i.object.userData.sistema as SistemaId | undefined;
      if (!id || !sis || (opacidades[sis] ?? 1) < OPACIDAD_MINIMA_SELECCION) continue;
      if (ancestrosVisibles(i.object) && visibleTrasCorte(i.point, corteActivo)) return id;
    }
    return null;
  };

  const seleccionada = seleccion ? registro.get(seleccion) : undefined;

  return (
    <group
      visible={visible}
      onPointerMove={(e) => {
        if (!visible) return;
        e.stopPropagation();
        setHover(primerImpacto(e));
      }}
      onPointerOut={() => setHover(null)}
      onClick={(e) => {
        if (!visible || e.delta > 5) return; // ignora el clic al terminar un arrastre
        e.stopPropagation();
        const id = primerImpacto(e);
        const e2 = id ? POR_ID.get(id) : undefined;
        if (id && e2) seleccionar(id, { enfocar: true, region: claveRegion(e2.sistema, e2.region) });
      }}
    >
      <primitive object={scene} />
      {/* El contorno se monta como hijo de cada malla seleccionada (portal), así sigue sus transformaciones. */}
      {/* Grosor fijo en el mundo; se divide por la escala del nodo porque las mallas están cuantizadas. */}
      {seleccionada?.mallas.map((m) => (
        <Fragment key={m.uuid}>
          {createPortal(
            <Outlines
              thickness={GROSOR_CONTORNO / m.getWorldScale(new THREE.Vector3()).x}
              angle={0}
              color={COLOR_SELECCION}
              clippingPlanes={corteActivo ? [PLANO_CORTE] : []}
            />,
            m,
          )}
        </Fragment>
      ))}
    </group>
  );
}
