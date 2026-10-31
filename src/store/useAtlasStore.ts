import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SISTEMAS, type SistemaId } from '@/data/sistemas';
import { almacenamientoJSON } from './almacenamiento';

export type EjeCorte = 'sagital' | 'coronal' | 'transversal';
export type Vista = 'anterior' | 'posterior' | 'lateral-derecha' | 'lateral-izquierda' | 'superior';

export interface Corte {
  activo: boolean;
  eje: EjeCorte;
  /** Posición del plano en metros, en coordenadas de escena. */
  posicion: number;
  /** Conserva el lado opuesto del plano. */
  invertir: boolean;
}

/** Orden para la cámara; `n` cambia en cada orden para que se ejecute aunque se repita. */
export type ComandoCamara =
  | { tipo: 'vista'; vista: Vista; n: number }
  | { tipo: 'enfocar'; id: string; n: number }
  | { tipo: 'reiniciar'; n: number };

/** Estado del visor: sistemas visibles, selección, cortes, explosión, etiquetas y cámara. */
export interface EstadoAtlas {
  sistemasVisibles: Record<SistemaId, boolean>;
  opacidad: Record<SistemaId, number>;
  seleccion: string | null;
  hover: string | null;
  ocultas: string[];
  /** Muestra solo la estructura seleccionada. */
  aislar: boolean;
  corte: Corte;
  explosion: { region: string; factor: number };
  etiquetas: boolean;
  /** Región cuyos pines se muestran y que se despliega en el árbol. */
  regionActiva: string | null;
  comandoCamara: ComandoCamara | null;

  alternarSistema: (id: SistemaId) => void;
  setOpacidad: (id: SistemaId, valor: number) => void;
  /** Selecciona una estructura; con `enfocar` la cámara se acerca a ella. */
  seleccionar: (id: string | null, opciones?: { enfocar?: boolean; region?: string }) => void;
  setHover: (id: string | null) => void;
  ocultarEstructura: (id: string) => void;
  mostrarEstructura: (id: string) => void;
  mostrarTodas: () => void;
  setAislar: (v: boolean) => void;
  setCorte: (cambios: Partial<Corte>) => void;
  setExplosion: (cambios: Partial<EstadoAtlas['explosion']>) => void;
  setEtiquetas: (v: boolean) => void;
  setRegionActiva: (region: string | null) => void;
  vista: (vista: Vista) => void;
  enfocar: (id: string) => void;
  reiniciarCamara: () => void;
  reiniciar: () => void;
}

const visiblesIniciales = (): Record<SistemaId, boolean> =>
  Object.fromEntries(SISTEMAS.map((s) => [s.id, s.id === 'esqueletico'])) as Record<SistemaId, boolean>;

const opacidadInicial = (): Record<SistemaId, number> =>
  Object.fromEntries(SISTEMAS.map((s) => [s.id, 1])) as Record<SistemaId, number>;

const CORTE_INICIAL: Corte = { activo: false, eje: 'sagital', posicion: 0, invertir: false };
const EXPLOSION_INICIAL = { region: 'craneo', factor: 0 };

const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

let contador = 0;
const n = () => ++contador;

export const useAtlasStore = create<EstadoAtlas>()(
  persist(
    (set) => ({
      sistemasVisibles: visiblesIniciales(),
      opacidad: opacidadInicial(),
      seleccion: null,
      hover: null,
      ocultas: [],
      aislar: false,
      corte: CORTE_INICIAL,
      explosion: EXPLOSION_INICIAL,
      etiquetas: false,
      regionActiva: null,
      comandoCamara: null,

      alternarSistema: (id) =>
        set((s) => ({ sistemasVisibles: { ...s.sistemasVisibles, [id]: !s.sistemasVisibles[id] } })),
      setOpacidad: (id, valor) => set((s) => ({ opacidad: { ...s.opacidad, [id]: limitar(valor) } })),
      seleccionar: (id, opciones) =>
        set((s) => ({
          seleccion: id,
          // Seleccionar algo oculto lo vuelve a mostrar; deseleccionar desactiva el aislamiento.
          ocultas: id ? s.ocultas.filter((o) => o !== id) : s.ocultas,
          aislar: id ? s.aislar : false,
          regionActiva: opciones?.region ?? s.regionActiva,
          comandoCamara: id && opciones?.enfocar ? { tipo: 'enfocar', id, n: n() } : s.comandoCamara,
        })),
      setHover: (id) => set((s) => (s.hover === id ? s : { hover: id })),
      ocultarEstructura: (id) =>
        set((s) => ({
          ocultas: s.ocultas.includes(id) ? s.ocultas : [...s.ocultas, id],
          seleccion: s.seleccion === id ? null : s.seleccion,
        })),
      mostrarEstructura: (id) => set((s) => ({ ocultas: s.ocultas.filter((o) => o !== id) })),
      mostrarTodas: () => set({ ocultas: [], aislar: false }),
      setAislar: (v) => set((s) => ({ aislar: v && s.seleccion !== null })),
      setCorte: (cambios) => set((s) => ({ corte: { ...s.corte, ...cambios } })),
      setExplosion: (cambios) =>
        set((s) => ({
          explosion: {
            ...s.explosion,
            ...cambios,
            factor: limitar(cambios.factor ?? s.explosion.factor),
          },
        })),
      setEtiquetas: (v) => set({ etiquetas: v }),
      setRegionActiva: (region) => set({ regionActiva: region }),
      vista: (vista) => set({ comandoCamara: { tipo: 'vista', vista, n: n() } }),
      enfocar: (id) => set({ comandoCamara: { tipo: 'enfocar', id, n: n() } }),
      reiniciarCamara: () => set({ comandoCamara: { tipo: 'reiniciar', n: n() } }),
      reiniciar: () =>
        set({
          sistemasVisibles: visiblesIniciales(),
          opacidad: opacidadInicial(),
          seleccion: null,
          hover: null,
          ocultas: [],
          aislar: false,
          corte: CORTE_INICIAL,
          explosion: EXPLOSION_INICIAL,
          etiquetas: false,
          regionActiva: null,
          comandoCamara: { tipo: 'reiniciar', n: n() },
        }),
    }),
    {
      name: 'atlas3d:visor',
      version: 1,
      storage: almacenamientoJSON,
      // Solo se persisten preferencias de vista, no la selección actual.
      partialize: (s) => ({ sistemasVisibles: s.sistemasVisibles, opacidad: s.opacidad, etiquetas: s.etiquetas }),
    },
  ),
);
