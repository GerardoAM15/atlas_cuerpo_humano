import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-tinta-400">La ruta que buscas no existe.</p>
      <Link to="/" className="mt-6 inline-block text-oro-400 underline">
        Volver al inicio
      </Link>
    </section>
  );
}
