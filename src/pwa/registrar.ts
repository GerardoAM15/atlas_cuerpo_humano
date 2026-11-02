import { registerSW } from 'virtual:pwa-register';
import { usePwaStore, type EventoInstalacion } from './estado';

/**
 * Registra el service worker (generado por vite-plugin-pwa) y escucha los eventos de instalación.
 * Con `autoUpdate`, una versión nueva se activa sola y la página se recarga.
 */
export function registrarPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // se muestra con el botón «Instalar», no con el aviso automático
    usePwaStore.setState({ instalacion: e as EventoInstalacion });
  });
  window.addEventListener('appinstalled', () => usePwaStore.setState({ instalada: true, instalacion: null }));

  if (!usePwaStore.getState().soportado || import.meta.env.DEV) return;
  registerSW({
    immediate: true,
    onOfflineReady: () => usePwaStore.setState({ listaOffline: true }),
    onRegisteredSW: (_url, registro) => {
      // En visitas posteriores el service worker ya está activo: la app ya estaba precacheada.
      if (registro?.active) usePwaStore.setState({ listaOffline: true });
    },
    onRegisterError: (error: unknown) => console.error('No se pudo registrar el service worker', error),
  });
}
