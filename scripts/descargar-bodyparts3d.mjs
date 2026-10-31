// Paso 1 del pipeline: descarga BodyParts3D 4.0 (árboles PART-OF e IS-A, ~200 MB) en
// assets-raw/bodyparts3d y descomprime las mallas OBJ. Si un archivo ya existe, no se vuelve a descargar.
//
// Uso: npm run modelos:descargar
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import AdmZip from 'adm-zip';
import { ARBOLES, ARCHIVOS_BP3D, URL_BASE_BP3D, rutaLista } from './lib/bodyparts3d.mjs';
import { DIR_BP3D } from './lib/rutas.mjs';

fs.mkdirSync(DIR_BP3D, { recursive: true });

for (const archivo of ARCHIVOS_BP3D) {
  const destino = rutaLista(archivo);
  if (fs.existsSync(destino) && fs.statSync(destino).size > 0) {
    console.log(`✔ ${archivo} (ya descargado)`);
    continue;
  }
  const url = `${URL_BASE_BP3D}/${archivo}`;
  console.log(`↓ ${url}`);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`No se pudo descargar ${url} (HTTP ${res.status}).
Descárgalo a mano desde https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
y guárdalo en ${DIR_BP3D}`);
  }
  const temporal = `${destino}.parcial`;
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(temporal));
  fs.renameSync(temporal, destino);
  console.log(`✔ ${archivo} (${(fs.statSync(destino).size / 1e6).toFixed(1)} MB)`);
}

for (const { zip, dir } of ARBOLES) {
  if (!fs.existsSync(dir)) {
    console.log(`… descomprimiendo ${zip}`);
    new AdmZip(rutaLista(zip)).extractAllTo(DIR_BP3D, true);
  }
  const n = fs.readdirSync(dir).filter((f) => f.endsWith('.obj')).length;
  console.log(`✔ ${n} archivos OBJ en ${path.relative(process.cwd(), dir)}`);
}
