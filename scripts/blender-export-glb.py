"""Export Cable Center scene to a single GLB file (textures embedded)."""
import bpy
import sys

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
src = argv[0] if len(argv) > 0 else r"D:\work\steveknowsweb\assets\models\scene\scene.gltf"
out_glb = argv[1] if len(argv) > 1 else r"D:\work\steveknowsweb\assets\models\scene\scene.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
)
print("Exported GLB:", out_glb)