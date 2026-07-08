import bpy
import json
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
path = argv[0] if argv else r"D:\work\steveknowsweb\assets\models\scene\scene.gltf"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

mins = [float("inf")] * 3
maxs = [float("-inf")] * 3
for obj in bpy.context.scene.objects:
    if obj.type != "MESH":
        continue
    for corner in obj.bound_box:
        world = obj.matrix_world @ Vector(corner)
        for i in range(3):
            mins[i] = min(mins[i], world[i])
            maxs[i] = max(maxs[i], world[i])

cx = (mins[0] + maxs[0]) / 2
cz = (mins[2] + maxs[2]) / 2
print("bounds:", {"min": mins, "max": maxs, "center": [cx, (mins[1]+maxs[1])/2, cz]})

# After HTML applies rotation Y=180: world X -> -X, world Z -> -Z relative to model
# Player spawn in page is roughly (-20, 1.6, 28) after model centered.
# Find facade meshes near each side with lowest min_y (ground floor openings)
sides = {"south": [], "north": [], "east": [], "west": []}
for obj in bpy.context.scene.objects:
    if obj.type != "MESH":
        continue
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    xs = [c[0] for c in corners]
    zs = [c[2] for c in corners]
    ys = [c[1] for c in corners]
    mx, mz = sum(xs)/4, sum(zs)/4
    h = max(ys) - min(ys)
    if h > 12:
        continue
    entry = {"name": obj.name, "x": mx, "z": mz, "min_y": min(ys), "h": h}
    if abs(mz - mins[2]) < 2:
        sides["south"].append(entry)
    if abs(mz - maxs[2]) < 2:
        sides["north"].append(entry)
    if abs(mx - maxs[0]) < 2:
        sides["east"].append(entry)
    if abs(mx - mins[0]) < 2:
        sides["west"].append(entry)

print("FACADES_JSON:" + json.dumps(sides, indent=2))