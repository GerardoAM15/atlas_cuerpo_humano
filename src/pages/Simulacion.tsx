import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import Cargando from '@/components/Cargando';
import { simulacionPorId } from '@/simulations/catalogo';
import NoEncontrada from './NoEncontrada';

/** Página de una simulación concreta (/simulaciones/:id), cargada de forma diferida. */
export default function Simulacion() {
  const { id } = useParams();
  const sim = simulacionPorId(id);
  if (!sim) return <NoEncontrada />;
  const { Componente } = sim;
  return (
    <Suspense fallback={<Cargando texto={`Cargando ${sim.titulo.toLowerCase()}…`} />}>
      <Componente />
    </Suspense>
  );
}
