import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import Cargando from '@/components/Cargando';
import Inicio from '@/pages/Inicio';
import Simulaciones from '@/pages/Simulaciones';
import Simulacion from '@/pages/Simulacion';
import NoEncontrada from '@/pages/NoEncontrada';

// El atlas, el quiz y las flashcards arrastran three.js: se cargan solo cuando se visitan.
const Atlas = lazy(() => import('@/pages/Atlas'));
// El modo estudio usa el catálogo completo de fichas: también se carga aparte para no engordar la portada.
const Estudio = lazy(() => import('@/pages/Estudio'));
const Quiz = lazy(() => import('@/study/ui/Quiz'));
const Flashcards = lazy(() => import('@/study/ui/Flashcards'));
// Créditos lista los modelos de cada sistema (usa el índice de estructuras).
const Creditos = lazy(() => import('@/pages/Creditos'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route
          path="atlas"
          element={
            <Suspense fallback={<Cargando texto="Cargando visor 3D…" />}>
              <Atlas />
            </Suspense>
          }
        />
        <Route path="simulaciones" element={<Simulaciones />} />
        <Route path="simulaciones/:id" element={<Simulacion />} />
        <Route
          path="estudio"
          element={
            <Suspense fallback={<Cargando texto="Cargando el modo estudio…" />}>
              <Estudio />
            </Suspense>
          }
        />
        <Route
          path="estudio/quiz"
          element={
            <Suspense fallback={<Cargando texto="Preparando el quiz…" />}>
              <Quiz />
            </Suspense>
          }
        />
        <Route
          path="estudio/flashcards"
          element={
            <Suspense fallback={<Cargando texto="Preparando las tarjetas…" />}>
              <Flashcards />
            </Suspense>
          }
        />
        <Route
          path="creditos"
          element={
            <Suspense fallback={<Cargando texto="Cargando créditos…" />}>
              <Creditos />
            </Suspense>
          }
        />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
