# Atlas 3D interactivo del cuerpo humano

Aplicación web para estudiar anatomía y fisiología: explorar el cuerpo en 3D por sistemas, hacer clic en
cualquier estructura para ver su ficha (español, latín e inglés), ver simulaciones fisiológicas animadas y
practicar con quizzes.

**Web:** https://gerardoam15.github.io/atlas_cuerpo_humano/

> Proyecto en desarrollo por fases. Ver [CLAUDE.md](CLAUDE.md) para el plan y las reglas.

## Despliegue
Cada push a `main` ejecuta los tests, compila y publica `dist/` en GitHub Pages
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)). Gracias a `HashRouter` y a `base: './'`, la app funciona
bajo `/atlas_cuerpo_humano/` sin configuración adicional.

## Requisitos
- Node.js 20 o superior.

## Uso
```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

## Documentación
- [docs/FUENTES.md](docs/FUENTES.md) — fuentes del contenido
- [docs/LICENCIAS.md](docs/LICENCIAS.md) — licencias de modelos y texto
- [docs/PIPELINE.md](docs/PIPELINE.md) — pipeline de modelos 3D (`npm run modelos:descargar` y `npm run modelos`)
- Datos de estructuras: fuente en `scripts/datos/`, se generan con `npm run datos` (ver CLAUDE.md)

Modelos 3D: «BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International».
