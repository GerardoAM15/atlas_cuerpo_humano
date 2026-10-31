export default function Creditos() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Créditos y licencias</h1>

      <div className="mt-6 space-y-6 text-slate-300">
        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-semibold text-slate-100">BodyParts3D</h2>
          <p className="mt-2">
            «BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International».
            Licencia:{' '}
            <a
              className="text-sky-400 underline"
              href="https://creativecommons.org/licenses/by/4.0/deed.es"
              target="_blank"
              rel="noreferrer"
            >
              Creative Commons Atribución 4.0 Internacional
            </a>
            . Fuente:{' '}
            <a
              className="text-sky-400 underline"
              href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html"
              target="_blank"
              rel="noreferrer"
            >
              LSDB Archive (DBCLS)
            </a>
            , versión 4.0. Estructuras identificadas con IDs del <em>Foundational Model of Anatomy</em> (FMA).
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Modificaciones: conversión OBJ → glTF (obj2gltf), cambio de ejes y unidades (mm → m), agrupación por
            sistema, simplificación de mallas y compresión meshopt. Hasta el 25/02/2025 la base de datos se
            distribuía bajo CC BY-SA 2.1 JP.
          </p>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Z-Anatomy</h2>
          <p className="mt-2">
            Z-Anatomy, bajo licencia{' '}
            <a
              className="text-sky-400 underline"
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.es"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 4.0
            </a>
            . Se usará como complemento donde BodyParts3D no tenga cobertura.
          </p>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Contenido textual</h2>
          <p className="mt-2">
            Redactado con fines educativos a partir de fuentes de referencia generales (Gray&apos;s Anatomy, Moore,
            Netter, OpenStax <em>Anatomy &amp; Physiology</em>). Consulta <code>docs/FUENTES.md</code> en el
            repositorio.
          </p>
        </article>

        <p className="text-sm text-slate-500">
          La lista detallada de modelos utilizados (por ID FMA) se generará automáticamente desde el manifest del
          pipeline.
        </p>
      </div>
    </section>
  );
}
