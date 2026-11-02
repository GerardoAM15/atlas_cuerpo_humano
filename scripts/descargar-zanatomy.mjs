// Descarga la plantilla de Blender de Z-Anatomy (CC BY-SA 4.0) en assets-raw/z-anatomy y la descomprime.
// El commit está fijado en scripts/zanatomy-version.mjs.
//
// Uso: npm run modelos:descargar-zanatomy
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import AdmZip from 'adm-zip';
import { DIR_ZANATOMY } from './lib/rutas.mjs';
import { COMMIT_ZANATOMY } from './zanatomy-version.mjs';
const URL_ZIP = `https://raw.githubusercontent.com/Z-Anatomy/The-blend/${COMMIT_ZANATOMY}/Z-Anatomy.zip`;

fs.mkdirSync(DIR_ZANATOMY, { recursive: true });
const zip = path.join(DIR_ZANATOMY, 'Z-Anatomy.zip');
if (fs.existsSync(zip) && fs.statSync(zip).size > 0) {
  console.log('✔ Z-Anatomy.zip (ya descargado)');
} else {
  console.log(`↓ ${URL_ZIP}`);
  const res = await fetch(URL_ZIP);
  if (!res.ok || !res.body) {
    throw new Error(`No se pudo descargar ${URL_ZIP} (HTTP ${res.status}).
Descarga «Z-Anatomy.zip» de https://github.com/Z-Anatomy/The-blend y guárdalo en ${DIR_ZANATOMY}`);
  }
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(`${zip}.parcial`));
  fs.renameSync(`${zip}.parcial`, zip);
  console.log(`✔ Z-Anatomy.zip (${(fs.statSync(zip).size / 1e6).toFixed(1)} MB)`);
}

const extraido = path.join(DIR_ZANATOMY, 'plantilla');
if (!fs.existsSync(extraido)) {
  console.log('… descomprimiendo');
  new AdmZip(zip).extractAllTo(extraido, true);
}
const blends = fs.readdirSync(extraido, { recursive: true }).filter((f) => String(f).endsWith('.blend'));
console.log(`✔ .blend: ${blends.join(', ')}`);
