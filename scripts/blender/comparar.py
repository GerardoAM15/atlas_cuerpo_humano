# Renderiza juntos varios objetos del .blend (cada uno con su color) en una escena nueva y limpia, para comparar
# su forma y posición (p. ej. glándula tiroides frente a cartílago tiroides).
# Uso: blender -b Startup.blend -P scripts/blender/comparar.py -- salida.png <vista: ant|lat|post> "Objeto=#rrggbb" ...
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1 :]
salida, vista, pares = args[0], args[1], [a.split("=") for a in args[2:]]
depsgraph = bpy.context.evaluated_depsgraph_get()

escena = bpy.data.scenes.new("Comparar")
escena.render.engine = "BLENDER_WORKBENCH"
escena.render.resolution_x = escena.render.resolution_y = 600
escena.display.shading.light = "STUDIO"
escena.display.shading.color_type = "OBJECT"
escena.display.shading.show_cavity = True
escena.world = bpy.data.worlds.new("Fondo")
escena.world.color = (0.03, 0.04, 0.08)

puntos = []
for nombre, color in pares:
    original = bpy.data.objects[nombre]
    malla = bpy.data.meshes.new_from_object(original.evaluated_get(depsgraph), depsgraph=depsgraph)
    malla.transform(original.matrix_world)
    o = bpy.data.objects.new(nombre, malla)
    o.color = (*[int(color[i : i + 2], 16) / 255 for i in (1, 3, 5)], 1)
    escena.collection.objects.link(o)
    puntos += [Vector(v.co) for v in malla.vertices]

mn = Vector([min(p[k] for p in puntos) for k in range(3)])
mx = Vector([max(p[k] for p in puntos) for k in range(3)])
centro = (mn + mx) / 2
tam = max(mx - mn)
# El paciente mira hacia −Y; su derecha está en −X.
direccion = {"ant": Vector((0, -1, 0)), "lat": Vector((-1, 0, 0)), "post": Vector((0, 1, 0))}[vista]
cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
escena.collection.objects.link(cam)
cam.data.type = "ORTHO"
cam.data.ortho_scale = tam * 1.25
cam.location = centro + direccion
cam.rotation_euler = (centro - cam.location).to_track_quat("-Z", "Y").to_euler()
escena.camera = cam
escena.render.filepath = salida
bpy.context.window.scene = escena
bpy.ops.render.render(write_still=True, scene=escena.name)
