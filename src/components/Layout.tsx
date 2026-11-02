import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import BotonInstalar from '@/pwa/BotonInstalar';
import { RUTAS_NAV } from './rutas';

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-oro-500/15 text-oro-300' : 'text-tinta-300 hover:bg-tinta-800 hover:text-tinta-50',
  ].join(' ');

export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  // El atlas ocupa toda la altura de la ventana: allí el pie (y la atribución) va dentro del visor.
  const pantallaCompleta = useLocation().pathname === '/atlas';

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-oro-600 focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-tinta-800 bg-tinta-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <img src="./favicon.svg" alt="" className="h-7 w-7" />
            <span>
              Atlas 3D <span className="hidden text-tinta-400 sm:inline">del Cuerpo Humano</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden gap-1 md:flex">
            {RUTAS_NAV.map((r) => (
              <NavLink key={r.ruta} to={r.ruta} end={r.ruta === '/'} className={claseEnlace}>
                {r.etiqueta}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <BotonInstalar />
            <button
              type="button"
              className="rounded-md p-2 text-tinta-300 hover:bg-tinta-800 md:hidden"
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuAbierto((v) => !v)}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {menuAbierto ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuAbierto && (
          <nav id="menu-movil" aria-label="Principal (móvil)" className="flex flex-col gap-1 px-4 pb-3 md:hidden">
            {RUTAS_NAV.map((r) => (
              <NavLink
                key={r.ruta}
                to={r.ruta}
                end={r.ruta === '/'}
                className={claseEnlace}
                onClick={() => setMenuAbierto(false)}
              >
                {r.etiqueta}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="contenido" className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className={`border-t border-tinta-800 px-4 py-4 text-center text-xs text-tinta-400 ${pantallaCompleta ? 'hidden' : ''}`}>
        Proyecto de <span className="text-tinta-300">Gerardo Alarcón</span>. Contenido educativo; no sustituye la consulta médica. Modelos 3D:
        BodyParts3D © DBCLS (CC BY 4.0) y Z-Anatomy (CC BY-SA 4.0) —{' '}
        <Link to="/creditos" className="underline hover:text-tinta-300">
          ver créditos
        </Link>
        .
      </footer>
    </div>
  );
}
