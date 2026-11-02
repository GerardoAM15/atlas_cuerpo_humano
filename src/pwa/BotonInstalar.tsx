import { useEffect, useRef, useState } from 'react';
import { instalar, usePwaStore } from './estado';

/**
 * Botón «Instalar» de la cabecera. Si el navegador ofrece la instalación (Chrome, Edge, Android)
 * abre su diálogo; si no (Safari, Firefox), explica cómo hacerlo desde el menú del navegador.
 */
export default function BotonInstalar() {
  const instalada = usePwaStore((s) => s.instalada);
  const [ayuda, setAyuda] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  // Cierra la ayuda con Escape o al hacer clic fuera.
  useEffect(() => {
    if (!ayuda) return;
    const cerrarTecla = (e: KeyboardEvent) => e.key === 'Escape' && setAyuda(false);
    const cerrarClic = (e: PointerEvent) => !contenedor.current?.contains(e.target as Node) && setAyuda(false);
    window.addEventListener('keydown', cerrarTecla);
    window.addEventListener('pointerdown', cerrarClic);
    return () => {
      window.removeEventListener('keydown', cerrarTecla);
      window.removeEventListener('pointerdown', cerrarClic);
    };
  }, [ayuda]);

  if (instalada) return null;

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-expanded={ayuda}
        aria-controls="ayuda-instalar"
        onClick={async () => {
          if (!(await instalar())) setAyuda((v) => !v);
        }}
        className="flex items-center gap-1.5 rounded-md border border-oro-500/50 px-2.5 py-1.5 text-sm font-medium text-oro-200 hover:bg-oro-500/15"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
        Instalar
      </button>
      {ayuda && (
        <div
          id="ayuda-instalar"
          role="dialog"
          aria-label="Cómo instalar la aplicación"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-tinta-700 bg-tinta-900 p-4 text-sm text-tinta-300 shadow-xl"
        >
          <p className="font-semibold text-tinta-100">Instalar el atlas como aplicación</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
            <li>
              <strong>iPhone/iPad (Safari):</strong> botón Compartir → «Añadir a pantalla de inicio».
            </li>
            <li>
              <strong>Android:</strong> menú ⋮ del navegador → «Instalar aplicación» o «Añadir a pantalla de inicio».
            </li>
            <li>
              <strong>Ordenador (Chrome o Edge):</strong> icono de instalar en la barra de direcciones o menú → «Instalar Atlas 3D».
            </li>
          </ul>
          <p className="mt-2 text-xs text-tinta-400">Si no aparece la opción, puede que tu navegador no admita instalar aplicaciones web.</p>
        </div>
      )}
    </div>
  );
}
