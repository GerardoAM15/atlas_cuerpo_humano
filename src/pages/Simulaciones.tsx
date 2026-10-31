import PaginaEnConstruccion from '@/components/PaginaEnConstruccion';

const SIMULACIONES = [
  ['Ciclo cardíaco', 'Sístole y diástole, válvulas, flujo sanguíneo, ECG sincronizado y diagrama de Wiggers.'],
  ['Respiración', 'Inspiración/espiración, espirograma (VT, VRI, VRE, VR, CV) e intercambio alveolar de O₂/CO₂.'],
  ['Impulso nervioso', 'Potencial de acción, canales de Na⁺/K⁺, conducción saltatoria y sinapsis.'],
  ['Contracción muscular', 'Filamentos deslizantes (actina, miosina, Ca²⁺, ATP) y palanca del codo.'],
  ['Digestión', 'Recorrido del bolo alimenticio con las enzimas y procesos de cada tramo.'],
  ['Filtración renal', 'Nefrona: filtración, reabsorción y secreción.'],
] as const;

export default function Simulaciones() {
  return (
    <PaginaEnConstruccion titulo="Simulaciones fisiológicas" fase={5}>
      <p>Animaciones con Play/Pausa, control de velocidad y explicación narrada paso a paso.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SIMULACIONES.map(([titulo, texto]) => (
          <li key={titulo} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="font-semibold text-slate-100">{titulo}</h2>
            <p className="mt-1 text-sm text-slate-400">{texto}</p>
          </li>
        ))}
      </ul>
    </PaginaEnConstruccion>
  );
}
