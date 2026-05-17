#!/usr/bin/env python3
"""
PYKLR logo vectorization pipeline.

Takes the original Pyklr_-_Logo_Color.png and produces:
  - pyklr-logo-color.svg (full lockup, color)
  - pyklr-logo-{green,black,white}.svg (monochrome variants)
  - pyklr-mark.svg (icon only - paddle + ball)
  - pyklr-wordmark.svg (PYKLR text only)
  - pyklr-app-icon.svg + multi-size PNGs (paddle on solid blue, for app stores)
  - pyklr-app-icon-rounded.svg (rounded-square variant for Android/PWA)
  - pyklr-logo-paths.ts (path data as TS constants for React Native)

Usage:
  python3 vectorize-logo.py SOURCE_PNG OUTPUT_DIR FONT_TTF

Requirements:
  pip install pillow numpy potracer cairosvg scipy
"""

import sys
import os
import re
import base64
import numpy as np
from PIL import Image
import potrace
import cairosvg
from scipy import ndimage

GREEN = '#67BF69'
BLUE = '#4493CC'


def trace_region(mask, turdsize=40, x_off=0, y_off=0, opticurve=True, alphamax=1.0):
    """Trace a boolean mask into SVG path data, filtering out the image bounding-box outer path."""
    bmp = potrace.Bitmap(mask)
    path = bmp.trace(turdsize=turdsize, alphamax=alphamax, opticurve=opticurve, opttolerance=0.3)
    H, W = mask.shape
    segments = []
    for curve in path:
        start = curve.start_point
        xs = [start.x] + [s.end_point.x for s in curve.segments]
        ys = [start.y] + [s.end_point.y for s in curve.segments]
        # Skip the outer image rectangle (false positive)
        if max(xs) - min(xs) > W * 0.95 and max(ys) - min(ys) > H * 0.95:
            continue
        parts = [f"M{start.x - x_off:.1f} {start.y - y_off:.1f}"]
        for seg in curve.segments:
            if seg.is_corner:
                parts.append(f"L{seg.c.x - x_off:.1f} {seg.c.y - y_off:.1f}"
                             f"L{seg.end_point.x - x_off:.1f} {seg.end_point.y - y_off:.1f}")
            else:
                parts.append(f"C{seg.c1.x - x_off:.1f} {seg.c1.y - y_off:.1f} "
                             f"{seg.c2.x - x_off:.1f} {seg.c2.y - y_off:.1f} "
                             f"{seg.end_point.x - x_off:.1f} {seg.end_point.y - y_off:.1f}")
        parts.append("Z")
        segments.append("".join(parts))
    return " ".join(segments)


def bbox(mask):
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    if not rows.any():
        return None
    return (int(cols.argmax()), int(rows.argmax()),
            int(len(cols) - cols[::-1].argmax()),
            int(len(rows) - rows[::-1].argmax()))


