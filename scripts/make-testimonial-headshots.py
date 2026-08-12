"""Crop Nic & Jana portraits to circular (and square) headshots for the site."""
from pathlib import Path
from PIL import Image, ImageDraw

SRC = Path(r"D:\!Video-Grok\testimonials")
OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "testimonials"
OUT_SRC = SRC / "headshots"
OUT.mkdir(parents=True, exist_ok=True)
OUT_SRC.mkdir(exist_ok=True)

SIZE = 512


def circular_headshot(img: Image.Image, box, size=SIZE) -> Image.Image:
    crop = img.crop(box).convert("RGBA")
    w, h = crop.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    crop = crop.crop((left, top, left + side, top + side))
    crop = crop.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(crop, (0, 0))
    out.putalpha(mask)
    return out


def square_headshot(img: Image.Image, box, size=SIZE) -> Image.Image:
    crop = img.crop(box).convert("RGB")
    w, h = crop.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    crop = crop.crop((left, top, left + side, top + side))
    return crop.resize((size, size), Image.Resampling.LANCZOS)


def clamp_box(box, w, h):
    l, t, r, b = box
    return (max(0, l), max(0, t), min(w, r), min(h, b))


def main():
    # Nic — full-body outdoor (768x1344); face ~mid upper body
    # Manual box: head + upper shoulders (tuned after first pass was too high)
    nic = Image.open(SRC / "nicvandessel4.jpg")
    nw, nh = nic.size
    print(f"nic: {nw}x{nh}")
    # Face center ~28% down; crop ~42% of width for head+shoulders
    cx = nw // 2
    fy = int(nh * 0.28)
    half = int(nw * 0.28)
    nic_box = clamp_box(
        (cx - half, fy - int(half * 1.05), cx + half, fy + int(half * 1.0)),
        nw,
        nh,
    )
    print(f"nic_box: {nic_box}")

    # Jana — 3/4 seated portrait (832x1504); face sits lower than full-body shots
    jana = Image.open(SRC / "Janaend1.jpg")
    jw, jh = jana.size
    print(f"jana: {jw}x{jh}")
    cx = jw // 2
    fy = int(jh * 0.36)  # include full chin; less empty sky
    half = int(jw * 0.31)
    jana_box = clamp_box(
        (cx - half, fy - int(half * 1.0), cx + half, fy + int(half * 1.1)),
        jw,
        jh,
    )
    print(f"jana_box: {jana_box}")

    # Sue — source is already a tight smiling headshot; use the full frame.
    sue = Image.open(SRC / "SueFey.jpg")
    sw, sh = sue.size
    print(f"sue: {sw}x{sh}")
    sue_box = clamp_box((0, 0, sw, sh), sw, sh)
    print(f"sue_box: {sue_box}")

    jobs = [
        ("nic-van-dessel", nic, nic_box),
        ("jana-henthorn", jana, jana_box),
        ("sue-fey", sue, sue_box),
    ]

    for name, img, box in jobs:
        circ = circular_headshot(img, box)
        sq = square_headshot(img, box)
        for dest in (OUT, OUT_SRC):
            circ_path = dest / f"{name}-circle.png"
            sq_path = dest / f"{name}-square.jpg"
            circ.save(circ_path, "PNG", optimize=True)
            sq.save(sq_path, "JPEG", quality=92, optimize=True)
            print(f"wrote {circ_path} ({circ_path.stat().st_size} bytes)")
            print(f"wrote {sq_path} ({sq_path.stat().st_size} bytes)")

        preview = Image.new("RGBA", (SIZE + 40, SIZE + 40), (248, 250, 252, 255))
        preview.paste(circ, (20, 20), circ)
        preview_path = OUT / f"{name}-preview.png"
        preview.save(preview_path)
        print(f"preview {preview_path}")

    print("done")


if __name__ == "__main__":
    main()
