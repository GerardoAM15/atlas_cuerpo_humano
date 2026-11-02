import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtlasStore } from '@/store/useAtlasStore';
import Visor from '@/viewer/Visor';
import ArbolEstructuras from '@/viewer/ui/ArbolEstructuras';
import BarraHerramientas from '@/viewer/ui/BarraHerramientas';
import Buscador from '@/viewer/ui/Buscador';
import Ficha from '@/viewer/ui/Ficha';
import LeyendaPines from '@/viewer/ui/LeyendaPines';
import PanelSistemas from '@/viewer/ui/PanelSistemas';

export default function Atlas() {
  const seleccion = useAtlasStore((s) => s.seleccion);
  const seleccionar = useAtlasStore((s) => s.seleccionar);
  const [panelAbierto, setPanelAbierto] = useState(false);

  // En móvil el panel es un cajón superpuesto: se cierra al elegir una estructura para ver su ficha.
  useEffect(() => {
    if (seleccion) setPanelAbierto(false);
  }, [seleccion]);

  // Escape cierra la ficha (salvo cuando se está escribiendo en un campo).
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'SELECT', 'TEXTAREA'].includes(t.tagName)) return;
      seleccionar(null);
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [seleccionar]);

  // Alto de la ventana menos la cabecera (3,5 rem + 1 px de borde): sin scroll de página.
  return (
    <div className="relative flex h-[calc(100dvh-3.5rem-1px)] overflow-hidden">
      <h1 className="sr-only">Atlas 3D</h1>
      {/* Panel lateral: búsqueda, sistemas y árbol. En móvil es un cajón superpuesto. */}
      <aside
        aria-label="Sistemas y estructuras"
        className={`${panelAbierto ? 'flex' : 'hidden'} absolute inset-y-0 left-0 z-30 w-[85%] max-w-80 flex-col border-r border-slate-800 bg-slate-950 lg:static lg:flex lg:w-80`}
      >
        <div className="border-b border-slate-800 p-3">
          <Buscador />
        </div>
        <div className="border-b border-slate-800 p-3">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Sistemas</h2>
          <PanelSistemas />
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Estructuras</h2>
          <ArbolEstructuras />
        </div>
      </aside>

      <section aria-label="Visor 3D" className="relative min-w-0 flex-1">
        <Visor />
        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => setPanelAbierto((v) => !v)}
            aria-expanded={panelAbierto}
            className="pointer-events-auto rounded-md bg-slate-800/90 px-2.5 py-1.5 text-xs font-medium text-slate-100 lg:hidden"
          >
            {panelAbierto ? 'Cerrar panel' : 'Buscar y sistemas'}
          </button>
          <div className="pointer-events-auto ml-auto">
            <BarraHerramientas />
          </div>
        </div>
        <div className="absolute bottom-2 left-2">
          <LeyendaPines />
        </div>
        <div className="pointer-events-none absolute bottom-2 right-3 text-right text-[11px] text-slate-400">
          <p className="hidden sm:block">Arrastrar: girar · Rueda: zoom · Clic derecho: desplazar · Esc: deseleccionar</p>
          <p>
            Modelos: BodyParts3D © DBCLS (CC BY 4.0) ·{' '}
            <Link to="/creditos" className="pointer-events-auto underline hover:text-slate-200">
              créditos
            </Link>
          </p>
        </div>
      </section>

      {/* Ficha: panel derecho en escritorio, hoja inferior en móvil. */}
      {seleccion && (
        <aside
          aria-label="Ficha de la estructura"
          className="absolute inset-x-0 bottom-0 z-20 max-h-[55%] overflow-auto border-t border-slate-800 bg-slate-950/95 backdrop-blur lg:static lg:max-h-none lg:w-96 lg:border-l lg:border-t-0"
        >
          <Ficha />
        </aside>
      )}
    </div>
  );
}
