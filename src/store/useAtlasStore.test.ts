import { beforeEach, describe, expect, it } from 'vitest';
import { useAtlasStore } from './useAtlasStore';

describe('useAtlasStore', () => {
  beforeEach(() => useAtlasStore.getState().reiniciar());

  it('arranca solo con el esqueleto visible', () => {
    const { sistemasVisibles } = useAtlasStore.getState();
    expect(sistemasVisibles.esqueletico).toBe(true);
    expect(sistemasVisibles.muscular).toBe(false);
  });

  it('alterna la visibilidad de un sistema', () => {
    useAtlasStore.getState().alternarSistema('muscular');
    expect(useAtlasStore.getState().sistemasVisibles.muscular).toBe(true);
  });

  it('limita la opacidad a [0, 1]', () => {
    useAtlasStore.getState().setOpacidad('esqueletico', 1.7);
    expect(useAtlasStore.getState().opacidad.esqueletico).toBe(1);
    useAtlasStore.getState().setOpacidad('esqueletico', -0.2);
    expect(useAtlasStore.getState().opacidad.esqueletico).toBe(0);
  });

  it('oculta estructuras sin duplicarlas y las vuelve a mostrar', () => {
    const s = useAtlasStore.getState();
    s.ocultarEstructura('femur-d');
    s.ocultarEstructura('femur-d');
    expect(useAtlasStore.getState().ocultas).toEqual(['femur-d']);
    useAtlasStore.getState().mostrarTodas();
    expect(useAtlasStore.getState().ocultas).toEqual([]);
  });

  it('persiste preferencias de vista pero no la selección', () => {
    useAtlasStore.getState().alternarSistema('nervioso');
    useAtlasStore.getState().seleccionar('femur-d');
    const guardado = JSON.parse(localStorage.getItem('atlas3d:visor') ?? '{}');
    expect(guardado.state.sistemasVisibles.nervioso).toBe(true);
    expect(guardado.state).not.toHaveProperty('seleccion');
  });
});
