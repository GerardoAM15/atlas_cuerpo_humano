export default function Creditos() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Créditos y licencias</h1>

      <div className="mt-6 space-y-6 text-slate-300">
        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-lg font-semibold text-slate-100">BodyParts3D</h2>
          <p className="mt-2">
            BodyParts3D, © The Database Center for Life Science (DBCLS), bajo licencia{' '}
            <a
              className="text-sky-400 underline"
              href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.es"
              target="_blank"
              rel="noreferrer"
            >
              Creative Commons Reconocimiento-CompartirIgual 2.1 Japón
            </a>
            . Estructuras identificadas con IDs del <em>Foundational Model of Anatomy</em> (FMA).
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Modificaciones: conversión OBJ → glTF, agrupación por sistema, soldadura y simplificación de mallas y
            compresión. Los modelos derivados se distribuyen bajo la misma licencia.
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
