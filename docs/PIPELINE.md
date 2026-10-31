# Pipeline de modelos 3D

Convierte las mallas de BodyParts3D 4.0 en un `.glb` optimizado por sistema, más un manifest.

```bash
npm run modelos:descargar        # 1. descarga (~210 MB) y descomprime en assets-raw/ (una sola vez)
npm run modelos                  # 2-4. todos los sistemas configurados
npm run modelos -- esqueletico   #      o solo uno
npm run modelos:inspeccionar     # resumen del .glb con gltf-transform inspect
npm run datos                    # regenera las fichas JSON (después de cambiar modelos o datos)
```

`assets-raw/` está en `.gitignore`. Los `.glb` de `public/models/` y `src/data/manifest-modelos.json` **sí** se versionan.

## Pasos

| Paso | Script | Qué hace |
|---|---|---|
| 1 | `scripts/descargar-bodyparts3d.mjs` | Descarga los listados y las mallas de los árboles **PART-OF** (62 MB) e **IS-A** (136 MB) desde el LSDB Archive y los descomprime. |
| — | `scripts/lib/bodyparts3d.mjs` | Indexa las cabeceras de los OBJ de ambos árboles por nombre inglés. Si un nombre existe en PART-OF, se ignoran las mallas IS-A con ese nombre (el esqueleto no cambia). Lee también los **conceptos compuestos** de `*_element_parts.txt`. |
| — | `scripts/lib/resolver.mjs` | Resuelve cada nombre de la fuente, por orden: 1) como **elemento** (cabecera del OBJ); 2) como **concepto compuesto** (p. ej. «branch of right coronary artery» = 30 mallas). Descarta duplicados de geometría idéntica y FJ repetidos. Si no lo encuentra, la estructura queda **pendiente** (no se inventa). |
| 2a | `scripts/lib/convertir.mjs` | OBJ → glTF con **obj2gltf** (`inputUpAxis: 'Z'`). Un `.glb` por elemento, cacheado en `assets-raw/intermedio/`. |
| 2b | `scripts/lib/agrupar.mjs` | Un documento por sistema: nodo raíz `<sistema>`, un nodo por estructura con **nombre = id propio**. Las estructuras con varias mallas (esternón, deltoides, válvulas…) tienen hijos `<id>__FJxxxx`. Pasa de mm a m y asigna un material por tipo (hueso, músculo, arteria, vena, válvula, vía aérea…). |
| 3 | `scripts/lib/optimizar.mjs` | glTF-Transform: `dedup`, `weld`, `simplify` (meshoptimizer, fracción por sistema), `prune` y `meshopt` (cuantización + `EXT_meshopt_compression`). No se usan `join`/`flatten`/`instance`, porque fusionarían nodos. |
| 4 | `scripts/construir-modelos.mjs` | Escribe `public/models/<sistema>.glb` y actualiza `src/data/manifest-modelos.json`. Avisa si se superan 8 MB por sistema u 80 MB en total. |

## Configuración por sistema
- **Esquelético:** `scripts/config/esqueletico.mjs` (lista propia de 206 huesos + cartílagos).
- **Muscular, cardiovascular y respiratorio:** la configuración **se deriva de las fichas**
  (`scripts/datos/<sistema>/`, mediante `scripts/config/desde-datos.mjs`). Cada ficha lleva:
  - `fuente`: nombres de BodyParts3D (en las fichas pares, `{side}` → `right`/`left`);
  - `material`: material del modelo (por defecto, el tipo); los vasos lo toman de la sangre que llevan;
  - `pendienteModelo`: motivo, si se sabe que no hay malla.

  Así hay una sola lista por sistema y no pueden desincronizarse el modelo y los datos.

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
cámara y colocar etiquetas sin recorrer la geometría. Los ids son **únicos entre todos los sistemas** (hay un test).

## Estado por sistema

| Sistema | Estructuras | Con modelo | Pendientes | Triángulos | Tamaño |
|---|---|---|---|---|---|
| Esquelético | 243 (206 huesos) | 236 | 7 | 358 k | 3,1 MB |
| Muscular | 236 (118 músculos × 2) | 222 | 14 | 605 k | 5,8 MB |
| Cardiovascular | 102 | 102 | 0 | 313 k | 2,3 MB |
| Respiratorio | 33 | 31 | 2 | 264 k | 2,7 MB |

### Carencias de BodyParts3D 4.0 (pendientes; candidato: Z-Anatomy)
- **Esquelético:** martillo, yunque y estribo (×2) y cóccix. A la vista, la malla del sacro parece incluir el cóccix fusionado.
- **Muscular:** masetero, temporal, dorsal ancho, recto del abdomen, oblicuo interno, transverso del abdomen y
  cuadrado lumbar (×2). Tienen ficha completa, sin modelo.
- **Respiratorio:** **pulmones** (no hay parénquima pulmonar, solo el árbol bronquial por segmentos).
- **Cardiovascular:** los ventrículos y el tabique forman una sola malla («Wall of ventricle»); de los ventrículos
  hay también el molde de la cavidad.
- **Intercostales:** las tres mallas solo cubren el hemitórax izquierdo.

### A revisar
- `disco-t12-l1`: la fuente lo llama solo «Intervertebral disk» (FJ3211); se identificó por su posición.
- Arterias coronarias: se usan los conceptos compuestos «branch of right/left coronary artery», que incluyen todas sus ramas.
- Músculos papilares del VI y valvas aórticas: la nomenclatura FMA no coincide con la clínica (anotado en cada ficha).

## Si la descarga automática falla
Descarga a mano desde https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html estos archivos y
guárdalos en `assets-raw/bodyparts3d/`:

- `README_e.html`
- `partof_parts_list_e.txt`, `partof_inclusion_relation_list.txt`, `partof_element_parts.txt`
- `isa_parts_list_e.txt`, `isa_element_parts.txt`
- `partof_BP3D_4.0_obj_99.zip` (62 MB) e `isa_BP3D_4.0_obj_99.zip` (136 MB)

Después ejecuta `npm run modelos:descargar`, que solo descomprimirá los zips. Si curl corta la descarga del
zip grande, se puede reanudar con `curl -C - -L -o <archivo> <url>`.

## Añadir un sistema
1. Escribe sus fichas en `scripts/datos/<sistema>/index.mjs` con `fuente` en cada estructura (nombres ingleses tal
   como aparecen en la cabecera `English name` de los OBJ o en `*_element_parts.txt`).
2. Crea `scripts/config/<sistema>.mjs` con `configDesdeDatos('<sistema>', datos)`.
3. Añade sus regiones en `src/data/regiones.ts`.
4. `npm run modelos -- <sistema>` (revisa los avisos de pendientes y presupuesto) y después `npm run datos`.
