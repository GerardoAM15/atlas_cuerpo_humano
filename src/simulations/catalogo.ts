import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export interface SimulacionInfo {
  id: string;
  titulo: string;
  resumen: string;
  /** Sistemas del atlas con los que se relaciona (para enlazar desde las fichas en el futuro). */
  sistemas: readonly string[];
  Componente: LazyExoticComponent<ComponentType>;
}

/** Catálogo de simulaciones; cada una se carga solo al abrirla. */
export const SIMULACIONES: readonly SimulacionInfo[] = [
  {
    id: 'ciclo-cardiaco',
    titulo: 'Ciclo cardíaco',
    resumen: 'Sístole y diástole, válvulas, flujo sanguíneo, ECG sincronizado, diagrama de Wiggers y bucle presión–volumen.',
    sistemas: ['cardiovascular'],
    Componente: lazy(() => import('./ciclo-cardiaco/CicloCardiaco')),
  },
  {
    id: 'respiracion',
    titulo: 'Respiración',
    resumen: 'Inspiración y espiración, diafragma, espirograma (VT, VRI, VRE, VR, CV) e intercambio alveolar de O₂ y CO₂.',
    sistemas: ['respiratorio'],
    Componente: lazy(() => import('./respiracion/Respiracion')),
  },
  {
    id: 'impulso-nervioso',
    titulo: 'Impulso nervioso',
    resumen: 'Potencial de acción con canales de Na⁺ y K⁺, conducción continua frente a saltatoria y transmisión sináptica.',
    sistemas: ['nervioso'],
    Componente: lazy(() => import('./impulso-nervioso/ImpulsoNervioso')),
  },
  {
    id: 'contraccion-muscular',
    titulo: 'Contracción muscular',
    resumen: 'Filamentos deslizantes (actina, miosina, Ca²⁺ y ATP) y el codo como palanca de tercer género al contraer el bíceps.',
    sistemas: ['muscular', 'esqueletico'],
    Componente: lazy(() => import('./contraccion-muscular/ContraccionMuscular')),
  },
  {
    id: 'digestion',
    titulo: 'Digestión',
    resumen: 'Recorrido del bolo alimenticio de la boca al ano con las enzimas y procesos de cada tramo.',
    sistemas: ['digestivo'],
    Componente: lazy(() => import('./digestion/Digestion')),
  },
  {
    id: 'filtracion-renal',
    titulo: 'Filtración renal',
    resumen: 'La nefrona: filtración glomerular, reabsorción y secreción tubulares hasta formar la orina.',
    sistemas: ['urinario'],
    Componente: lazy(() => import('./filtracion-renal/FiltracionRenal')),
  },
];

export const simulacionPorId = (id: string | undefined) => SIMULACIONES.find((s) => s.id === id);
