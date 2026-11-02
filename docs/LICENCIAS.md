# Licencias

## Código
Proyecto personal de estudio. Licencia del código: por definir por el autor.

## Modelos 3D
| Fuente | Licencia | Uso |
|---|---|---|
| BodyParts3D 4.0, © The Database Center for Life Science (DBCLS) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Fuente principal (OBJ por estructura, IDs FMA) |
| Z-Anatomy (plantilla de Blender, [Z-Anatomy/The-blend](https://github.com/Z-Anatomy/The-blend)) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Complemento: ganglios linfáticos, amígdalas palatinas y conductos deferentes |

### BodyParts3D
Atribución exigida por el licenciante:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

- Página de licencia: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- **Cambio de licencia:** desde el 25/02/2025 la base de datos se distribuye bajo CC BY 4.0. Antes era
  CC BY-SA 2.1 JP, y los OBJ descargados conservan esa cabecera antigua. Este proyecto aplica la licencia vigente.
- Los `.glb` de `public/models/` son obras derivadas: se cambiaron ejes y unidades, se agruparon por sistema, se
  simplificaron y se comprimieron. Ver [PIPELINE.md](PIPELINE.md).

### Z-Anatomy
Atribución: «Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0». Los `.glb` que contienen mallas de Z-Anatomy
(linfático y reproductor) y sus derivados se distribuyen bajo **CC BY-SA 4.0**. Ojo: Z-Anatomy
declara haber adaptado modelos con licencia no comercial (riñón de Lissie Cowley, CC BY-NC 4.0; oído interno de la
Universidad de Dundee, CC BY-NC-SA 4.0); no se debe tomar de Z-Anatomy nada que pueda derivar de ellos. Por eso **no se
usa su pelvis renal con los cálices**: su riñón es idéntico al de BodyParts3D, y la pelvis, lo añadido, podría proceder
del modelo no comercial.

Si se incorporan más modelos de Z-Anatomy (p. ej. huesecillos del oído o cóccix), sus derivados deberán
distribuirse bajo **CC BY-SA 4.0** (cláusula *CompartirIgual*) y añadirse a la página de créditos.

## Software
Todas las bibliotecas usadas tienen licencias permisivas: React, React Router, three.js, @react-three/fiber y drei,
camera-controls, Zustand, Zod, Tailwind CSS, Vite, vite-plugin-pwa, Workbox, meshoptimizer y glTF-Transform (MIT);
Fuse.js y obj2gltf (Apache 2.0). La lista está también en la página «Créditos y licencias».

## Texto
Contenido original redactado a partir de las obras listadas en [FUENTES.md](FUENTES.md). OpenStax
*Anatomy & Physiology* es CC BY 4.0.
