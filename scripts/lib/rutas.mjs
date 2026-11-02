// Rutas compartidas por los scripts del pipeline de modelos.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Modelos crudos descargados (en .gitignore). */
export const DIR_CRUDOS = path.join(RAIZ, 'assets-raw');
export const DIR_BP3D = path.join(DIR_CRUDOS, 'bodyparts3d');
export const DIR_BP3D_OBJ = path.join(DIR_BP3D, 'partof_BP3D_4.0_obj_99');
export const DIR_BP3D_OBJ_ISA = path.join(DIR_BP3D, 'isa_BP3D_4.0_obj_99');

/** Intermedios: un .glb por elemento OBJ convertido con obj2gltf (cacheados). */
export const DIR_INTERMEDIO = path.join(DIR_CRUDOS, 'intermedio', 'bodyparts3d');
/** .glb agrupados por sistema, antes de optimizar. */
export const DIR_AGRUPADO = path.join(DIR_CRUDOS, 'intermedio', 'sistemas');

/** Salida final servida por la app. */
export const DIR_MODELOS = path.join(RAIZ, 'public', 'models');
/** El manifest vive en src/ para que la app lo importe (tipado y validado) sin petición extra. */
export const RUTA_MANIFEST = path.join(RAIZ, 'src', 'data', 'manifest-modelos.json');

/** Z-Anatomy (plantilla de Blender, CC BY-SA 4.0) y su exportación a glTF. */
export const DIR_ZANATOMY = path.join(DIR_CRUDOS, 'z-anatomy');
export const DIR_ZANATOMY_GLB = path.join(DIR_ZANATOMY, 'exportado');
