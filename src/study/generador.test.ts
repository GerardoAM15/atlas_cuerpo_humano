import { beforeAll, describe, expect, it } from 'vitest';
import { normalizar } from '@/data/texto';
import { POR_ID, cargarSistemas, fichaDe } from '@/data/catalogo';
import { SISTEMAS } from '@/data/sistemas';
import type { EstructuraMusculo } from '@/data/esquemas';
import { conceptoDe, conceptos } from './conceptos';
import { claveNervio, crearAzar, generarQuiz, tiposDisponibles, type ConfigQuiz, type Pregunta, type TipoPregunta } from './generador';

const TODOS: TipoPregunta[] = ['encontrar', 'que-es', 'funcion', 'origen-insercion', 'inervacion'];
const cfg = (extra: Partial<ConfigQuiz> = {}): ConfigQuiz => ({
  alcance: { sistemas: ['esqueletico', 'muscular'] },
  tipos: TODOS,
  dificultad: 'media',
  numero: 40,
  semilla: 42,
  ...extra,
});

// Las preguntas de texto necesitan las fichas completas, que se cargan bajo demanda.
beforeAll(() => cargarSistemas(SISTEMAS.map((s) => s.id)));

describe('generador de quiz', () => {
  let quiz: Pregunta[] = [];
  beforeAll(() => {
    quiz = generarQuiz(cfg());
  });

  it('genera el número pedido de preguntas', () => {
    expect(quiz).toHaveLength(40);
  });

  it('no repite estructuras (conceptos) en una sesión', () => {
    const vistos = quiz.map((p) => p.concepto);
    expect(new Set(vistos).size).toBe(vistos.length);
  });

  it('las preguntas con opciones tienen 4 opciones únicas que incluyen la correcta', () => {
    for (const p of quiz.filter((x) => x.tipo !== 'encontrar')) {
      expect(p.opciones, p.enunciado).toHaveLength(4);
      expect(new Set(p.opciones.map((o) => o.id)).size).toBe(4);
      expect(new Set(p.opciones.map((o) => normalizar(o.texto))).size).toBe(4);
      expect(p.opciones.some((o) => o.id === p.correcta)).toBe(true);
    }
  });

  it('en «encontrar» la respuesta es la estructura objetivo, que tiene modelo 3D', () => {
    for (const p of quiz.filter((x) => x.tipo === 'encontrar')) {
      expect(p.correcta).toBe(p.objetivo);
      expect(POR_ID.get(p.objetivo)?.nodoModelo).not.toBeNull();
    }
  });

  it('es reproducible con la misma semilla y cambia con otra', () => {
    expect(generarQuiz(cfg()).map((p) => p.enunciado + p.objetivo)).toEqual(quiz.map((p) => p.enunciado + p.objetivo));
    expect(generarQuiz(cfg({ semilla: 7 })).map((p) => p.objetivo)).not.toEqual(quiz.map((p) => p.objetivo));
  });

  it('respeta el alcance por sistema y región', () => {
    const q = generarQuiz(cfg({ alcance: { sistemas: ['esqueletico'], region: 'esqueletico/craneo' }, numero: 50 }));
    expect(q.length).toBeGreaterThan(5);
    for (const p of q) expect(POR_ID.get(p.objetivo)?.region).toBe('craneo');
  });

  it('pregunta primero por los conceptos prioritarios (repasos pendientes)', () => {
    const q = generarQuiz(cfg({ prioridad: ['femur', 'deltoides'], numero: 5 }));
    expect(q.slice(0, 2).map((p) => p.concepto).sort()).toEqual(['deltoides', 'femur']);
  });
});

describe('tipos de pregunta', () => {
  it('las preguntas de inervación ofrecen nervios distintos, uno de ellos el correcto', () => {
    const q = generarQuiz(cfg({ tipos: ['inervacion'], alcance: { sistemas: ['muscular'] }, numero: 30 }));
    expect(q.length).toBe(30);
    for (const p of q) {
      const claves = p.opciones.map((o) => claveNervio(o.texto));
      expect(new Set(claves).size).toBe(4);
      const correcta = p.opciones.find((o) => o.id === p.correcta)!;
      expect(correcta.texto).toBe((fichaDe(conceptoDe(p.objetivo)!.e.id) as EstructuraMusculo).inervacion);
    }
  });

  it('las preguntas de función no delatan el nombre en el enunciado', () => {
    const q = generarQuiz(cfg({ tipos: ['funcion'], numero: 60 }));
    for (const p of q) {
      const c = conceptos().get(p.concepto)!;
      expect(normalizar(p.detalle!)).not.toContain(normalizar(c.nombre.split(' (')[0]!));
    }
  });

  it('en difícil, «¿qué es esto?» usa distractores de la misma región', () => {
    const q = generarQuiz(cfg({ tipos: ['que-es'], dificultad: 'dificil', alcance: { sistemas: ['esqueletico'] }, numero: 30 }));
    for (const p of q) {
      const region = POR_ID.get(p.objetivo)!.region;
      // Si la región tiene pocas estructuras con modelo, se completan con otras del mismo sistema.
      const enRegion = [...POR_ID.values()].filter((e) => e.sistema === 'esqueletico' && e.region === region && e.nodoModelo).length;
      const mismas = p.opciones.filter((o) => POR_ID.get(o.id)!.region === region).length;
      expect(mismas).toBeGreaterThanOrEqual(Math.min(4, enRegion));
    }
  });

  it('sin músculos en el alcance no hay preguntas de origen ni de inervación', () => {
    const t = tiposDisponibles({ sistemas: ['esqueletico'] });
    expect(t).not.toContain('inervacion');
    expect(t).not.toContain('origen-insercion');
    expect(t).toContain('que-es');
  });
});

describe('azar reproducible', () => {
  it('barajar es una permutación', () => {
    const a = crearAzar(1);
    expect(a.barajar([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
