// Genera src/data/estructuras/<sistema>.json a partir de las fuentes compactas de scripts/datos/<sistema>/.
//
// - Expande las estructuras pares (derecha/izquierda) y los ids relativos (~ mismo lado, ^ lado opuesto).
// - nodoModelo sale del manifest de modelos: el nodo si está disponible, null si está pendiente.
// - relaciones = huesos con los que articula + relacionesExtra (sin duplicados).
//
// Uso: npm run datos               (todos los sistemas con fuente)
//      npm run datos -- esqueletico
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, RUTA_MANIFEST } from './lib/rutas.mjs';

const DIR_FUENTES = path.join(RAIZ, 'scripts', 'datos');
const DIR_SALIDA = path.join(RAIZ, 'src', 'data', 'estructuras');
const manifest = JSON.parse(fs.readFileSync(RUTA_MANIFEST, 'utf8'));

const disponibles = fs.readdirSync(DIR_FUENTES).filter((d) => fs.existsSync(path.join(DIR_FUENTES, d, 'index.mjs')));
const sistemas = process.argv.slice(2).length ? process.argv.slice(2) : disponibles;

for (const sistema of sistemas) {
  const { default: fuente } = await import(pathToFileURL(path.join(DIR_FUENTES, sistema, 'index.mjs')).href);
  const modelo = new Map((manifest.sistemas[sistema]?.estructuras ?? []).map((e) => [e.id, e]));

  const salida = fuente.map((e) => {
    const { relacionesExtra = [], ...resto } = e;
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
