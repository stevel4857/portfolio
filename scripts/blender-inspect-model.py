import bpy
import json
import sys
from mathutils import Vector

argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []
gltf_path = argv[0] if argv else r"D:\work\steveknowsweb\assets\models\scene\scene.gltf"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=gltf_path)

mins = [float("inf")] * 3
maxs = [float("-inf")] * 3
mesh_count = 0
names = []

for obj in bpy.context.scene.objects:
    if obj.type != "MESH":
        continue
    mesh_count += 1
    names.append(obj.name)
    for corner in obj.bound_box:
        world = obj.matrix_world @ Vector(corner)
        for i in range(3):
            mins[i] = min(mins[i], world[i])
            maxs[i] = max(maxs[i], world[i])

info = {
    "mesh_count": mesh_count,
    "bounds_min": mins,
    "bounds_max": maxs,
    "size": [maxs[i] - mins[i] for i in range(3)],
    "center": [(mins[i] + maxs[i]) / 2 for i in range(3)],
    "sample_names": sorted(names)[:40],
}
print("MODEL_INFO_JSON:" + json.dumps(info, indent=2))