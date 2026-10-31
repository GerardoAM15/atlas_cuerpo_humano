import * as THREE from 'three';

/**
 * Plano de corte compartido por todos los materiales del visor. Se modifica en sitio
 * (sin recompilar shaders) cuando se mueve el control deslizante.
 */
export const PLANO_CORTE = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

export const COLOR_SELECCION = '#38bdf8';
export const COLOR_HOVER = '#fbbf24';
