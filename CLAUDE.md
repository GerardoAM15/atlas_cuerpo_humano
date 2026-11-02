# CLAUDE.md — Atlas 3D interactivo del cuerpo humano

Proyecto personal de estudio de anatomía y fisiología. Aplicación web para explorar el cuerpo en 3D por
sistemas, consultar la ficha de cada estructura, ver simulaciones fisiológicas y practicar con quizzes.

## Idioma
- Interfaz, comentarios de código, commits y documentación: **español**.
- Cada estructura muestra su nombre en español, **latín (Terminologia Anatomica)** e inglés.

## Stack (obligatorio)
- Vite + React 18 + TypeScript `strict` (+ `noUncheckedIndexedAccess`).
- Three.js con `@react-three/fiber` **v8** y `@react-three/drei` **v9** (las versiones superiores exigen React 19).
- Modelos `.glb` comprimidos (Draco o Meshopt), carga diferida por sistema (`useGLTF` + `Suspense`).
- Tailwind CSS v4 (plugin `@tailwindcss/vite`), tema oscuro por defecto.
- Zustand (estado global), React Router con **HashRouter** (GitHub Pages), Fuse.js (búsqueda), Zod (esquemas), Vitest.
- Persistencia en `localStorage` siempre a través de `src/store/almacenamiento.ts` (try/catch).
- Despliegue: GitHub Pages con GitHub Actions. `base: './'` en Vite.

## Modelos 3D
- **No modelar anatomía con primitivas.** Usar modelos reales con licencia libre:
  - Principal: BodyParts3D 4.0 (DBCLS, **CC BY 4.0** desde el 25/02/2025; antes CC BY-SA 2.1 JP), OBJ por
    estructura con IDs FMA. Descarga automatizada; ver `docs/PIPELINE.md`.
  - Complemento: Z-Anatomy (CC BY-SA 4.0, `.blend` → glTF con Blender CLI).
- Pipeline reproducible en `/scripts`: descarga → OBJ→glTF (obj2gltf) → un `.glb` por sistema (cada estructura
  es un nodo con nombre = id propio) → `@gltf-transform/cli` (weld, simplify, draco/meshopt) →
  `public/models/<sistema>.glb` + `src/data/manifest-modelos.json`.
- Presupuesto: cada sistema < 8 MB, total < 80 MB.
- Crudos en `/assets-raw` (en `.gitignore`, nunca se suben). Los `.glb` optimizados sí, si caben (< 100 MB por archivo).
- **Si un modelo no está disponible, NO inventar**: marcarlo como pendiente en el manifest y avisar.
- Mantener la página «Créditos y licencias» con la atribución exigida por cada licencia (la de
  BodyParts3D está en `src/data/manifest-modelos.json` → `fuentes`). Lo que venga de Z-Anatomy obliga a CC BY-SA.

## Datos (separados del 3D)
- `src/data/estructuras/<sistema>.json`, una entrada por estructura:
  `id, nodoModelo, nombre, latin, ingles, sistema, region, tipo, descripcion, funcion, ubicacion, relaciones,
  datosClinicos, curiosidad` + extras por tipo (huesos: clasificación, articulaciones; músculos: origen,
  inserción, inervación, irrigación, acción).
- **Los JSON se generan; no se editan a mano.** La fuente está en `scripts/datos/<sistema>/` (módulos compactos:
  `par()` crea la versión derecha/izquierda; en ids, `~` = mismo lado y `^` = lado opuesto). Tras editar:
  `npm run datos`. `nodoModelo` se toma del manifest y `relaciones` se deriva de las articulaciones más `relacionesExtra`.
- `npm run datos` genera también `src/data/indice.json` (resumen de cada estructura: nombres, región, tipo, lado, caja
  y FMA del modelo, motivo si está pendiente) y `src/data/modelos.json` (fuentes; archivo, bytes y hash de cada `.glb`).
  La app **no importa** `manifest-modelos.json` (solo scripts y tests).
- Catálogo (`src/data/catalogo.ts`): `INDICE`/`POR_ID` (resumen, síncrono) y fichas completas bajo demanda por sistema
  (`cargarSistemas`, `useFichas`, `fichaDe`; un chunk por sistema). `src/data/modelos.ts` es ligero (lo usa la portada).
- Esquemas Zod en `src/data/esquemas.ts`; el catálogo valida el índice y cada sistema al cargarlos. Tests de integridad:
  ids únicos, 206 huesos, cada `nodoModelo` existe en el manifest (o la estructura está `pendiente`), relaciones
  válidas, articulaciones recíprocas, regiones conocidas (`src/data/regiones.ts`) y pares completos.
