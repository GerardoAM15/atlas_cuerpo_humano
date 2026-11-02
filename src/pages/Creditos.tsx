import { INDICE, MODELOS } from '@/data/catalogo';
import { SISTEMAS } from '@/data/sistemas';

const mb = (bytes: number) => `${(bytes / 1_048_576).toFixed(2).replace('.', ',')} MB`;
const miles = (n: number) => n.toLocaleString('es-ES');

/** Bibliotecas incluidas en la aplicación o usadas para generar los modelos. */
const SOFTWARE = [
  { nombre: 'React y React DOM', licencia: 'MIT', url: 'https://react.dev' },
  { nombre: 'React Router', licencia: 'MIT', url: 'https://reactrouter.com' },
  { nombre: 'three.js', licencia: 'MIT', url: 'https://threejs.org' },
  { nombre: '@react-three/fiber y @react-three/drei', licencia: 'MIT', url: 'https://github.com/pmndrs/react-three-fiber' },
  { nombre: 'camera-controls', licencia: 'MIT', url: 'https://github.com/yomotsu/camera-controls' },
  { nombre: 'Zustand', licencia: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { nombre: 'Zod', licencia: 'MIT', url: 'https://zod.dev' },
  { nombre: 'Fuse.js', licencia: 'Apache 2.0', url: 'https://www.fusejs.io' },
  { nombre: 'Tailwind CSS', licencia: 'MIT', url: 'https://tailwindcss.com' },
  { nombre: 'Vite, vite-plugin-pwa y Workbox', licencia: 'MIT', url: 'https://vite-pwa-org.netlify.app' },
  { nombre: 'meshoptimizer (compresión de mallas)', licencia: 'MIT', url: 'https://github.com/zeux/meshoptimizer' },
  { nombre: 'glTF-Transform (pipeline)', licencia: 'MIT', url: 'https://gltf-transform.dev' },
  { nombre: 'obj2gltf (pipeline)', licencia: 'Apache 2.0', url: 'https://github.com/CesiumGS/obj2gltf' },
] as const;

function Enlace({ href, children }: { href: string; children: string }) {
  return (
    <a className="text-sky-400 underline hover:text-sky-300" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function Creditos() {
  const bp3d = MODELOS.fuentes.bodyparts3d;
  const za = MODELOS.fuentes['z-anatomy'];
  const deZAnatomy = INDICE.filter((e) => e.fuenteModelo === 'z-anatomy' && !e.lado?.startsWith('izq'));

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Créditos y licencias</h1>

      <div className="mt-6 space-y-6 text-slate-300">
        {bp3d && (
          <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Modelos 3D: {bp3d.nombre}</h2>
            <p className="mt-2">«{bp3d.atribucion}».</p>
            <p className="mt-2">
              Licencia: <Enlace href={bp3d.urlLicencia}>{bp3d.licencia}</Enlace>. Fuente: <Enlace href={bp3d.url}>LSDB Archive (DBCLS)</Enlace>, versión{' '}
              {bp3d.version}. Estructuras identificadas con IDs del <em>Foundational Model of Anatomy</em> (FMA).
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Modificaciones: conversión OBJ → glTF (obj2gltf), cambio de ejes y unidades (mm → m), agrupación por sistema, simplificación de mallas y
              compresión meshopt. {bp3d.nota}
            </p>
          </article>
        )}

        {za && (
          <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Modelos 3D: {za.nombre}</h2>
            <p className="mt-2">«{za.atribucion}».</p>
            <p className="mt-2">
              Licencia: <Enlace href="https://creativecommons.org/licenses/by-sa/4.0/deed.es">{za.licencia}</Enlace> (Reconocimiento-CompartirIgual). Fuente:{' '}
              <Enlace href={za.url}>Z-Anatomy/The-blend</Enlace>, {za.version}.
            </p>
            <p className="mt-2">
              Se usa para las estructuras que BodyParts3D no tiene: {deZAnatomy.map((e) => e.nombre.replace(/ derech[oa]$/, '')).join(', ')}. Estas mallas y sus derivados en este
              proyecto se distribuyen bajo CC BY-SA 4.0.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Modificaciones: exportación a glTF con Blender (modificadores aplicados, curvas convertidas en mallas), alineación con BodyParts3D por
              escala y traslación ajustadas con estructuras vecinas, agrupación por sistema y compresión meshopt.
            </p>
          </article>
        )}

        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Contenido textual</h2>
          <p className="mt-2">
            Redactado con fines educativos a partir de fuentes de referencia generales (Gray&apos;s Anatomy, Moore, Netter, OpenStax <em>Anatomy &amp; Physiology</em>).
            Consulta <code>docs/FUENTES.md</code> en el repositorio. Los datos dudosos se marcan como «pendiente de revisión» en la ficha.
          </p>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Modelos utilizados</h2>
          <p className="mt-2 text-sm text-slate-400">
            Generado a partir del manifest del pipeline: {mb(MODELOS.bytesTotales)} en total. Despliega un sistema para ver cada estructura con sus
            conceptos FMA.
          </p>
          <div className="mt-3 space-y-2">
            {SISTEMAS.map((s) => {
              const m = MODELOS.sistemas[s.id];
              const estructuras = INDICE.filter((e) => e.sistema === s.id);
              const conModelo = estructuras.filter((e) => e.nodoModelo);
              const pendientes = estructuras.filter((e) => !e.nodoModelo);
              return (
                <details key={s.id} className="rounded border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm">
                  <summary className="cursor-pointer">
                    <span className="font-medium text-slate-100">{s.nombre}</span>{' '}
                    <span className="text-xs text-slate-400">
                      {conModelo.length} con modelo · {pendientes.length} sin modelo
                      {m ? ` · ${miles(m.triangulos)} triángulos · ${mb(m.bytes)}` : ''}
                    </span>
                  </summary>
                  <ul className="mt-2 space-y-0.5 text-xs">
                    {conModelo.map((e) => (
                      <li key={e.id}>
                        {e.nombre} <span className="text-slate-400">— {e.fuenteModelo === 'z-anatomy' ? 'Z-Anatomy (CC BY-SA 4.0)' : e.fma?.join(', ')}</span>
                      </li>
                    ))}
                  </ul>
                  {pendientes.length > 0 && (
                    <>
                      <p className="mt-2 text-xs font-semibold text-amber-300">Sin modelo</p>
                      <ul className="mt-1 space-y-0.5 text-xs text-slate-400">
                        {pendientes.map((e) => (
                          <li key={e.id}>
                            {e.nombre}
                            {e.motivo ? ` — ${e.motivo}` : ''}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </details>
              );
            })}
          </div>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Software</h2>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {SOFTWARE.map((b) => (
              <li key={b.nombre}>
                <Enlace href={b.url}>{b.nombre}</Enlace> <span className="text-slate-400">({b.licencia})</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
