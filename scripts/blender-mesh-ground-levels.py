import bpy
import json
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
path = argv[0] if argv else r"D:\work\steveknowsweb\assets\models\scene\scene.gltf"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

rows = []
for obj in bpy.context.scene.objects:
    if obj.type != "MESH" or obj.name.startswith("COLLIDER_"):
        continue
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    xs = [c[0] for c in corners]
    ys = [c[1] for c in corners]
    zs = [c[2] for c in corners]
    w, d, h = max(xs) - min(xs), max(zs) - min(zs), max(ys) - min(ys)
    rows.append({
        "name": obj.name,
        "min_y": min(ys),
        "footprint": w * d,
        "width": w,
        "depth": d,
        "height": h,
    })

rows.sort(key=lambda r: (-r["footprint"], r["min_y"]))
print("BY_FOOTPRINT:" + json.dumps(rows[:12], indent=2))