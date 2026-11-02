// Exporta de Z-Anatomy (Blender CLI) las estructuras que BodyParts3D no tiene, alineadas con la escena del atlas.
//
// 1. Lee de las fichas (scripts/datos/<sistema>/) las estructuras con `fuenteZA` (objetos del .blend) y
//    `refZA` (pares [objeto de Z-Anatomy, id del atlas] de la misma región, para alinear).
// 2. Inventaría el .blend con Blender (cajas en coordenadas de mundo) si no se ha hecho ya.
// 3. Ajusta escala y traslación de cada estructura con sus referencias (Z-Anatomy reescala BodyParts3D por
//    regiones, así que un ajuste global deja errores de 1–2 cm).
// 4. Lanza Blender con scripts/blender/exportar.py → assets-raw/z-anatomy/exportado/<id>.glb (metros, ejes de la escena).
//
// Uso: npm run modelos:zanatomy   (requiere npm run modelos:descargar-zanatomy y Blender instalado)
//      BLENDER=/ruta/blender.exe npm run modelos:zanatomy
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ajustar, cajaBlenderAGltf } from './lib/alineacion-zanatomy.mjs';
import { DIR_ZANATOMY, DIR_ZANATOMY_GLB, RAIZ, RUTA_MANIFEST } from './lib/rutas.mjs';

const BLEND = path.join(DIR_ZANATOMY, 'plantilla', 'Z-Anatomy', 'Startup.blend');
const INVENTARIO = path.join(DIR_ZANATOMY, 'objetos.tsv');
const PLAN = path.join(DIR_ZANATOMY, 'plan.json');
const BLENDER =
  process.env.BLENDER ??
  ['C:/Program Files/Blender Foundation/Blender 5.2/blender.exe', '/usr/bin/blender', '/Applications/Blender.app/Contents/MacOS/Blender'].find((r) =>
    fs.existsSync(r),
  ) ??
  'blender';

if (!fs.existsSync(BLEND)) throw new Error(`Falta ${BLEND}: ejecuta antes npm run modelos:descargar-zanatomy`);
const blender = (script, ...args) =>
  execFileSync(BLENDER, ['-b', BLEND, '--python-exit-code', '1', '-P', path.join(RAIZ, 'scripts', 'blender', script), '--', ...args], {
    stdio: ['ignore', 'pipe', 'inherit'],
    maxBuffer: 64 * 1024 * 1024,
  }).toString();

// ---------------------------------------------------------------- 1. Estructuras pedidas
const DIR_FUENTES = path.join(RAIZ, 'scripts', 'datos');
const pedidas = [];
for (const sistema of fs.readdirSync(DIR_FUENTES).filter((d) => fs.existsSync(path.join(DIR_FUENTES, d, 'index.mjs')))) {
  const { default: datos } = await import(pathToFileURL(path.join(DIR_FUENTES, sistema, 'index.mjs')).href);
  for (const e of datos) if (e.fuenteZA?.length) pedidas.push({ ...e, sistema });
}
console.log(`${pedidas.length} estructuras con fuente Z-Anatomy`);

// ---------------------------------------------------------------- 2. Inventario del .blend
if (!fs.existsSync(INVENTARIO)) {
  console.log('Inventariando el .blend (Blender)…');
  blender('inspeccionar.py', INVENTARIO);
}
const cajasZA = new Map(
  fs
    .readFileSync(INVENTARIO, 'utf8')
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split('\t'))
    .filter((c) => c[4])
    .map((c) => [c[0], cajaBlenderAGltf({ min: c[4].split(',').map(Number), max: c[5].split(',').map(Number) })]),
);

// Cajas del atlas: estructuras de BodyParts3D ya construidas (manifest).
const manifest = JSON.parse(fs.readFileSync(RUTA_MANIFEST, 'utf8'));
const cajasAtlas = new Map(
  Object.values(manifest.sistemas).flatMap((s) => s.estructuras.filter((e) => e.estado === 'disponible' && e.fuente === 'bodyparts3d').map((e) => [e.id, e.caja])),
);

// ---------------------------------------------------------------- 3. Alineación por estructura
const plan = pedidas.map((e) => {
  for (const o of e.fuenteZA) if (!cajasZA.has(o)) throw new Error(`${e.id}: «${o}» no está en el .blend`);
  if (!e.refZA?.length) throw new Error(`${e.id}: faltan referencias de alineación (refZA)`);
  const pares = e.refZA.map(([za, id]) => {
    if (!cajasZA.has(za)) throw new Error(`${e.id}: referencia «${za}» no está en el .blend`);
    if (!cajasAtlas.has(id)) throw new Error(`${e.id}: referencia «${id}» no tiene modelo de BodyParts3D`);
    return { nombre: `${za} → ${id}`, za: cajasZA.get(za), atlas: cajasAtlas.get(id) };
  });
  const { escala, traslacion, residuos } = ajustar(pares);
  const error = Math.max(...residuos.map((r) => r.error));
  console.log(`  ${e.id.padEnd(28)} escala ${escala.toFixed(3)} · error máx. de las referencias ${(error * 1000).toFixed(1)} mm`);
  return { id: e.id, objetos: e.fuenteZA, escala, traslacion, errorReferencias: error };
});
fs.writeFileSync(PLAN, `${JSON.stringify(plan, null, 2)}\n`);

// ---------------------------------------------------------------- 4. Exportación con Blender
console.log('Exportando con Blender…');
const log = blender('exportar.py', PLAN, DIR_ZANATOMY_GLB);
for (const l of log.split(/\r?\n/)) if (l.startsWith('✔')) console.log(`  ${l}`);
console.log(`\nListo: ${path.relative(RAIZ, DIR_ZANATOMY_GLB)}. Ahora: npm run modelos -- <sistemas> && npm run datos`);
