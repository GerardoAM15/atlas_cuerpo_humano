// Genera src/data/estructuras/<sistema>.json a partir de las fuentes compactas de scripts/datos/<sistema>/.
//
// - Expande las estructuras pares (derecha/izquierda) y los ids relativos (~ mismo lado, ^ lado opuesto).
// - nodoModelo sale del manifest de modelos: el nodo si está disponible, null si está pendiente.
// - relaciones = huesos con los que articula + relacionesExtra (sin duplicados).
// - Además escribe lo que la app carga al inicio, para no incluir las fichas ni el manifest completos:
//     src/data/indice.json   resumen de todas las estructuras (nombres, región, tipo, caja del modelo…)
//     src/data/modelos.json  fuentes y archivo, tamaño, triángulos y versión (hash) de cada .glb;
//                            la versión va en la URL del modelo para que la caché offline se renueve
//
// Uso: npm run datos               (todos los sistemas con fuente)
//      npm run datos -- esqueletico
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, RUTA_MANIFEST } from './lib/rutas.mjs';

const DIR_FUENTES = path.join(RAIZ, 'scripts', 'datos');
const DIR_DATOS = path.join(RAIZ, 'src', 'data');
const DIR_SALIDA = path.join(DIR_DATOS, 'estructuras');
const manifest = JSON.parse(fs.readFileSync(RUTA_MANIFEST, 'utf8'));

const disponibles = fs.readdirSync(DIR_FUENTES).filter((d) => fs.existsSync(path.join(DIR_FUENTES, d, 'index.mjs')));
const sistemas = process.argv.slice(2).length ? process.argv.slice(2) : disponibles;

for (const sistema of sistemas) {
  const { default: fuente } = await import(pathToFileURL(path.join(DIR_FUENTES, sistema, 'index.mjs')).href);
  const modelo = new Map((manifest.sistemas[sistema]?.estructuras ?? []).map((e) => [e.id, e]));

  const salida = fuente.map((e) => {
    // fuente/material/pendienteModelo los usa solo el pipeline 3D (scripts/config).
    const { relacionesExtra = [], fuente: _f, material: _m, pendienteModelo: _p, ...resto } = e;
    const enModelo = modelo.get(e.id);
    const relaciones = [...new Set([...(e.articulaciones ?? []).flatMap((a) => a.con), ...relacionesExtra])].filter((r) => r !== e.id);
    const ordenado = {
      id: e.id,
      nodoModelo: enModelo?.estado === 'disponible' ? enModelo.nodo : null,
      tipo: e.tipo ?? 'hueso',
      sistema,
      ...resto,
      relaciones,
    };
    return JSON.parse(JSON.stringify(ordenado)); // elimina claves undefined
  });

  const sinDatos = [...modelo.keys()].filter((id) => !salida.some((e) => e.id === id));
  fs.mkdirSync(DIR_SALIDA, { recursive: true });
  const destino = path.join(DIR_SALIDA, `${sistema}.json`);
  fs.writeFileSync(destino, `${JSON.stringify(salida, null, 2)}\n`);
  console.log(`✔ ${path.relative(RAIZ, destino)}: ${salida.length} estructuras`);
  if (sinDatos.length) console.warn(`⚠ En el modelo pero sin datos: ${sinDatos.join(', ')}`);
}

// ---------------------------------------------------------------- Índice y resumen de modelos
// Se rehacen siempre con todos los sistemas (también los que no se han regenerado ahora).
const redondear = (v) => v.map((x) => Math.round(x * 1e4) / 1e4);
const entradasManifest = new Map(Object.values(manifest.sistemas).flatMap((s) => s.estructuras.map((e) => [e.id, e])));
const indice = fs
  .readdirSync(DIR_SALIDA)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(DIR_SALIDA, f), 'utf8')))
  .map((e) => {
    const m = entradasManifest.get(e.id);
    return JSON.parse(
      JSON.stringify({
        id: e.id,
        nodoModelo: e.nodoModelo,
        nombre: e.nombre,
        latin: e.latin,
        ingles: e.ingles,
        sistema: e.sistema,
        region: e.region,
        tipo: e.tipo,
        lado: e.lado,
        caja: m?.estado === 'disponible' ? { min: redondear(m.caja.min), max: redondear(m.caja.max) } : undefined,
        motivo: m?.estado === 'pendiente' ? m.motivo : undefined,
        fma: m?.estado === 'disponible' ? m.fma : undefined,
      }),
    );
  });
fs.writeFileSync(path.join(DIR_DATOS, 'indice.json'), `${JSON.stringify(indice)}
`);

const modelos = {
  fuentes: manifest.fuentes,
  bytesTotales: manifest.bytesTotales,
  sistemas: Object.fromEntries(
    Object.entries(manifest.sistemas).map(([id, s]) => {
      const glb = fs.readFileSync(path.join(RAIZ, 'public', s.archivo));
      const version = crypto.createHash('sha256').update(glb).digest('hex').slice(0, 10);
      return [id, { archivo: s.archivo, bytes: s.bytes, triangulos: s.triangulos, version }];
    }),
  ),
};
fs.writeFileSync(path.join(DIR_DATOS, 'modelos.json'), `${JSON.stringify(modelos, null, 2)}
`);
console.log(`✔ src/data/indice.json: ${indice.length} estructuras · src/data/modelos.json`);
