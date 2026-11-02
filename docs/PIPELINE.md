# Pipeline de modelos 3D

Convierte las mallas de BodyParts3D 4.0 en un `.glb` optimizado por sistema, más un manifest.

```bash
npm run modelos:descargar        # 1. descarga (~210 MB) y descomprime en assets-raw/ (una sola vez)
npm run modelos                  # 2-4. todos los sistemas configurados
npm run modelos -- esqueletico   #      o solo uno
npm run modelos:inspeccionar     # resumen del .glb con gltf-transform inspect
npm run datos                    # regenera las fichas JSON, indice.json y modelos.json (después de cambiar modelos o datos)
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
| Nervioso | 74 | 55 | 19 | 294 k | 2,3 MB |
| Digestivo | 42 | 38 | 4 | 162 k | 1,3 MB |
| Urinario | 6 | 6 | 0 | 10 k | 0,1 MB |
| Endocrino | 8 | 4 | 4 | 8 k | 0,1 MB |
| Linfático | 8 | 3 | 5 | 3 k | < 0,1 MB |
| Reproductor | 15 | 10 | 5 | 5 k | < 0,1 MB |
| Sentidos | 24 | 23 | 1 | 131 k | 0,9 MB |

Total: 18,6 MB de modelos (límite 80 MB). Los sistemas pequeños no se simplifican (`simplificar: 1`).

### Carencias de BodyParts3D 4.0
De esta lista, se han completado con Z-Anatomy los ganglios (cervicales, axilares, inguinales), las amígdalas
palatinas y los conductos deferentes (ver la sección «Z-Anatomy»). El resto sigue pendiente.
- **Esquelético:** martillo, yunque y estribo (×2) y cóccix. A la vista, la malla del sacro parece incluir el cóccix fusionado.
- **Muscular:** masetero, temporal, dorsal ancho, recto del abdomen, oblicuo interno, transverso del abdomen y
  cuadrado lumbar (×2). Tienen ficha completa, sin modelo.
- **Respiratorio:** **pulmones** (no hay parénquima pulmonar, solo el árbol bronquial por segmentos).
- **Nervioso:** médula espinal (solo existe su conducto central), nervios craneales I, V (salvo la rama oftálmica
  orbitaria), VI–XII, plexos y nervios periféricos.
- **Digestivo:** parótida, colon sigmoide, conducto anal y colédoco. No hay terceros molares.
- **Endocrino:** tiroides y paratiroides. Islotes pancreáticos y gónadas remiten al páncreas y a los testículos.
- **Linfático:** ganglios, conducto torácico y amígdalas (solo hay bazo y timo).
- **Reproductor:** el modelo es masculino; todo el aparato femenino queda pendiente. Falta el conducto deferente.
- **Sentidos:** oído medio e interno. Los dos pabellones auriculares son una sola malla.
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

## Z-Anatomy (estructuras que BodyParts3D no tiene)
Requiere Blender (probado con 5.2 LTS: `winget install BlenderFoundation.Blender`).

```bash
npm run modelos:descargar-zanatomy   # Z-Anatomy.zip (87 MB) del commit fijado en scripts/zanatomy-version.mjs → assets-raw/z-anatomy/
npm run modelos:zanatomy             # alinea y exporta con Blender CLI → assets-raw/z-anatomy/exportado/<id>.glb
npm run modelos -- <sistemas>        # los usa como fuente junto a los OBJ de BodyParts3D
npm run datos
```

- En las fichas, `fuenteZA` lista los objetos del `.blend` (se unen en una malla; `zaLados()` añade `.l`/`.r`) y `refZA`
  los pares [objeto de Z-Anatomy, id del atlas] usados para alinear (`REF_ZA` en `scripts/datos/util.mjs`).
- **Alineación** (`scripts/lib/alineacion-zanatomy.mjs`): Z-Anatomy deriva de BodyParts3D pero lo reescala por regiones
  (un ajuste global deja errores de 1–2 cm). Para cada estructura se ajustan escala uniforme y traslación por mínimos
  cuadrados con las cajas de piezas rígidas vecinas presentes en ambos modelos. Errores de las referencias: 2,4–4,5 mm.
  Se descartan como referencia el paladar blando y el sacro (otra forma) y clavículas y fémures (otra postura).
- `scripts/blender/inspeccionar.py` inventaría el `.blend` (`objetos.tsv`); `scripts/blender/exportar.py` aplica
  modificadores, convierte curvas en mallas, alinea, une y exporta cada estructura a `.glb` (metros, Y arriba).
- Las estructuras quedan en el manifest con `fuente: 'z-anatomy'` y la ficha muestra la licencia **CC BY-SA 4.0**.
- Convenciones del `.blend`: `.l`/`.r` = lado; los objetos con sufijo `.j`, `.t`, `.g`, `.s`, `.i` son líneas y textos
  de etiquetas. Los ganglios y las amígdalas de Z-Anatomy son esferas/ovoides esquemáticos (se indica en la ficha).
- `scripts/blender/vista_previa.py` y `scripts/blender/comparar.py` renderizan objetos del `.blend` para revisarlos antes
  de usarlos.

### Revisado y descartado
| Estructura | Motivo |
|---|---|
| Pelvis renal y cálices | **Licencia.** Z-Anatomy declara que adaptó un riñón de Lissie Cowley con licencia CC BY-NC 4.0. Su riñón es idéntico al de BodyParts3D, así que la pelvis con los cálices es lo añadido y podría derivar de ese modelo no comercial, incompatible con CC BY-SA. |
| Glándula tiroides | **Posición.** La única malla de la glándula («Thyroid gland», 84 vértices) envuelve las láminas del cartílago tiroides, con el istmo sobre el cricoides y no sobre los anillos traqueales 2.º–4.º. No se desplaza a mano. El cartílago tiroides ya viene de BodyParts3D. |
| Paratiroides | **Posición.** Están colocadas respecto a esa glándula alta (las superiores a la altura del cartílago tiroides). |

No están en ninguno de los dos modelos: aparato genital femenino (BodyParts3D y Z-Anatomy son masculinos), conducto
torácico, escroto, glándulas bulbouretrales y arterias suprarrenales superiores.
