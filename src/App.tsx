import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import Cargando from '@/components/Cargando';
import Inicio from '@/pages/Inicio';
import Simulaciones from '@/pages/Simulaciones';
import Estudio from '@/pages/Estudio';
import Creditos from '@/pages/Creditos';
import NoEncontrada from '@/pages/NoEncontrada';

// El atlas arrastra three.js: se carga solo cuando se visita.
const Atlas = lazy(() => import('@/pages/Atlas'));

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
        <Route path="estudio" element={<Estudio />} />
        <Route path="creditos" element={<Creditos />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
