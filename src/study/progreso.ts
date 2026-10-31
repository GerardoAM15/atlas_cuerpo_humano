// Estadísticas de progreso a partir de las tarjetas SM-2 (funciones puras) y store persistente.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SISTEMAS, type SistemaId } from '@/data/sistemas';
import { almacenamientoJSON } from '@/store/almacenamiento';
import { conceptos } from './conceptos';
import { diasEntre, dominada, fechaLocal, pendiente, repasar, sumarDias, tarjetaNueva, type Tarjeta } from './sm2';

export type Tarjetas = Readonly<Record<string, Tarjeta>>;

/** Días seguidos con actividad terminando hoy (o ayer, si hoy aún no se ha estudiado). */
export function racha(dias: readonly string[], hoy: string): number {
  const set = new Set(dias);
  let dia = set.has(hoy) ? hoy : sumarDias(hoy, -1);
  let n = 0;
  while (set.has(dia)) {
    n++;
    dia = sumarDias(dia, -1);
  }
  return n;
}

/** Mayor racha histórica. */
export function mejorRacha(dias: readonly string[]): number {
  const ordenados = [...new Set(dias)].sort();
  let mejor = 0;
  let actual = 0;
  for (let i = 0; i < ordenados.length; i++) {
    actual = i > 0 && diasEntre(ordenados[i - 1]!, ordenados[i]!) === 1 ? actual + 1 : 1;
    mejor = Math.max(mejor, actual);
  }
  return mejor;
}

export interface DominioSistema {
  sistema: SistemaId;
  total: number;
  vistos: number;
  dominados: number;
  porcentaje: number;
}

/** Porcentaje de conceptos dominados por sistema. */
export function dominioPorSistema(tarjetas: Tarjetas): DominioSistema[] {
  const todos = [...conceptos().values()];
  return SISTEMAS.map((s) => {
    const delSistema = todos.filter((c) => c.sistema === s.id);
    const vistos = delSistema.filter((c) => tarjetas[c.id]).length;
    const dominados = delSistema.filter((c) => dominada(tarjetas[c.id])).length;
    return { sistema: s.id, total: delSistema.length, vistos, dominados, porcentaje: delSistema.length ? dominados / delSistema.length : 0 };
  });
}

/** Conceptos con más dificultad: con fallos, ordenados por tasa de fallo y luego por EF bajo. */
export function dificiles(tarjetas: Tarjetas, n = 10): { id: string; tarjeta: Tarjeta; tasaFallo: number }[] {
  return Object.entries(tarjetas)
    .filter(([, t]) => t.fallos > 0)
    .map(([id, t]) => ({ id, tarjeta: t, tasaFallo: t.fallos / (t.aciertos + t.fallos) }))
    .sort((a, b) => b.tasaFallo - a.tasaFallo || a.tarjeta.ef - b.tarjeta.ef || b.tarjeta.fallos - a.tarjeta.fallos)
    .slice(0, n);
}

/** Conceptos cuyo repaso toca hoy (o está atrasado). */
export const pendientes = (tarjetas: Tarjetas, hoy: string) =>
  Object.entries(tarjetas)
    .filter(([, t]) => pendiente(t, hoy))
    .map(([id]) => id);

// ---------------------------------------------------------------- Store persistente
interface EstadoProgreso {
  tarjetas: Record<string, Tarjeta>;
  diasActivos: string[];
  /** Registra la respuesta a un concepto con calidad SM-2 (0–5). */
  registrar: (concepto: string, calidad: number, hoy?: string) => void;
  reiniciarProgreso: () => void;
}

export const useProgresoStore = create<EstadoProgreso>()(
  persist(
    (set) => ({
      tarjetas: {},
      diasActivos: [],
      registrar: (concepto, calidad, hoy = fechaLocal()) =>
        set((s) => ({
          tarjetas: { ...s.tarjetas, [concepto]: repasar(s.tarjetas[concepto] ?? tarjetaNueva(hoy), calidad, hoy) },
          diasActivos: s.diasActivos.includes(hoy) ? s.diasActivos : [...s.diasActivos, hoy],
        })),
      reiniciarProgreso: () => set({ tarjetas: {}, diasActivos: [] }),
    }),
    { name: 'atlas3d:progreso', version: 1, storage: almacenamientoJSON },
  ),
);
