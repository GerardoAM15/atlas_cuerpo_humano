// Pipeline de modelos: OBJ de BodyParts3D → public/models/<sistema>.glb + manifest.json
//
// Uso:
//   npm run modelos:descargar           (una vez; descarga a assets-raw/)
//   npm run modelos                      (todos los sistemas configurados)
//   npm run modelos -- esqueletico       (solo uno)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { indexarElementos, leerCompuestos } from './lib/bodyparts3d.mjs';
import { agruparSistema } from './lib/agrupar.mjs';
import { convertirElementos } from './lib/convertir.mjs';
import { crearIO, medir, optimizar } from './lib/optimizar.mjs';
import { resolver } from './lib/resolver.mjs';
import { DIR_AGRUPADO, DIR_MODELOS, RAIZ, RUTA_MANIFEST } from './lib/rutas.mjs';

const PRESUPUESTO_SISTEMA = 8 * 1024 * 1024;
const PRESUPUESTO_TOTAL = 80 * 1024 * 1024;

const FUENTES = {
  bodyparts3d: {
    nombre: 'BodyParts3D',
    version: '4.0 (árbol PART-OF, reducción de polígonos 99 %)',
    licencia: 'CC BY 4.0',
    urlLicencia: 'https://creativecommons.org/licenses/by/4.0/',
    url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html',
    atribucion: 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International',
    nota: 'Licencia vigente desde el 25/02/2025; antes CC BY-SA 2.1 JP (los OBJ conservan la cabecera antigua).',
  },
};

const DIR_CONFIG = path.join(RAIZ, 'scripts', 'config');
// Los módulos auxiliares (desde-datos.mjs) no son sistemas.
const disponibles = fs
  .readdirSync(DIR_CONFIG)
  .filter((f) => f.endsWith('.mjs') && f !== 'desde-datos.mjs')
  .map((f) => f.replace('.mjs', ''));
const pedidos = process.argv.slice(2);
for (const s of pedidos) {
  if (!disponibles.includes(s)) throw new Error(`Sistema sin configuración: ${s}. Disponibles: ${disponibles.join(', ')}`);
}
const sistemas = pedidos.length ? pedidos : disponibles;

console.log('Indexando OBJ de BodyParts3D…');
const indice = indexarElementos();
const compuestos = leerCompuestos();
const io = await crearIO();
fs.mkdirSync(DIR_MODELOS, { recursive: true });
fs.mkdirSync(DIR_AGRUPADO, { recursive: true });

const manifest = fs.existsSync(RUTA_MANIFEST)
  ? JSON.parse(fs.readFileSync(RUTA_MANIFEST, 'utf8'))
  : { version: 1, sistemas: {} };
manifest.unidades = 'm';
manifest.ejes = { arriba: '+Y', anterior: '+Z', derechaDelPaciente: '-X' };
manifest.fuentes = FUENTES;

for (const sistema of sistemas) {
  console.log(`\n== ${sistema}`);
  const { default: config } = await import(pathToFileURL(path.join(DIR_CONFIG, `${sistema}.mjs`)).href);
  const { resueltas, pendientes } = resolver(config.estructuras, indice, compuestos);
  console.log(`  ${resueltas.length} estructuras con modelo, ${pendientes.length} pendientes`);

  const elementos = resueltas.flatMap((e) => e.elementos);
  const rutasGlb = await convertirElementos(elementos);

  const doc = await agruparSistema(sistema, resueltas, rutasGlb);
  await io.write(path.join(DIR_AGRUPADO, `${sistema}.glb`), doc);
  const antes = medir(doc);

  await optimizar(doc, { simplificar: config.simplificar });
  const despues = medir(doc);
  const archivo = path.join(DIR_MODELOS, `${sistema}.glb`);
  await io.write(archivo, doc);
  const bytes = fs.statSync(archivo).size;

  manifest.sistemas[sistema] = {
    archivo: `models/${sistema}.glb`,
    bytes,
    triangulos: despues.triangulos,
    estructuras: [
      ...resueltas.map((e) => ({
        id: e.id,
        nodo: e.id,
        tipo: e.tipo,
        estado: 'disponible',
        fuente: 'bodyparts3d',
        fma: [...new Set(e.elementos.map((el) => el.fmaCompuesto ?? el.fma))],
        elementos: e.elementos.map((el) => el.elemento),
        nombresFuente: [...new Set(e.elementos.map((el) => el.nombreCompuesto ?? el.nombre))],
        triangulos: sumarTriangulos(despues.porNodo, e.id),
        caja: cajaDe(antes.porNodo, e.id),
        ...(e.revisar ? { revisar: e.revisar } : {}),
      })),
      ...pendientes.map((p) => ({ id: p.id, nodo: null, tipo: p.tipo, estado: 'pendiente', motivo: p.motivo })),
    ],
  };

  const mb = (b) => (b / 1024 / 1024).toFixed(2);
  console.log(`  triángulos: ${antes.triangulos.toLocaleString('es')} → ${despues.triangulos.toLocaleString('es')}`);
  console.log(`  ${path.relative(RAIZ, archivo)}: ${mb(bytes)} MB (presupuesto ${mb(PRESUPUESTO_SISTEMA)} MB)`);
  if (bytes > PRESUPUESTO_SISTEMA) {
    console.warn(`  ⚠ ${sistema} supera el presupuesto: baja "simplificar" en scripts/config/${sistema}.mjs`);
    process.exitCode = 1;
  }
  for (const p of pendientes) console.warn(`  ⚠ PENDIENTE ${p.id}: ${p.motivo}`);
  for (const e of resueltas.filter((r) => r.revisar)) console.warn(`  ⚠ REVISAR ${e.id}: ${e.revisar}`);
}

manifest.sistemas = Object.fromEntries(Object.entries(manifest.sistemas).sort(([a], [b]) => a.localeCompare(b)));
manifest.bytesTotales = Object.values(manifest.sistemas).reduce((s, x) => s + x.bytes, 0);
fs.writeFileSync(RUTA_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nManifest: ${path.relative(RAIZ, RUTA_MANIFEST)} — total ${(manifest.bytesTotales / 1024 / 1024).toFixed(2)} MB`);
if (manifest.bytesTotales > PRESUPUESTO_TOTAL) {
  console.warn('⚠ El total supera los 80 MB');
  process.exitCode = 1;
}

/** Une las cajas del nodo `id` y de sus mallas hijas `id__FJxxxx`. Redondeo a 0,1 mm. */
function cajaDe(porNodo, id) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const [nombre, m] of porNodo) {
    if (nombre !== id && !nombre.startsWith(`${id}__`)) continue;
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], m.min[k]);
      max[k] = Math.max(max[k], m.max[k]);
    }
  }
  const r = (v) => Math.round(v * 1e4) / 1e4;
  return { min: min.map(r), max: max.map(r) };
}

function sumarTriangulos(porNodo, id) {
  let t = 0;
  for (const [nombre, m] of porNodo) if (nombre === id || nombre.startsWith(`${id}__`)) t += m.triangulos;
  return t;
}
