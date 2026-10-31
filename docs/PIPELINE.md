# Pipeline de modelos 3D

Convierte las mallas de BodyParts3D 4.0 en un `.glb` optimizado por sistema, más un manifest.

```bash
npm run modelos:descargar        # 1. descarga (~65 MB) y descomprime en assets-raw/ (una sola vez)
npm run modelos                  # 2-4. todos los sistemas configurados
npm run modelos -- esqueletico   #      o solo uno
npm run modelos:inspeccionar     # resumen del .glb con gltf-transform inspect
```

`assets-raw/` está en `.gitignore`. Los `.glb` de `public/models/` y `src/data/manifest-modelos.json` **sí** se versionan.

## Pasos

| Paso | Script | Qué hace |
|---|---|---|
| 1 | `scripts/descargar-bodyparts3d.mjs` | Descarga los listados y `partof_BP3D_4.0_obj_99.zip` desde el LSDB Archive y los descomprime. |
| — | `scripts/lib/resolver.mjs` | Busca cada estructura de `scripts/config/<sistema>.mjs` por su **nombre inglés exacto** en las cabeceras de los OBJ, de donde salen el ID FMA y el elemento (`FJxxxx`). Descarta duplicados de geometría idéntica. Si no la encuentra, la marca **pendiente** (no se inventa). |
| 2a | `scripts/lib/convertir.mjs` | OBJ → glTF con **obj2gltf** (`inputUpAxis: 'Z'`). Un `.glb` por elemento, cacheado en `assets-raw/intermedio/`. |
| 2b | `scripts/lib/agrupar.mjs` | Un documento por sistema: nodo raíz `<sistema>`, un nodo por estructura con **nombre = id propio**. Las estructuras con varias mallas (p. ej. el esternón) tienen hijos `<id>__FJxxxx`. Pasa de mm a m. |
| 3 | `scripts/lib/optimizar.mjs` | glTF-Transform: `dedup`, `weld`, `simplify` (meshoptimizer, fracción por sistema), `prune` y `meshopt` (cuantización + `EXT_meshopt_compression`). No se usan `join`/`flatten`/`instance`, porque fusionarían nodos. |
| 4 | `scripts/construir-modelos.mjs` | Escribe `public/models/<sistema>.glb` y actualiza `src/data/manifest-modelos.json`. Avisa si se superan 8 MB por sistema u 80 MB en total. |

## Sistema de coordenadas
BodyParts3D usa milímetros, Z arriba, anterior en −Y y derecha del paciente en −X. La salida usa:

- metros, **+Y arriba**, **+Z anterior**, **−X = lado derecho del paciente** (en vista anterior, la derecha del
  paciente queda a la izquierda de la pantalla, como en un atlas);
- el mismo marco para todos los sistemas, sin centrar cada uno, para que encajen al superponerse. Los pies
  quedan cerca de y = 0 y el vértex en y ≈ 1,64.

## Manifest (`src/data/manifest-modelos.json`)
```jsonc
{
  "unidades": "m",
  "ejes": { "arriba": "+Y", "anterior": "+Z", "derechaDelPaciente": "-X" },
  "fuentes": { "bodyparts3d": { "licencia": "CC BY 4.0", "atribucion": "…" } },
  "sistemas": {
    "esqueletico": {
      "archivo": "models/esqueletico.glb", "bytes": 3204760, "triangulos": 357810,
      "estructuras": [
        { "id": "femur-d", "nodo": "femur-d", "tipo": "hueso", "estado": "disponible",
          "fuente": "bodyparts3d", "fma": ["FMA24474"], "elementos": ["FJ3365"],
          "nombresFuente": ["Right femur"], "triangulos": 1550,
          "caja": { "min": [x, y, z], "max": [x, y, z] } },
        { "id": "coccix", "nodo": null, "tipo": "hueso", "estado": "pendiente", "motivo": "…" }
      ]
    }
  }
}
```
`caja` es la caja envolvente en coordenadas de escena, calculada antes de cuantizar. Sirve para enfocar la
cámara y colocar etiquetas sin recorrer la geometría.

## Sistema esquelético: estado
- **206 huesos** declarados en `scripts/config/esqueletico.mjs`, más 14 cartílagos costales y 23 discos intervertebrales.
- **199 disponibles** en BodyParts3D.
- **7 pendientes**, que no existen en BodyParts3D 4.0: martillo, yunque y estribo (×2) y cóccix. Candidato:
  Z-Anatomy. Además hay que comprobar visualmente si la malla del sacro incluye el cóccix.
- **A revisar:** `disco-t12-l1`. La fuente solo lo llama «Intervertebral disk» (FJ3211); se identificó por su posición.
- `simplificar: 0.5` → ~358 k triángulos, ~3,1 MB (sin simplificar: ~581 k, ~4,4 MB).

## Si la descarga automática falla
Descarga a mano desde https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html estos archivos y
guárdalos en `assets-raw/bodyparts3d/`:

- `README_e.html`
- `partof_parts_list_e.txt`
- `partof_inclusion_relation_list.txt`
- `partof_element_parts.txt`
- `partof_BP3D_4.0_obj_99.zip` (62 MB)

Después ejecuta `npm run modelos:descargar`, que solo descomprimirá el zip.

## Añadir un sistema
1. Crea `scripts/config/<sistema>.mjs` con el mismo formato que `esqueletico.mjs` (nombres ingleses tal como
   aparecen en la cabecera `English name` de los OBJ; `assets-raw/bodyparts3d/partof_parts_list_e.txt` ayuda a buscarlos).
2. `npm run modelos -- <sistema>` y revisa los avisos de pendientes, presupuesto y revisión.
