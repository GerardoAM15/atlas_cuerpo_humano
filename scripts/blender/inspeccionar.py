# Lista los objetos de malla del .blend de Z-Anatomy (nombre, colecciones, vértices, caja en coordenadas de mundo).
# Uso: blender -b Startup.blend -P scripts/blender/inspeccionar.py -- salida.tsv
import sys

import bpy
from mathutils import Vector

salida = sys.argv[sys.argv.index("--") + 1]
with open(salida, "w", encoding="utf-8") as f:
    f.write("nombre\ttipo\tcolecciones\tvertices\tmin\tmax\tescala\n")
    for o in bpy.data.objects:
        cols = ",".join(c.name for c in o.users_collection)
        if o.type in ("MESH", "CURVE") and o.data:
            esquinas = [o.matrix_world @ Vector(c) for c in o.bound_box]
            mn = [min(v[k] for v in esquinas) for k in range(3)]
            mx = [max(v[k] for v in esquinas) for k in range(3)]
            f.write(f"{o.name}\t{o.type}\t{cols}\t{len(o.data.vertices) if o.type == "MESH" else 0}\t{','.join(f'{x:.4f}' for x in mn)}\t{','.join(f'{x:.4f}' for x in mx)}\t{o.matrix_world.to_scale()[0]:.4f}\n")
        else:
            f.write(f"{o.name}\t{o.type}\t{cols}\t\t\t\t\n")
print("unidades:", bpy.context.scene.unit_settings.system, bpy.context.scene.unit_settings.scale_length)
print("objetos:", len(bpy.data.objects))
