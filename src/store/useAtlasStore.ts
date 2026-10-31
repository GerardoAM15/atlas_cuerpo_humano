import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SISTEMAS, type SistemaId } from '@/data/sistemas';
import { almacenamientoJSON } from './almacenamiento';

/** Estado del visor: qué sistemas se ven, con qué opacidad y qué está seleccionado. */
export interface EstadoAtlas {
  sistemasVisibles: Record<SistemaId, boolean>;
  opacidad: Record<SistemaId, number>;
  seleccion: string | null;
  ocultas: string[];

  alternarSistema: (id: SistemaId) => void;
  setOpacidad: (id: SistemaId, valor: number) => void;
  seleccionar: (id: string | null) => void;
  ocultarEstructura: (id: string) => void;
  mostrarTodas: () => void;
  reiniciar: () => void;
}

const visiblesIniciales = (): Record<SistemaId, boolean> =>
  Object.fromEntries(SISTEMAS.map((s) => [s.id, s.id === 'esqueletico'])) as Record<SistemaId, boolean>;

const opacidadInicial = (): Record<SistemaId, number> =>
  Object.fromEntries(SISTEMAS.map((s) => [s.id, 1])) as Record<SistemaId, number>;

const limitar = (v: number) => Math.min(1, Math.max(0, v));

export const useAtlasStore = create<EstadoAtlas>()(
  persist(
    (set) => ({
      sistemasVisibles: visiblesIniciales(),
      opacidad: opacidadInicial(),
      seleccion: null,
      ocultas: [],

      alternarSistema: (id) =>
        set((s) => ({ sistemasVisibles: { ...s.sistemasVisibles, [id]: !s.sistemasVisibles[id] } })),
      setOpacidad: (id, valor) => set((s) => ({ opacidad: { ...s.opacidad, [id]: limitar(valor) } })),
      seleccionar: (id) => set({ seleccion: id }),
      ocultarEstructura: (id) =>
        set((s) => (s.ocultas.includes(id) ? s : { ocultas: [...s.ocultas, id] })),
      mostrarTodas: () => set({ ocultas: [] }),
      reiniciar: () =>
        set({ sistemasVisibles: visiblesIniciales(), opacidad: opacidadInicial(), seleccion: null, ocultas: [] }),
    }),
    {
      name: 'atlas3d:visor',
      version: 1,
      storage: almacenamientoJSON,
      // Solo se persisten preferencias de vista, no la selección actual.
      partialize: (s) => ({ sistemasVisibles: s.sistemasVisibles, opacidad: s.opacidad }),
    },
  ),
);
