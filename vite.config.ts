/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `base` relativo: funciona en GitHub Pages bajo /<repo>/ y en local, gracias a HashRouter.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // React y three/r3f en chunks separados: Inicio no descarga three.js.
        // El núcleo de React (incluido `scheduler`, compartido con r3f) va a "vendor" para que
        // la portada no precargue three.js; las dependencias 3D las reparte Rollup en el chunk del Atlas.
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|@remix-run|scheduler|zustand|use-sync-external-store)[\\/]/.test(id)) {
            return 'vendor';
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
