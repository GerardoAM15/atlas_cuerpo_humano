/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { CACHE_MODELOS } from './src/pwa/cache';

// PWA instalable: el service worker precachea la app (JS, CSS, HTML, iconos; las fichas JSON van
// dentro de los chunks JS) y guarda en caché cada modelo .glb la primera vez que se abre.
const pwa = VitePWA({
  registerType: 'autoUpdate',
  // El registro se hace en src/pwa/registrar.ts para mostrar el estado offline en la interfaz.
  injectRegister: false,
  includeAssets: ['favicon.svg', 'iconos/apple-touch-icon.png'],
  manifest: {
    name: 'Atlas 3D del Cuerpo Humano',
    short_name: 'Atlas 3D',
    description: 'Atlas 3D interactivo del cuerpo humano: anatomía por sistemas, simulaciones fisiológicas y modo estudio.',
    lang: 'es',
    start_url: './',
    scope: './',
    display: 'standalone',
    theme_color: '#020617',
    background_color: '#020617',
    categories: ['education', 'medical'],
    icons: [
      { src: 'iconos/icono-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'iconos/icono-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'iconos/icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
    // Ningún .glb en el precache (≈20 MB): se guardan al visitarlos o con «Descargar todo».
    globIgnores: ['models/**'],
    navigateFallback: 'index.html',
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        // La URL lleva ?v=<hash>: un modelo regenerado es una entrada nueva y la antigua caduca.
        urlPattern: ({ url }) => url.pathname.endsWith('.glb'),
        handler: 'CacheFirst',
        options: {
          cacheName: CACHE_MODELOS,
          cacheableResponse: { statuses: [200] },
          expiration: { maxEntries: 40, purgeOnQuotaError: false },
        },
      },
    ],
  },
});

// `base` relativo: funciona en GitHub Pages bajo /<repo>/ y en local, gracias a HashRouter.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), pwa],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // three.js + r3f + drei ocupan ~900 kB (≈250 kB gzip) y solo los cargan las páginas 3D.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // React y three/r3f en chunks separados con nombre propio: Inicio no descarga three.js.
        // El núcleo de React (incluido `scheduler`, compartido con r3f) va a "vendor" para que
        // la portada no precargue three.js; three.js, r3f, drei y sus dependencias van a "three".
        manualChunks(id) {
          // El helper de precarga de Vite lo usa la portada: si cae en "three", la portada lo precarga.
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'vendor';
          if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|@remix-run|scheduler|zustand|use-sync-external-store)[\\/]/.test(id)) {
            return 'vendor';
          }
          if (/node_modules[\\/](three|three-stdlib|@react-three|camera-controls|troika-[^\\/]+|its-fine|react-reconciler|suspend-react|meshline|maath|stats-gl|stats\.js|detect-gpu|tunnel-rat|@monogrid|hls\.js|three-mesh-bvh|@use-gesture|@mediapipe|bidi-js|webgl-sdf-generator)[\\/]/.test(id)) {
            return 'three';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
