import { useCallback, useEffect, useState } from 'react';

export const VELOCIDADES = [0.1, 0.25, 0.5, 1, 2] as const;

const prefiereMenosMovimiento = () => {
  try {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
};

/**
 * Reloj de simulación basado en requestAnimationFrame.
 * `t` avanza en segundos de simulación (= segundos reales × velocidad); cada simulación
 * interpreta esa unidad a su escala (s, ms…). Con «reducir movimiento» empieza en pausa.
 */
export function useReloj(velocidadInicial = 1) {
  const [t, setT] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(() => !prefiereMenosMovimiento());
  const [velocidad, setVelocidad] = useState(velocidadInicial);

  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let anterior = performance.now();
    const paso = (ahora: number) => {
      // Se limita el salto para que una pestaña en segundo plano no adelante la simulación de golpe.
      const dt = Math.min(0.1, (ahora - anterior) / 1000);
      anterior = ahora;
      setT((x) => x + dt * velocidad);
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo, velocidad]);

  const reiniciar = useCallback(() => setT(0), []);
  return { t, setT, reproduciendo, setReproduciendo, velocidad, setVelocidad, reiniciar };
}

export type Reloj = ReturnType<typeof useReloj>;
