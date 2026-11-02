# Exporta a glTF (.glb) las estructuras de Z-Anatomy indicadas en un plan JSON, ya alineadas con la escena
# del atlas (la de BodyParts3D). Lo genera y lanza scripts/exportar-zanatomy.mjs.
#
# Uso: blender -b Startup.blend -P scripts/blender/exportar.py -- plan.json <carpeta de salida>
#
# Plan: [{ "id": "tiroides", "objetos": ["Thyroid gland"], "escala": 0.94, "traslacion": [x, y, z] }, …]
# escala y traslación están en ejes glTF (Y arriba, +Z anterior): p_atlas = escala · p_zanatomy + traslacion.
import json
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

args = sys.argv[sys.argv.index("--") + 1 :]
with open(args[0], encoding="utf-8") as f:
    plan = json.load(f)
salida = args[1]
os.makedirs(salida, exist_ok=True)

# Escena vacía para exportar: así no se cuela nada más del .blend.
escena = bpy.data.scenes.new("Exportacion")
depsgraph = bpy.context.evaluated_depsgraph_get()

for item in plan:
    t = item["traslacion"]
    # Ejes glTF (x, y, z) = Blender (x, z, −y)  →  traslación en Blender = (tx, −tz, ty).
    alineacion = Matrix.Translation(Vector((t[0], -t[2], t[1]))) @ Matrix.Scale(item["escala"], 4)
    mallas = []
    for nombre in item["objetos"]:
        o = bpy.data.objects.get(nombre)
        if o is None:
            raise SystemExit(f"No existe el objeto «{nombre}» en el .blend (estructura {item['id']})")
        # Geometría evaluada: modificadores aplicados y curvas con grosor convertidas en malla.
        datos = bpy.data.meshes.new_from_object(o.evaluated_get(depsgraph), preserve_all_data_layers=False, depsgraph=depsgraph)
        datos.transform(alineacion @ o.matrix_world)
        mallas.append(datos)

    # Une todas las piezas en una sola malla (una estructura = un nodo).
    bm = bmesh.new()
    for datos in mallas:
        bm.from_mesh(datos)
    final = bpy.data.meshes.new(item["id"])
    bm.to_mesh(final)
    bm.free()
    obj = bpy.data.objects.new(item["id"], final)
    escena.collection.objects.link(obj)

    bpy.context.window.scene = escena
    for o in escena.objects:
        o.select_set(o is obj)
    bpy.context.view_layer.objects.active = obj
    destino = os.path.join(salida, f"{item['id']}.glb")
    bpy.ops.export_scene.gltf(
        filepath=destino,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_materials="NONE",
        export_normals=True,
        export_texcoords=False,
        export_animations=False,
    )
    escena.collection.objects.unlink(obj)
    print(f"✔ {item['id']}: {len(final.vertices)} vértices, {len(final.polygons)} caras → {destino}")
