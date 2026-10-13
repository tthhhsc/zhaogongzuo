"""Generate assets/找工作.ico using only the Python standard library."""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

SIZE = 256
SCALE = 4
W = SIZE * SCALE


def blend(dst: list[int], src: tuple[int, int, int, int]) -> None:
    sr, sg, sb, sa = src
    alpha = sa / 255.0
    inverse = 1.0 - alpha
    dst[0] = int(sr * alpha + dst[0] * inverse)
    dst[1] = int(sg * alpha + dst[1] * inverse)
    dst[2] = int(sb * alpha + dst[2] * inverse)
    dst[3] = min(255, int(sa + dst[3] * inverse))


def rounded_box(x: float, y: float, cx: float, cy: float, half: float, radius: float) -> float:
    qx = abs(x - cx) - (half - radius)
    qy = abs(y - cy) - (half - radius)
    return math.hypot(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0) - radius


def segment_distance(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> float:
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    length_sq = vx * vx + vy * vy
    t = 0.0 if length_sq == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / length_sq))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


def make_image() -> bytes:
    pixels: list[list[int]] = [[0, 0, 0, 0] for _ in range(W * W)]
    center = W / 2
    half = W * 0.468
    radius = W * 0.205

    for y in range(W):
        for x in range(W):
            index = y * W + x
            pixel = pixels[index]
            if rounded_box(x + 0.5, y + 0.5, center, center, half, radius) <= 0:
                t = (x + y) / (2 * W)
                blend(pixel, (
                    int(18 + (7 - 18) * t),
                    int(119 + (72 - 119) * t),
                    int(100 + (63 - 100) * t),
                    255,
                ))

            distances = [
                abs(math.hypot(x + 0.5 - center, y + 0.5 - center) - W * 0.275),
                abs(math.hypot(x + 0.5 - center, y + 0.5 - center) - W * 0.155),
            ]
            if min(distances) <= W * 0.012:
                blend(pixel, (220, 249, 241, 238))

            if abs(math.hypot(x + 0.5 - center, y + 0.5 - center) - W * 0.055) <= W * 0.017:
                blend(pixel, (246, 185, 75, 255))

            if segment_distance(x + 0.5, y + 0.5, center, center, center + W * 0.265, center - W * 0.265) <= W * 0.018:
                blend(pixel, (255, 255, 255, 255))

            if math.hypot(x + 0.5 - center, y + 0.5 - center) <= W * 0.040:
                blend(pixel, (246, 185, 75, 255))

    downsampled = bytearray()
    block = SCALE * SCALE
    for y in range(SIZE):
        row = bytearray([0])
        for x in range(SIZE):
            totals = [0, 0, 0, 0]
            for yy in range(y * SCALE, (y + 1) * SCALE):
                offset = yy * W + x * SCALE
                for xx in range(SCALE):
                    pixel = pixels[offset + xx]
                    for channel in range(4):
                        totals[channel] += pixel[channel]
            row.extend(int(value / block) for value in totals)
        downsampled.extend(row)
    return bytes(downsampled)


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def make_png() -> bytes:
    raw = make_image()
    ihdr = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", zlib.compress(raw, 9)) + png_chunk(b"IEND", b"")


def main() -> None:
    png = make_png()
    icon_header = struct.pack("<HHH", 0, 1, 1)
    icon_entry = struct.pack("<BBBBHHII", 0, 0, 0, 0, 1, 32, len(png), 22)
    output = Path(__file__).resolve().parent / "找工作.ico"
    output.write_bytes(icon_header + icon_entry + png)
    print(f"wrote {output} ({output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
