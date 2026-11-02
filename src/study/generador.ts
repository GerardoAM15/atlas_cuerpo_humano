// Generador de preguntas de estudio a partir de las fichas (determinista con una semilla).
import { normalizar } from '@/data/texto';
import { INDICE, fichaDe } from '@/data/catalogo';
import type { EstructuraMusculo } from '@/data/esquemas';
import { conceptosEn, nombreBase, type Alcance, type Concepto } from './conceptos';

export type TipoPregunta = 'encontrar' | 'que-es' | 'funcion' | 'origen-insercion' | 'inervacion';
export type Dificultad = 'facil' | 'media' | 'dificil';

export const NOMBRE_TIPO: Record<TipoPregunta, string> = {
  encontrar: 'Encuentra la estructura (3D)',
  'que-es': '¿Qué es esto? (3D)',
  funcion: '¿Qué estructura cumple esta función?',
  'origen-insercion': 'Origen e inserción de músculos',
  inervacion: 'Inervación de músculos',
};

export interface Opcion {
  id: string;
  texto: string;
}

export interface Pregunta {
  n: number;
  tipo: TipoPregunta;
  /** Concepto que se evalúa (para la repetición espaciada). */
  concepto: string;
  /** Estructura concreta (con lado) a la que se refiere la pregunta. */
  objetivo: string;
  enunciado: string;
  detalle?: string;
  /** Vacío en «encontrar» (se responde haciendo clic en el modelo). */
  opciones: Opcion[];
  /** Id de la opción correcta (en «encontrar», id de la estructura). */
  correcta: string;
}

export interface ConfigQuiz {
  alcance: Alcance;
  tipos: readonly TipoPregunta[];
  dificultad: Dificultad;
  numero: number;
  semilla: number;
  /** Conceptos a preguntar primero (p. ej. repasos pendientes de SM-2). */
  prioridad?: readonly string[];
  /** Conceptos ya vistos: los no vistos van antes que los vistos. */
  vistos?: ReadonlySet<string>;
}

// ---------------------------------------------------------------- Aleatoriedad reproducible
export function crearAzar(semilla: number) {
  let a = semilla >>> 0;
  const siguiente = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const barajar = <T,>(xs: readonly T[]): T[] => {
    const r = [...xs];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(siguiente() * (i + 1));
      [r[i], r[j]] = [r[j]!, r[i]!];
    }
    return r;
  };
  const elegir = <T,>(xs: readonly T[]): T => xs[Math.floor(siguiente() * xs.length)]!;
  return { siguiente, barajar, elegir };
}
type Azar = ReturnType<typeof crearAzar>;

// ---------------------------------------------------------------- Aplicabilidad
// Las preguntas de texto leen la ficha completa: las fichas del alcance deben estar cargadas
// (`cargarSistemas`); sin ficha, la pregunta no se puede construir y no se ofrece.
const fichaMusculo = (c: Concepto): EstructuraMusculo | undefined => {
  const f = fichaDe(c.e.id);
  return f?.tipo === 'musculo' ? f : undefined;
};