def main(source_png, output_dir, font_ttf):
    os.makedirs(output_dir, exist_ok=True)

    # === Load + upscale 3x for higher trace fidelity ===
    img_orig = Image.open(source_png).convert('RGBA')
    W_o, H_o = img_orig.size
    img = img_orig.resize((W_o * 3, H_o * 3), Image.LANCZOS)
    arr = np.array(img)
    h, w = arr.shape[:2]
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    green_mask = (g > 100) & (g > r + 30) & (g > b - 20)
    blue_mask = (b > 100) & (b > r + 30) & (b > g - 30)

    # === Region masks (boundaries calibrated for the source logo layout) ===
    # Icon area: x < 410 in original (× 3 = 1230), y < 445 in original (× 3 = 1335)
    icon_green = np.zeros_like(green_mask)
    icon_green[:1335, :1230] = green_mask[:1335, :1230]
    icon_blue = np.zeros_like(blue_mask)
    icon_blue[:1335, :1230] = blue_mask[:1335, :1230]

    wordmark = np.zeros_like(green_mask)
    wordmark[:1335, 1230:] = green_mask[:1335, 1230:]

    # Clean the icon: connected-component filter to remove the small triangle artifact
    paddle_region = np.zeros_like(green_mask)
    paddle_region[:1620, :1200] = green_mask[:1620, :1200]
    labeled, num = ndimage.label(paddle_region)
    sizes = ndimage.sum(paddle_region, labeled, range(1, num + 1))
    largest_idx = int(np.argmax(sizes)) + 1
    paddle_clean = (labeled == largest_idx)
    # Add back the small ball-dot components (3-8K px range)
    for i in range(1, num + 1):
        if i == largest_idx:
            continue
        if 3000 < sizes[i - 1] < 8000:
            paddle_clean |= (labeled == i)

    # === Trace all regions ===
    icon_green_path = trace_region(icon_green, turdsize=40)
    icon_blue_path = trace_region(icon_blue, turdsize=40)
    wordmark_path = trace_region(wordmark, turdsize=80)
    paddle_path = trace_region(paddle_clean, turdsize=20)

    # === Embed font for tagline ===
    with open(font_ttf, 'rb') as f:
        font_b64 = base64.b64encode(f.read()).decode('ascii')

    font_defs = (f'<defs><style>@font-face {{ font-family: \'Sink\'; '
                 f'src: url(data:font/ttf;base64,{font_b64}) format(\'truetype\'); }} '
                 f'.tagline {{ font-family: \'Sink\', \'Courier New\', monospace; letter-spacing: 4px; }}</style></defs>')

    # === 1. FULL COLOR LOGO ===
    def full_lockup(color_paddle, color_triangle, color_wordmark, color_tagline):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="none" '
                f'role="img" aria-label="PYKLR - Meet players. Start matches.">\n'
                f'<title>PYKLR</title>\n'
                f'<desc>PYKLR logo: green pickleball paddle and ball on blue triangle backdrop, '
                f'green PYKLR wordmark, and blue tagline.</desc>\n'
                f'{font_defs}\n'
                f'<path d="{icon_blue_path}" fill="{color_triangle}"/>\n'
                f'<path d="{icon_green_path}" fill="{color_paddle}"/>\n'
                f'<path d="{wordmark_path}" fill="{color_wordmark}"/>\n'
                f'<text x="1010" y="1560" class="tagline" font-size="115" fill="{color_tagline}">'
                f'MEET PLAYERS. START MATCHES.</text>\n'
                f'</svg>')

    color_svg = full_lockup(GREEN, BLUE, GREEN, BLUE)
    with open(f'{output_dir}/pyklr-logo-color.svg', 'w') as f:
        f.write(color_svg)
    cairosvg.svg2png(url=f'{output_dir}/pyklr-logo-color.svg',
                     write_to=f'{output_dir}/pyklr-logo-color.png', output_width=1500)

    # === 2. MONOCHROME variants ===
    for color, suffix, bg in [(GREEN, 'green', 'white'), ('#000000', 'black', 'white'),
                               ('#FFFFFF', 'white', 'black')]:
        svg = full_lockup(color, color, color, color)
        with open(f'{output_dir}/pyklr-logo-{suffix}.svg', 'w') as f:
            f.write(svg)
        cairosvg.svg2png(url=f'{output_dir}/pyklr-logo-{suffix}.svg',
                         write_to=f'{output_dir}/pyklr-logo-{suffix}.png',
                         output_width=1500, background_color=bg)

    # === 3. MARK only (cleaned paddle/ball) ===
    x0, y0, x1, y1 = bbox(paddle_clean)
    pw, ph = x1 - x0, y1 - y0
    paddle_cropped = trace_region(paddle_clean, turdsize=20, x_off=x0, y_off=y0)
    mark_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {pw} {ph}" fill="none" '
                f'role="img" aria-label="PYKLR mark">\n'
                f'<title>PYKLR mark</title>\n'
                f'<path d="{paddle_cropped}" fill="{GREEN}"/>\n</svg>')
    with open(f'{output_dir}/pyklr-mark.svg', 'w') as f:
        f.write(mark_svg)
    cairosvg.svg2png(url=f'{output_dir}/pyklr-mark.svg',
                     write_to=f'{output_dir}/pyklr-mark.png', output_width=512)

    # === 4. WORDMARK only ===
    wx0, wy0, wx1, wy1 = bbox(wordmark)
    ww, wh = wx1 - wx0, wy1 - wy0
    wordmark_cropped = trace_region(wordmark, turdsize=80, x_off=wx0, y_off=wy0)
    wordmark_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ww} {wh}" fill="none" '
                    f'role="img" aria-label="PYKLR">\n'
                    f'<title>PYKLR wordmark</title>\n'
                    f'<path d="{wordmark_cropped}" fill="{GREEN}"/>\n</svg>')
    with open(f'{output_dir}/pyklr-wordmark.svg', 'w') as f:
        f.write(wordmark_svg)
    cairosvg.svg2png(url=f'{output_dir}/pyklr-wordmark.svg',
                     write_to=f'{output_dir}/pyklr-wordmark.png', output_width=1000)

    # === 5. APP ICONS (square + rounded square) ===
    icon_size = 1024
    scale = (icon_size * 0.65) / max(pw, ph)
    cx = (icon_size - pw * scale) / 2
    cy = (icon_size - ph * scale) / 2

    def app_icon(rounded=False):
        rect = (f'<rect width="{icon_size}" height="{icon_size}" '
                f'{"rx=\"225\" ry=\"225\" " if rounded else ""}fill="{BLUE}"/>')
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {icon_size} {icon_size}" '
                f'fill="none" role="img" aria-label="PYKLR app icon">\n'
                f'<title>PYKLR app icon</title>\n{rect}\n'
                f'<g transform="translate({cx:.1f} {cy:.1f}) scale({scale:.4f})">\n'
                f'<path d="{paddle_cropped}" fill="{GREEN}"/>\n</g>\n</svg>')

    with open(f'{output_dir}/pyklr-app-icon.svg', 'w') as f:
        f.write(app_icon(rounded=False))
    cairosvg.svg2png(url=f'{output_dir}/pyklr-app-icon.svg',
                     write_to=f'{output_dir}/pyklr-app-icon.png', output_width=1024)

    with open(f'{output_dir}/pyklr-app-icon-rounded.svg', 'w') as f:
        f.write(app_icon(rounded=True))
    cairosvg.svg2png(url=f'{output_dir}/pyklr-app-icon-rounded.svg',
                     write_to=f'{output_dir}/pyklr-app-icon-rounded.png', output_width=1024)

    # Multi-size PNG exports
    for sz in [48, 72, 96, 144, 180, 192, 512]:
        cairosvg.svg2png(url=f'{output_dir}/pyklr-app-icon.svg',
                         write_to=f'{output_dir}/pyklr-app-icon-{sz}.png', output_width=sz)

    # === 6. TypeScript module with path data for React Native ===
    ts = (f"""// PYKLR Logo path data — auto-generated by vectorize-logo.py
// Use with react-native-svg <Svg><Path d={{PYKLR_MARK_PATH}} fill="#67BF69" /></Svg>

export const PYKLR_MARK_VIEWBOX = '0 0 {pw} {ph}';
export const PYKLR_MARK_PATH = '{paddle_cropped}';

export const PYKLR_WORDMARK_VIEWBOX = '0 0 {ww} {wh}';
export const PYKLR_WORDMARK_PATH = '{wordmark_cropped}';

export const PYKLR_COLORS = {{
  green: '#67BF69',
  greenDark: '#4FA547',
  greenLight: '#EAF5E5',
  lime: '#A8E66A',     // Dark-mode primary
  limeDark: '#0A1F08',
  blue: '#4493CC',
  blueLight: '#E4F0F8',
}};
""")
    with open(f'{output_dir}/pyklr-logo-paths.ts', 'w') as f:
        f.write(ts)

    print(f"Done. Files written to {output_dir}/")


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: vectorize-logo.py SOURCE_PNG OUTPUT_DIR FONT_TTF")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])
