// Cálculos puros del visor (sin React ni WebGL): cajas, planos de corte, vistas, explosión y pines.
import { POR_ID, cajaDe, centroDe, estructurasDe } from '@/data/catalogo';
import type { Caja, ResumenEstructura } from '@/data/esquemas';
import type { SistemaId } from '@/data/sistemas';
import type { EjeCorte, Vista } from '@/store/useAtlasStore';

type V3 = [number, number, number];

export function unirCajas(cajas: readonly Caja[]): Caja | null {
  if (!cajas.length) return null;
  const min: V3 = [Infinity, Infinity, Infinity];
  const max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const c of cajas) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k]!, c.min[k]!);
      max[k] = Math.max(max[k]!, c.max[k]!);
    }
  }
  return { min, max };
}

/** Caja de todas las estructuras con modelo de los sistemas indicados. */
export function cajaDeSistemas(sistemas: readonly SistemaId[]): Caja | null {
  return unirCajas(
    sistemas.flatMap((s) => estructurasDe(s).map((e) => cajaDe(e.id)).filter((c): c is Caja => c !== null)),
  );
}

/** Índice del eje de coordenadas que corta cada plano anatómico. */
export const EJE_INDICE: Record<EjeCorte, 0 | 1 | 2> = { sagital: 0, transversal: 1, coronal: 2 };

/**
 * Plano de corte como (normal, constante) en el convenio de THREE.Plane:
 * se conserva lo que cumple normal·p + constante ≥ 0.
 * Sin invertir se conserva el lado de coordenada menor (derecha del paciente, abajo, posterior).
 */
export function planoCorte(eje: EjeCorte, posicion: number, invertir: boolean): { normal: V3; constante: number } {
  const normal: V3 = [0, 0, 0];
  const signo = invertir ? 1 : -1;
  normal[EJE_INDICE[eje]] = signo;
  return { normal, constante: -signo * posicion };
}

/** Dirección (unitaria) desde el objetivo hacia la cámara para cada vista rápida. */
export const DIRECCION_VISTA: Record<Vista, V3> = {
  anterior: [0, 0, 1],
  posterior: [0, 0, -1],
  // La derecha del paciente está en −X: para verla, la cámara se coloca en −X.
  'lateral-derecha': [-1, 0, 0],
  'lateral-izquierda': [1, 0, 0],
  // Ligera inclinación para evitar la singularidad de mirar exactamente hacia abajo.
  superior: [0, 1, 0.0001],
};

/** Distancia de cámara para encuadrar una caja con un campo de visión vertical `fovGrados`. */
export function distanciaEncuadre(caja: Caja, fovGrados: number, aspecto = 1, margen = 1.15): number {
  const alto = caja.max[1] - caja.min[1];
  const ancho = Math.max(caja.max[0] - caja.min[0], caja.max[2] - caja.min[2]);
  const fov = (fovGrados * Math.PI) / 180;
  const porAlto = alto / 2 / Math.tan(fov / 2);
  const porAncho = ancho / 2 / Math.tan(fov / 2) / Math.max(aspecto, 0.1);
  return Math.max(porAlto, porAncho) * margen + (caja.max[2] - caja.min[2]) / 2;
}

export const centroCaja = (c: Caja): V3 => [(c.min[0] + c.max[0]) / 2, (c.min[1] + c.max[1]) / 2, (c.min[2] + c.max[2]) / 2];

/**
 * Desplazamientos del modo explosión: cada pieza se aleja del centro de su región
 * en proporción a su distancia a él. Devuelve id → desplazamiento (m).
 */
export function desplazamientosExplosion(sistema: SistemaId, region: string, factor: number): Map<string, V3> {
  const res = new Map<string, V3>();
  if (factor <= 0) return res;
  const piezas = estructurasDe(sistema)
    .filter((e) => e.region === region)
    .map((e) => [e.id, centroDe(e.id)] as const)
    .filter((p): p is readonly [string, V3] => p[1] !== null);
  if (piezas.length < 2) return res;
  const centro: V3 = [0, 0, 0];
  for (const [, c] of piezas) for (let k = 0; k < 3; k++) centro[k]! += c[k]! / piezas.length;
  const ESCALA = 1.2;
  for (const [id, c] of piezas) {
    res.set(id, [0, 1, 2].map((k) => (c[k]! - centro[k]!) * factor * ESCALA) as V3);
  }
  return res;
}

/** Clave de región única entre sistemas («cabeza-cuello» existe en varios): «sistema/región». */
export const claveRegion = (sistema: SistemaId, region: string) => `${sistema}/${region}`;

/**
 * Estructuras con pin numerado: las de la región activa («sistema/región») con modelo. Si la
 * selección tiene lado, solo se muestran las de ese lado (y las impares) para no saturar la vista.
 */
export function pinesDeRegion(clave: string | null, seleccion: string | null): ResumenEstructura[] {
  if (!clave) return [];
  const [sistema, region] = clave.split('/');
  const lado = seleccion ? POR_ID.get(seleccion)?.lado : undefined;
  return [...POR_ID.values()].filter(
    (e) => e.sistema === sistema && e.region === region && e.nodoModelo !== null && (!lado || !e.lado || e.lado === lado),
  );
}
