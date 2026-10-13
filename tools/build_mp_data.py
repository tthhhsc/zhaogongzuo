"""Build the WeChat Mini Program data modules and tabBar icons from data/*.json.

Usage: python tools/build_mp_data.py
"""
import json
import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
MP = os.path.join(ROOT, "miniprogram")
UTILS = os.path.join(MP, "utils")
ASSETS = os.path.join(MP, "assets")

SIZE = 81
SUPERSAMPLE = 3
HALF = 4.0
NORMAL = (125, 137, 133)
ACTIVE = (13, 104, 90)

BANNER = "// 本文件由 tools/build_mp_data.py 依据 data/%s 自动生成，请勿手工编辑。\n"


def write_module(source_name, target_name):
    with open(os.path.join(DATA, source_name), "r", encoding="utf-8") as fh:
        payload = json.load(fh)
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    out = os.path.join(UTILS, target_name)
    with open(out, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(BANNER % source_name)
        fh.write("module.exports = " + body + ";\n")
    return len(payload)


# ---------------------------------------------------------------- icon shapes
def seg_dist(px, py, x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    length_sq = dx * dx + dy * dy
    if length_sq == 0:
        return math.hypot(px - x1, py - y1)
    t = ((px - x1) * dx + (py - y1) * dy) / length_sq
    t = max(0.0, min(1.0, t))
    return math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))


def ring_dist(px, py, cx, cy, r):
    return abs(math.hypot(px - cx, py - cy) - r)


def ellipse_ring_dist(px, py, cx, cy, a, b):
    d = math.hypot((px - cx) / a, (py - cy) / b)
    return abs(d - 1.0) * min(a, b)


def rect_dist(px, py, x1, y1, x2, y2):
    return min(
        seg_dist(px, py, x1, y1, x2, y1),
        seg_dist(px, py, x2, y1, x2, y2),
        seg_dist(px, py, x2, y2, x1, y2),
        seg_dist(px, py, x1, y2, x1, y1),
    )


def poly_dist(px, py, pts):
    best = 1e9
    total = len(pts)
    for i in range(total):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % total]
        best = min(best, seg_dist(px, py, x1, y1, x2, y2))
    return best


def icon_jobs(px, py):
    return min(
        rect_dist(px, py, 18, 31, 63, 67),
        seg_dist(px, py, 32, 31, 32, 23),
        seg_dist(px, py, 32, 23, 49, 23),
        seg_dist(px, py, 49, 23, 49, 31),
        seg_dist(px, py, 18, 47, 63, 47),
    )


def icon_source(px, py):
    return min(
        ring_dist(px, py, 40.5, 40.5, 25),
        ellipse_ring_dist(px, py, 40.5, 40.5, 11.5, 25),
        seg_dist(px, py, 15.5, 40.5, 65.5, 40.5),
    )


def icon_saved(px, py):
    return poly_dist(px, py, [(28, 17), (51, 17), (51, 64), (39.5, 52), (28, 64)])


def icon_me(px, py):
    head = ring_dist(px, py, 40.5, 28, 10.5)
    body = ring_dist(px, py, 40.5, 66, 19)
    if py > 60:
        body = 1e9
    return min(head, body)


ICONS = [
    ("tab-jobs", icon_jobs),
    ("tab-source", icon_source),
    ("tab-saved", icon_saved),
    ("tab-me", icon_me),
]


# ------------------------------------------------------------------ png write
def write_png(path, rows):
    raw = bytearray()
    for row in rows:
        raw.append(0)
        raw.extend(row)

    def chunk(tag, data):
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    header = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0)
    png = bytes([137, 80, 78, 71, 13, 10, 26, 10])
    png += chunk(b"IHDR", header)
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(png)


def render(shape, color, path):
    red, green, blue = color
    step = 1.0 / SUPERSAMPLE
    offset = step / 2.0
    samples = float(SUPERSAMPLE * SUPERSAMPLE)
    rows = []
    for y in range(SIZE):
        row = bytearray()
        for x in range(SIZE):
            hits = 0
            for sy in range(SUPERSAMPLE):
                for sx in range(SUPERSAMPLE):
                    px = x + offset + sx * step
                    py = y + offset + sy * step
                    if shape(px, py) <= HALF:
                        hits += 1
            alpha = int(round(255.0 * hits / samples))
            row.extend((red, green, blue, alpha))
        rows.append(row)
    write_png(path, rows)


def write_official_module():
    """Merge mainstream and lesser-known employer directories into one module."""
    merged = []
    seen = set()
    for source_name in ("official-careers.json", "niche-careers.json"):
        with open(os.path.join(DATA, source_name), "r", encoding="utf-8") as fh:
            payload = json.load(fh)
        for item in payload:
            name = item.get("name")
            if not name or name in seen:
                continue
            seen.add(name)
            merged.append(item)
    body = json.dumps(merged, ensure_ascii=False, indent=2)
    out = os.path.join(UTILS, "official-careers-data.js")
    with open(out, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("// 本文件由 tools/build_mp_data.py 依据 data/official-careers.json 与 data/niche-careers.json 自动生成，请勿手工编辑。\n")
        fh.write("module.exports = " + body + ";\n")
    return len(merged)


def main():
    os.makedirs(UTILS, exist_ok=True)
    os.makedirs(ASSETS, exist_ok=True)
    jobs = write_module("jobs.json", "jobs-data.js")
    sources = write_module("sources.json", "sources-data.js")
    official = write_official_module()
    for name, shape in ICONS:
        render(shape, NORMAL, os.path.join(ASSETS, name + ".png"))
        render(shape, ACTIVE, os.path.join(ASSETS, name + "-active.png"))
    print("jobs=%d sources=%d official=%d icons=%d" % (jobs, sources, official, len(ICONS) * 2))


if __name__ == "__main__":
    main()
