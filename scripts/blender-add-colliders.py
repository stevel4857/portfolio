"""Add invisible floor + wall collider meshes to Cable Center GLTF and export GLB."""
import bpy
import json
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
src = argv[0] if len(argv) > 0 else r"D:\work\steveknowsweb\assets\models\scene\scene.gltf"
out_glb = argv[1] if len(argv) > 1 else r"D:\work\steveknowsweb\assets\models\scene\scene.glb"

FLOOR_THICKNESS = 0.35
WALL_THICKNESS = 0.6
MARGIN = 6.0
WALL_EXTRA_HEIGHT = 8.0

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

def find_landscape_ground_y():
    """Lowest thin landscape slab — matches the visible ground, not sub-grade props."""
    best = None
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or obj.name.startswith("COLLIDER_"):
            continue
        corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        ys = [c[1] for c in corners]
        xs = [c[0] for c in corners]
        zs = [c[2] for c in corners]
        height = max(ys) - min(ys)
        width = max(xs) - min(xs)
        depth = max(zs) - min(zs)
        if height > 5 or (width < 1.5 and depth < 1.5):
            continue
        min_y = min(ys)
        if best is None or min_y < best:
            best = min_y
    return best

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

landscape_y = find_landscape_ground_y() or mins[1]

cx = (mins[0] + maxs[0]) / 2
cy = landscape_y
cz = (mins[2] + maxs[2]) / 2
width = (maxs[0] - mins[0]) + MARGIN * 2
depth = (maxs[2] - mins[2]) + MARGIN * 2
height = (maxs[1] - mins[1]) + WALL_EXTRA_HEIGHT
wall_center_y = mins[1] + height / 2

colliders = []

def make_box(name, location, dimensions):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    colliders.append(obj)
    return obj

# Floor slab at ground level
make_box(
    "COLLIDER_Floor",
    (cx, cy + FLOOR_THICKNESS / 2, cz),
    (width, FLOOR_THICKNESS, depth),
)

# Perimeter walls (thin boxes)
make_box(
    "COLLIDER_Wall_North",
    (cx, wall_center_y, maxs[2] + WALL_THICKNESS / 2),
    (width, height, WALL_THICKNESS),
)
make_box(
    "COLLIDER_Wall_South",
    (cx, wall_center_y, mins[2] - WALL_THICKNESS / 2),
    (width, height, WALL_THICKNESS),
)
make_box(
    "COLLIDER_Wall_East",
    (maxs[0] + WALL_THICKNESS / 2, wall_center_y, cz),
    (WALL_THICKNESS, height, depth),
)
make_box(
    "COLLIDER_Wall_West",
    (mins[0] - WALL_THICKNESS / 2, wall_center_y, cz),
    (WALL_THICKNESS, height, depth),
)

# Parent colliders under one empty for clarity (optional)
root = bpy.data.objects.new("COLLIDER_Root", None)
bpy.context.scene.collection.objects.link(root)
for obj in colliders:
    obj.parent = root

info = {
    "bounds_min": mins,
    "bounds_max": maxs,
    "landscape_ground_y": landscape_y,
    "colliders": [o.name for o in colliders],
    "output": out_glb,
}
print("COLLIDER_INFO_JSON:" + json.dumps(info, indent=2))

bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
)
print("Exported:", out_glb)