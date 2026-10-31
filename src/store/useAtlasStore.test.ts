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

describe('useAtlasStore: selección, cámara y herramientas', () => {
  beforeEach(() => useAtlasStore.getState().reiniciar());

  it('seleccionar con enfocar emite un comando de cámara nuevo cada vez', () => {
    useAtlasStore.getState().seleccionar('femur-d', { enfocar: true, region: 'muslo-pierna' });
    const c1 = useAtlasStore.getState().comandoCamara;
    useAtlasStore.getState().seleccionar('femur-d', { enfocar: true });
    const c2 = useAtlasStore.getState().comandoCamara;
    expect(c1).toMatchObject({ tipo: 'enfocar', id: 'femur-d' });
    expect(c2!.n).toBeGreaterThan(c1!.n);
    expect(useAtlasStore.getState().regionActiva).toBe('muslo-pierna');
  });

  it('seleccionar una estructura oculta la vuelve a mostrar', () => {
    useAtlasStore.getState().ocultarEstructura('tibia-d');
    useAtlasStore.getState().seleccionar('tibia-d');
    expect(useAtlasStore.getState().ocultas).not.toContain('tibia-d');
  });

  it('ocultar la estructura seleccionada la deselecciona', () => {
    useAtlasStore.getState().seleccionar('tibia-d');
    useAtlasStore.getState().ocultarEstructura('tibia-d');
    expect(useAtlasStore.getState().seleccion).toBeNull();
  });

  it('aislar requiere una selección y se desactiva al deseleccionar', () => {
    useAtlasStore.getState().setAislar(true);
    expect(useAtlasStore.getState().aislar).toBe(false);
    useAtlasStore.getState().seleccionar('humero-i');
    useAtlasStore.getState().setAislar(true);
    expect(useAtlasStore.getState().aislar).toBe(true);
    useAtlasStore.getState().seleccionar(null);
    expect(useAtlasStore.getState().aislar).toBe(false);
  });

  it('limita el factor de explosión a [0, 1] y conserva la región', () => {
    useAtlasStore.getState().setExplosion({ region: 'mano', factor: 3 });
    expect(useAtlasStore.getState().explosion).toEqual({ region: 'mano', factor: 1 });
  });

  it('actualiza el corte parcialmente', () => {
    useAtlasStore.getState().setCorte({ activo: true, eje: 'coronal' });
    expect(useAtlasStore.getState().corte).toMatchObject({ activo: true, eje: 'coronal', invertir: false });
  });
});