/** Nervio principal de una inervación: «Nervio femoral (L2–L4).» → «nervio femoral». */
export const claveNervio = (s: string) => normalizar(s.split(/[(,;.]/)[0] ?? s).trim();

function aplicable(tipo: TipoPregunta, c: Concepto): boolean {
  switch (tipo) {
    case 'encontrar':
    case 'que-es':
      return c.tieneModelo;
    case 'funcion': {
      // Se descarta si el texto de la función delata el nombre.
      const f = fichaDe(c.e.id);
      return f !== undefined && !normalizar(f.funcion).includes(normalizar(c.nombre.split(' (')[0]!));
    }
    case 'origen-insercion':
    case 'inervacion':
      return fichaMusculo(c) !== undefined;
  }
}

// ---------------------------------------------------------------- Distractores
function elegirDistractores<T>(
  azar: Azar,
  objetivo: T,
  grupos: readonly (readonly T[])[],
  texto: (x: T) => string,
  clave: (x: T) => string = (x) => normalizar(texto(x)),
  cuantos = 3,
): T[] {
  const usadas = new Set([clave(objetivo)]);
  const res: T[] = [];
  for (const grupo of grupos) {
    for (const x of azar.barajar(grupo)) {
      if (res.length >= cuantos) return res;
      const k = clave(x);
      if (usadas.has(k)) continue;
      usadas.add(k);
      res.push(x);
    }
  }
  return res;
}

/** Grupos de candidatos de más a menos preferidos según la dificultad. */
function gruposPorDificultad<T extends { sistema: string; region: string }>(objetivo: T, todos: readonly T[], dificultad: Dificultad, mismoTipo: (x: T) => boolean) {
  const mismaRegion = todos.filter((x) => x.sistema === objetivo.sistema && x.region === objetivo.region);
  const mismoSistema = todos.filter((x) => x.sistema === objetivo.sistema);
  const otraRegion = mismoSistema.filter((x) => x.region !== objetivo.region);
  if (dificultad === 'facil') return [otraRegion, mismoSistema, todos];
  if (dificultad === 'media') return [mismoSistema, todos];
  return [mismaRegion.filter(mismoTipo), mismaRegion, mismoSistema.filter(mismoTipo), mismoSistema, todos];
}

// ---------------------------------------------------------------- Construcción de cada tipo
function construir(tipo: TipoPregunta, c: Concepto, n: number, cfg: ConfigQuiz, azar: Azar, universo: Concepto[]): Pregunta | null {
  const conModelo = c.lados.filter((e) => e.nodoModelo !== null);
  const base = { n, tipo, concepto: c.id };

  if (tipo === 'encontrar') {
    const e = azar.elegir(conModelo);
    return { ...base, objetivo: e.id, enunciado: `Haz clic en: ${e.nombre}`, detalle: `${e.latin} · ${e.ingles}`, opciones: [], correcta: e.id };
  }

  if (tipo === 'que-es') {
    const e = azar.elegir(conModelo);
    const candidatas = INDICE.filter((x) => x.nodoModelo !== null && cfg.alcance.sistemas.includes(x.sistema) && x.id !== e.id);
    const grupos = gruposPorDificultad(e, candidatas, cfg.dificultad, (x) => x.tipo === e.tipo);
    // En difícil, el mismo hueso del otro lado es el distractor más traicionero.
    const opuesto = e.lado ? c.lados.filter((x) => x.id !== e.id && x.nodoModelo !== null) : [];
    const dist = elegirDistractores(azar, e, cfg.dificultad === 'dificil' ? [opuesto, ...grupos] : grupos, (x) => x.nombre);
    if (dist.length < 3) return null;
    return {
      ...base,
      objetivo: e.id,
      enunciado: '¿Qué estructura está resaltada?',
      opciones: azar.barajar([e, ...dist]).map((x) => ({ id: x.id, texto: x.nombre })),
      correcta: e.id,
    };
  }

  // Preguntas de texto: trabajan con conceptos (sin lado).
  const candidatos = universo.filter((x) => x.id !== c.id);
  const deConcepto = (x: Concepto) => ({ id: x.id, texto: x.nombre });

  if (tipo === 'funcion') {
    const grupos = gruposPorDificultad(c, candidatos, cfg.dificultad, (x) => x.e.tipo === c.e.tipo);
    const dist = elegirDistractores(azar, c, grupos, (x) => x.nombre);
    if (dist.length < 3) return null;
    return {
      ...base,
      objetivo: c.e.id,
      enunciado: '¿Qué estructura cumple esta función?',
      detalle: fichaDe(c.e.id)!.funcion,
      opciones: azar.barajar([c, ...dist]).map(deConcepto),
      correcta: c.id,
    };
  }

  const musculo = fichaMusculo(c)!;
  const musculos = candidatos.filter((x) => fichaMusculo(x) !== undefined);

  if (tipo === 'origen-insercion') {
    const grupos = gruposPorDificultad(c, musculos, cfg.dificultad, () => true);
    const dist = elegirDistractores(azar, c, grupos, (x) => x.nombre);
    if (dist.length < 3) return null;
    return {
      ...base,
      objetivo: c.e.id,
      enunciado: '¿Qué músculo tiene este origen y esta inserción?',
      detalle: `Origen: ${musculo.origen}\nInserción: ${musculo.insercion}`,
      opciones: azar.barajar([c, ...dist]).map(deConcepto),
      correcta: c.id,
    };
  }

  // Inervación: las opciones son nervios; se descartan los que coinciden con el del objetivo.
  const grupos = gruposPorDificultad(c, musculos, cfg.dificultad, () => true);
  const inerv = (x: Concepto) => fichaMusculo(x)!.inervacion;
  const dist = elegirDistractores(azar, c, grupos, inerv, (x) => claveNervio(inerv(x)));
  if (dist.length < 3) return null;
  return {
    ...base,
    objetivo: c.e.id,
    enunciado: `¿Qué nervio inerva el músculo ${nombreBase(c.e).toLowerCase()}?`,
    opciones: azar.barajar([c, ...dist]).map((x) => ({ id: x.id, texto: inerv(x) })),
    correcta: c.id,
  };
}

/**
 * Genera una sesión: cada concepto aparece una sola vez; primero los prioritarios (repasos
 * pendientes), luego los no vistos y después el resto, en orden aleatorio dentro de cada grupo.
 */
export function generarQuiz(cfg: ConfigQuiz): Pregunta[] {
  const azar = crearAzar(cfg.semilla);
  const universo = conceptosEn(cfg.alcance);
  const candidatos = universo.filter((c) => cfg.tipos.some((t) => aplicable(t, c)));
  const prioridad = new Set(cfg.prioridad ?? []);
  const vistos = cfg.vistos ?? new Set<string>();
  const ordenados = [
    ...azar.barajar(candidatos.filter((c) => prioridad.has(c.id))),
    ...azar.barajar(candidatos.filter((c) => !prioridad.has(c.id) && !vistos.has(c.id))),
    ...azar.barajar(candidatos.filter((c) => !prioridad.has(c.id) && vistos.has(c.id))),
  ];
  const preguntas: Pregunta[] = [];
  for (const c of ordenados) {
    if (preguntas.length >= cfg.numero) break;
    for (const tipo of azar.barajar(cfg.tipos.filter((t) => aplicable(t, c)))) {
      const p = construir(tipo, c, preguntas.length + 1, cfg, azar, universo);
      if (p) {
        preguntas.push(p);
        break;
      }
    }
  }
  return preguntas;
}

/** Tipos de pregunta posibles en un alcance (p. ej. sin músculos no hay preguntas de inervación). */
export function tiposDisponibles(alcance: Alcance): TipoPregunta[] {
  const cs = conceptosEn(alcance);
  return (Object.keys(NOMBRE_TIPO) as TipoPregunta[]).filter((t) => cs.some((c) => aplicable(t, c)));
}
