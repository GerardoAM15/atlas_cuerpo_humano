# Renderiza (Workbench) cada objeto pedido, aislado y encuadrado, para revisar su calidad.
# Uso: blender -b Startup.blend -P scripts/blender/vista_previa.py -- <carpeta salida> "Nombre 1" "Nombre 2" ...
import math
import os
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1 :]
salida, nombres = args[0], args[1:]
os.makedirs(salida, exist_ok=True)

escena = bpy.context.scene
escena.render.engine = "BLENDER_WORKBENCH"
escena.render.resolution_x = escena.render.resolution_y = 480
escena.display.shading.light = "STUDIO"
escena.display.shading.color_type = "SINGLE"
escena.render.film_transparent = False
camara_datos = bpy.data.cameras.new("Previa")
camara = bpy.data.objects.new("Previa", camara_datos)
escena.collection.objects.link(camara)
escena.camera = camara

objetivos = [bpy.data.objects[n] for n in nombres if n in bpy.data.objects]
for o in escena.objects:
    o.hide_render = True
for o in objetivos:
    o.hide_render = False
    # Las curvas con grosor se renderizan como superficies; se muestran igual.
    esquinas = [o.matrix_world @ Vector(c) for c in o.bound_box]
    centro = sum(esquinas, Vector()) / 8
    tam = max((max(v[k] for v in esquinas) - min(v[k] for v in esquinas)) for k in range(3))
    # Vista anterior (el paciente mira hacia −Y), algo elevada.
    camara.location = centro + Vector((0.35, -1.0, 0.35)).normalized() * max(tam * 2.2, 0.03)
    camara.rotation_euler = (centro - camara.location).to_track_quat("-Z", "Y").to_euler()
    camara_datos.clip_start = 0.001
    escena.render.filepath = os.path.join(salida, f"{o.name}.png")
    bpy.ops.render.render(write_still=True)
    o.hide_render = True
print("renderizados:", [o.name for o in objetivos])
