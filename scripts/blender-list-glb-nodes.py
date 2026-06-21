import json
import struct
import sys

path = sys.argv[1] if len(sys.argv) > 1 else r"D:\work\steveknowsweb\assets\models\scene\scene.glb"
with open(path, "rb") as f:
    magic, version, length = struct.unpack("<4sII", f.read(12))
    chunk_len, chunk_type = struct.unpack("<I4s", f.read(8))
    data = json.loads(f.read(chunk_len).decode("utf-8"))

names = [n.get("name", "") for n in data.get("nodes", [])]
meshes = [m.get("name", "") for m in data.get("meshes", [])]
print("nodes:", [n for n in names if n])
print("meshes:", [m for m in meshes if m])
print("collider_nodes:", [n for n in names if "COLLIDER" in n.upper()])