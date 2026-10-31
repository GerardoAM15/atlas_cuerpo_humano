import { beforeEach, describe, expect, it } from 'vitest';
import { dificiles, dominioPorSistema, mejorRacha, pendientes, racha, useProgresoStore } from './progreso';
import { repasar, tarjetaNueva } from './sm2';

const HOY = '2026-03-10';

describe('racha', () => {
  it('cuenta los días seguidos hasta hoy', () => {
    expect(racha(['2026-03-08', '2026-03-09', '2026-03-10'], HOY)).toBe(3);
  });

  it('si hoy aún no se ha estudiado, cuenta hasta ayer', () => {
    expect(racha(['2026-03-08', '2026-03-09'], HOY)).toBe(2);
  });

  it('se rompe con un día sin actividad', () => {
    expect(racha(['2026-03-06', '2026-03-08'], HOY)).toBe(0);
    expect(mejorRacha(['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-05'])).toBe(3);
  });
});

describe('estadísticas', () => {
  const bien = repasar(repasar(tarjetaNueva(HOY), 5, HOY), 5, '2026-03-11');
  const mal = repasar(repasar(tarjetaNueva(HOY), 1, HOY), 1, '2026-03-11');
  const regular = repasar(repasar(tarjetaNueva(HOY), 1, HOY), 5, '2026-03-11');
  const tarjetas = { femur: bien, tibia: mal, humero: regular };

  it('calcula el porcentaje dominado por sistema', () => {
    const esq = dominioPorSistema(tarjetas).find((d) => d.sistema === 'esqueletico')!;
    expect(esq.vistos).toBe(3);
    expect(esq.dominados).toBe(1);
    expect(esq.porcentaje).toBeCloseTo(1 / esq.total, 6);
  });

  it('ordena las estructuras difíciles por tasa de fallo', () => {
    expect(dificiles(tarjetas).map((d) => d.id)).toEqual(['tibia', 'humero']);
  });

  it('lista los repasos pendientes', () => {
    expect(pendientes(tarjetas, '2026-03-12').sort()).toEqual(['humero', 'tibia']);
  });
});

describe('store de progreso', () => {
  beforeEach(() => useProgresoStore.getState().reiniciarProgreso());

  it('registra respuestas, días activos y persiste en localStorage', () => {
    useProgresoStore.getState().registrar('femur', 5, HOY);
    useProgresoStore.getState().registrar('tibia', 1, HOY);
    const s = useProgresoStore.getState();
    expect(s.tarjetas.femur!.aciertos).toBe(1);
    expect(s.tarjetas.tibia!.fallos).toBe(1);
    expect(s.diasActivos).toEqual([HOY]);
    expect(JSON.parse(localStorage.getItem('atlas3d:progreso')!).state.tarjetas.femur.repeticiones).toBe(1);
  });
});
