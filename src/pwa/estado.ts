import { create } from 'zustand';

/** Evento no estándar (Chromium) que permite mostrar el diálogo de instalación cuando se quiera. */
export interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface EstadoPwa {
  /** El navegador admite service workers (en http sin TLS, o en algunos navegadores, no). */
  soportado: boolean;
  /** La app está precacheada: abre sin conexión. */
  listaOffline: boolean;
  /** Evento guardado para lanzar la instalación desde el botón «Instalar». */
  instalacion: EventoInstalacion | null;
  /** Se está ejecutando como app instalada (o se acaba de instalar). */
  instalada: boolean;
}

export const usePwaStore = create<EstadoPwa>(() => ({
  soportado: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  listaOffline: false,
  instalacion: null,
  instalada:
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true),
}));

/** Lanza el diálogo de instalación del navegador. Devuelve false si no está disponible. */
export async function instalar(): Promise<boolean> {
  const evento = usePwaStore.getState().instalacion;
  if (!evento) return false;
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  // El evento solo puede usarse una vez.
  usePwaStore.setState({ instalacion: null, instalada: outcome === 'accepted' });
  return true;
}
