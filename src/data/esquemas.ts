import { z } from 'zod';

/** Ids propios: minúsculas, dígitos y guiones (también son nombres de nodo en los .glb). */
export const IdEstructura = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id inválido');

export const SistemaIdEsquema = z.enum([
  'esqueletico',
  'muscular',
  'cardiovascular',
  'respiratorio',
  'nervioso',
  'digestivo',
  'urinario',
  'endocrino',
  'linfatico',
  'reproductor',
  'sentidos',
]);

export const TipoEstructura = z.enum([
  'hueso',
  'cartilago',
  'articulacion',
  'musculo',
  'tendon',
  'ligamento',
  'organo',
  'vaso',
  'valvula',
  'nervio',
  'glandula',
  'diente',
  'otro',
]);

export const ClasificacionHueso = z.enum(['largo', 'corto', 'plano', 'irregular', 'sesamoideo', 'neumatico']);

const texto = z.string().trim().min(1);

export const Articulacion = z.object({
  nombre: texto,
  /** Huesos con los que articula (ids). */
  con: z.array(IdEstructura).min(1),
  /** Clasificación funcional/estructural, p. ej. «sinovial esferoidea», «sutura», «sínfisis». */
  tipo: texto,
});

const base = z.object({
  id: IdEstructura,
  /** Nombre del nodo en el .glb del sistema; null si el modelo está pendiente. */
  nodoModelo: IdEstructura.nullable(),
  nombre: texto,
  latin: texto,
  ingles: texto,
  sistema: SistemaIdEsquema,
  region: texto,
  lado: z.enum(['derecho', 'izquierdo']).optional(),
  descripcion: texto,
  funcion: texto,
  ubicacion: texto,
  relaciones: z.array(IdEstructura),
  datosClinicos: texto,
  curiosidad: texto.optional(),
  /** Nota cuando un dato necesita revisión (no se inventa: se marca). */
  revisar: texto.optional(),
});

export const EstructuraHueso = base.extend({
  tipo: z.literal('hueso'),
  clasificacion: z.array(ClasificacionHueso).min(1),
  articulaciones: z.array(Articulacion),
});

export const EstructuraMusculo = base.extend({
  tipo: z.literal('musculo'),
  origen: texto,
  insercion: texto,
  inervacion: texto,
  irrigacion: texto,
  accion: texto,
});

export const EstructuraGenerica = base.extend({
  tipo: TipoEstructura.exclude(['hueso', 'musculo']),
  articulaciones: z.array(Articulacion).optional(),
  /** Vasos: arteria o vena y tipo de sangre que transportan (las pulmonares invierten la regla). */
  vaso: z
    .object({ clase: z.enum(['arteria', 'vena']), sangre: z.enum(['oxigenada', 'desoxigenada', 'mixta']) })
    .optional(),
});

export const Estructura = z.discriminatedUnion('tipo', [EstructuraHueso, EstructuraMusculo, EstructuraGenerica]);
export const ArchivoEstructuras = z.array(Estructura);

export type Estructura = z.infer<typeof Estructura>;
export type EstructuraHueso = z.infer<typeof EstructuraHueso>;
export type EstructuraMusculo = z.infer<typeof EstructuraMusculo>;
export type Articulacion = z.infer<typeof Articulacion>;

// ------------------------------------------------------------------ Manifest

const Vec3 = z.tuple([z.number(), z.number(), z.number()]);

export const EntradaManifest = z.discriminatedUnion('estado', [
  z.object({
    id: IdEstructura,
    nodo: IdEstructura,
    tipo: z.string(),
    estado: z.literal('disponible'),
    fuente: z.string(),
    fma: z.array(z.string().regex(/^FMA\d+$/)),
    elementos: z.array(z.string()),
    nombresFuente: z.array(z.string()),
    triangulos: z.number().int().nonnegative(),
    caja: z.object({ min: Vec3, max: Vec3 }),
    revisar: z.string().optional(),
  }),
  z.object({
    id: IdEstructura,
    nodo: z.null(),
    tipo: z.string(),
    estado: z.literal('pendiente'),
    motivo: z.string(),
  }),
]);

export const ManifestModelos = z.object({
  version: z.number(),
  unidades: z.literal('m'),
  ejes: z.object({ arriba: z.string(), anterior: z.string(), derechaDelPaciente: z.string() }),
  fuentes: z.record(
    z.object({
      nombre: z.string(),
      version: z.string(),
      licencia: z.string(),
      urlLicencia: z.string().url(),
      url: z.string().url(),
      atribucion: z.string(),
      nota: z.string().optional(),
    }),
  ),
  sistemas: z.record(
    z.object({
      archivo: z.string(),
      bytes: z.number().int().positive(),
      triangulos: z.number().int().nonnegative(),
      estructuras: z.array(EntradaManifest),
    }),
  ),
  bytesTotales: z.number().int().nonnegative(),
});

export type ManifestModelos = z.infer<typeof ManifestModelos>;
export type EntradaManifest = z.infer<typeof EntradaManifest>;
export type Caja = { min: [number, number, number]; max: [number, number, number] };
