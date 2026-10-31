import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * Acceso a localStorage protegido con try/catch: en modo privado, con el
 * almacenamiento bloqueado o lleno, la app sigue funcionando sin persistir.
 */
export const almacenamientoSeguro: StateStorage = {
  getItem: (clave) => {
    try {
      return globalThis.localStorage?.getItem(clave) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (clave, valor) => {
    try {
      globalThis.localStorage?.setItem(clave, valor);
    } catch {
      // Sin persistencia: se ignora el error.
    }
  },
  removeItem: (clave) => {
    try {
      globalThis.localStorage?.removeItem(clave);
    } catch {
      // Sin persistencia: se ignora el error.
    }
  },
};

export const almacenamientoJSON = createJSONStorage(() => almacenamientoSeguro);
