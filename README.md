# Atlas 3D interactivo del cuerpo humano

Aplicación web para estudiar anatomía y fisiología: explorar el cuerpo en 3D por sistemas, hacer clic en
cualquier estructura para ver su ficha (español, latín e inglés), ver simulaciones fisiológicas animadas y
practicar con quizzes y repetición espaciada. Se puede instalar como aplicación y usar sin internet.

**Web:** https://gerardoam15.github.io/atlas_cuerpo_humano/

## Qué incluye
- **Atlas 3D** con 11 sistemas y 825 estructuras (762 con modelo 3D real de BodyParts3D y Z-Anatomy, 19,6 MB en total):
  búsqueda difusa en tres idiomas, árbol por regiones, ficha de cada estructura, cortes anatómicos, modo explosión,
  pines numerados, vistas rápidas y medidor de FPS.
- **Simulaciones** esquemáticas: ciclo cardíaco, respiración, impulso nervioso, contracción muscular, digestión y
  filtración renal.
- **Modo estudio**: quiz sobre el modelo 3D y de texto (función, origen/inserción, inervación), flashcards y
  repetición espaciada SM-2 con progreso por sistema.
- **PWA**: botón «Instalar», funcionamiento sin conexión y descarga de todos los modelos con barra de progreso.

| Sistema | Estructuras | Con modelo |
|---|---:|---:|
| Esquelético | 243 | 236 |
| Muscular | 236 | 222 |
| Cardiovascular | 102 | 102 |
| Nervioso | 74 | 55 |
| Digestivo | 42 | 38 |
| Respiratorio | 33 | 31 |
| Órganos de los sentidos | 24 | 23 |
| Reproductor | 26 | 19 |
| Urinario | 18 | 16 |
| Endocrino | 18 | 12 |
| Linfático e inmune | 9 | 8 |

Lo que BodyParts3D no tiene se completa con Z-Anatomy (CC BY-SA 4.0) cuando existe y es fiable: ganglios linfáticos,
amígdalas palatinas y conductos deferentes. Se revisaron y descartaron la tiroides y las paratiroides de Z-Anatomy (mal
situadas) y su pelvis renal (posible origen con licencia no comercial); ver docs/PIPELINE.md. Lo que no tiene modelo
(pulmones, tiroides, aparato genital femenino, conducto torácico…) tiene ficha completa y figura como «sin modelo» con el
motivo; la lista está en la página de créditos.

## Uso
Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # Vitest
npm run build     # typecheck + build de producción (incluye el service worker)
npm run preview   # sirve dist/ (para probar la PWA y el modo sin conexión)
npm run datos     # regenera las fichas JSON, el índice y el resumen de modelos
npm run modelos   # regenera los .glb (requiere npm run modelos:descargar)
npm run modelos:zanatomy   # exporta de Z-Anatomy con Blender CLI (ver docs/PIPELINE.md)
```

## Arquitectura
- Vite + React 18 + TypeScript estricto, three.js con @react-three/fiber 8 y drei 9, Tailwind CSS 4, Zustand,
  React Router (HashRouter), Fuse.js, Zod y Vitest. Detalles y reglas del proyecto en [CLAUDE.md](CLAUDE.md).
- **Carga bajo demanda.** La portada solo descarga React y la propia página (≈ 75 kB gzip). El resto se carga al
  usarlo:
  - three.js (chunk `three`), solo en las páginas con 3D;
  - un índice ligero de estructuras (`src/data/indice.json`);
  - las fichas completas, un chunk por sistema, al abrir una ficha o un quiz;
  - el buscador (Fuse.js), al usarlo;
  - cada modelo `.glb`, al hacer visible su sistema.
- **Sin conexión.** `vite-plugin-pwa` (Workbox) precachea la app completa (≈ 2,4 MB, fichas incluidas). Los
  modelos se guardan al visitarlos o con «Descargar todo». La URL de cada modelo lleva un hash de su contenido,
  para que la caché se renueve al regenerarlo.

## Rendimiento
Medido con el medidor de FPS del visor (botón «FPS»: render continuo con la cámara girando), con todos los
sistemas visibles (2,26 M triángulos, 1175 llamadas de dibujo). Ventana de 1366×768 en una laptop con Intel Core 7
240H:

| GPU | FPS medio |
|---|---:|
| Integrada (Intel Graphics) | 137 |
| Dedicada (RTX 4050 Laptop) | 122 |

Las dos cifras están por encima del objetivo de 60 FPS; la integrada está cerca del límite de la pantalla de 144 Hz.
La dedicada no rinde más porque, con tantas llamadas de dibujo, el límite está en la CPU.
Sombras desactivadas, `dpr` máximo de 1,75 y render bajo demanda (sin interacción no se dibuja nada).

## Despliegue
Cada push a `main` ejecuta los tests, compila y publica `dist/` en GitHub Pages
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)). Gracias a `HashRouter` y a `base: './'`, la app
funciona bajo `/atlas_cuerpo_humano/` sin configuración adicional.

## Documentación
- [docs/PIPELINE.md](docs/PIPELINE.md): pipeline de modelos 3D.
- [docs/FUENTES.md](docs/FUENTES.md): fuentes del contenido.
- [docs/LICENCIAS.md](docs/LICENCIAS.md): licencias de modelos, texto y software.
- Datos de estructuras: la fuente está en `scripts/datos/` y se generan con `npm run datos` (ver CLAUDE.md).

Modelos 3D: «BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International» y
«Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0».
Contenido educativo; no sustituye la consulta médica.
