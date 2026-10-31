import PaginaEnConstruccion from '@/components/PaginaEnConstruccion';

export default function Estudio() {
  return (
    <PaginaEnConstruccion titulo="Modo estudio" fase={6}>
      <ul className="list-disc space-y-1 pl-5">
        <li>Quiz «Encuentra la estructura»: haz clic en el modelo 3D.</li>
        <li>Quiz «¿Qué es esto?»: elige entre 4 opciones o escribe el nombre.</li>
        <li>Preguntas de función, origen/inserción e inervación generadas desde los datos.</li>
        <li>Repetición espaciada (SM-2) y panel de progreso por sistema.</li>
        <li>Flashcards con imagen 3D renderizada de cada estructura.</li>
      </ul>
      <p className="text-sm text-slate-500">Tu progreso se guardará solo en este navegador (localStorage).</p>
    </PaginaEnConstruccion>
  );
}