- Nivel universitario introductorio, preciso y conciso. Fuentes generales en `docs/FUENTES.md`.
- **Precisión anatómica ante todo**: si un dato no es seguro, marcarlo para revisión (campo `revisar`) en vez de inventarlo.

## Arquitectura
```
src/
  viewer/       Escena, cámara, selección, clipping, carga de modelos
  data/         JSON + esquemas Zod + loaders
  simulations/  una carpeta por simulación
  study/        quiz, SM-2, progreso
  components/   UI reutilizable
  pwa/          service worker (registro), botón Instalar, descarga de modelos para usar sin conexión
  store/        Zustand
  pages/        Inicio, Atlas, Simulaciones, Estudio, Créditos
scripts/        pipeline de modelos
docs/           README técnico, fuentes, licencias
```
- Alias de importación: `@/` → `src/`.
- Las páginas con three.js se cargan con `React.lazy` para no penalizar la portada. three.js, r3f y drei van al chunk
  `three`; la portada no debe precargarlo (comprobar `dist/index.html` tras cambiar `manualChunks`).
- PWA (`vite-plugin-pwa`, `registerType: 'autoUpdate'`): precache de la app; `.glb` con CacheFirst en la caché
  `atlas-modelos` (`src/pwa/cache.ts`). La URL del modelo lleva `?v=<hash>` (de `modelos.json`).
- Simulaciones (`src/simulations/<id>/`): `modelo.ts` con funciones puras del tiempo (curvas fisiológicas, fases),
  probadas en `modelo.test.ts`, y un componente SVG que usa lo común de `src/simulations/comun/` (reloj con
  Play/Pausa/velocidad, `GraficaLinea`, `Pasos` narrados, `MarcoSimulacion` con la etiqueta «Esquemático»).
  Se registran en `src/simulations/catalogo.ts` (carga diferida, ruta `/simulaciones/:id`). Valores típicos de
  adulto en reposo; las simplificaciones se indican en la propia interfaz.
- Modo estudio (`src/study/`): `sm2.ts` (repetición espaciada), `conceptos.ts` (el progreso se guarda por concepto:
  derecha e izquierda cuentan juntas), `respuestas.ts` (respuestas escritas), `generador.ts` (preguntas con semilla,
  sin repetir y con distractores según la dificultad) y `progreso.ts` (estadísticas y store persistente
  `atlas3d:progreso`). El quiz reutiliza el `Visor` en «modo quiz» (sin etiquetas que revelen la respuesta).

## Rendimiento
- Objetivo: 60 FPS en una laptop sin GPU dedicada (medir con el botón «FPS» del visor). Sombras desactivadas por defecto; instancing/merge cuando se
  pueda; `dpr` limitado; carga diferida por sistema con barra de progreso.

## Pruebas
- Validación de datos (Zod + integridad), SM-2 (intervalos), generador de quiz (sin repetición, opciones únicas,
  respuesta correcta incluida), búsqueda (español/latín/inglés, con y sin acentos).
- Los tests van junto al código (`*.test.ts[x]`). Setup en `src/test/setup.ts`.

## Flujo de trabajo por fases
- Fase 0: proyecto, dependencias, estructura, layout, router, inicio, este archivo, git init.
- Fase 1: pipeline de modelos (solo esquelético primero).
- Fase 2: visor 3D completo con el esqueleto + datos de los 206 huesos.
- Fase 3: muscular, cardiovascular, respiratorio.
- Fase 4: nervioso, digestivo, urinario, endocrino, linfático, reproductor, sentidos.
- Fase 5: simulaciones (primero ciclo cardíaco y respiración).
- Fase 6: modo estudio.
- Fase 7: rendimiento, responsive, accesibilidad, créditos, deploy, README.

**Reglas:** una fase a la vez y esperar confirmación del usuario. Al terminar cada fase: `npm run build` y
`npm test` sin errores, resumen corto (qué se hizo y cómo probarlo) y commit descriptivo.

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — typecheck + build de producción
- `npm test` — pruebas (Vitest)
- `npm run preview` — sirve `dist/`
- `npm run datos` — regenera `src/data/estructuras/*.json`, `indice.json` y `modelos.json` (también tras `npm run modelos`)
- `npm run modelos` — regenera los `.glb` y el manifest (requiere `npm run modelos:descargar`)
