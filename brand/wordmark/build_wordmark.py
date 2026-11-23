"""Build outlined SVG versions of the J&W Collection wordmark.

Replicates the optical-balance layout chosen in the wordmark explorer:
letters Libre Caslon Display, ampersand EB Garamond 500 roman,
layout "small raised &", spacing 0.05 em, nudge 0.02 em,
ampersand size 0.57, height -0.21 em. The ampersand deliberately
overlaps the W (about 0.07 em) and the J (J_OVERLAP).

Gaps are measured as the mean horizontal distance between glyph ink
profiles, row by row, across the cap-height band.
"""

import json
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = Path(__file__).resolve().parent.parent / "fonts"
LETTERS = FONT_DIR / "LibreCaslonDisplay-Regular.ttf"
AMP = FONT_DIR / "EBGaramond-Medium.ttf"
SMALL = FONT_DIR / "EBGaramond-Medium.ttf"

GAP = 0.05
NUDGE = 0.02
AMP_SCALE = 0.57
AMP_DY = -0.21  # em of main size; negative is up
J_OVERLAP = 0.015  # em the ampersand overlaps the J at the closest point
R = 400  # raster size used for ink profiles
SMALL_RATIO = 12 / 84
SMALL_TRACK = 0.32
SMALL_SPACE = 0.19  # em of main size between the J&W ink and THE / COLLECTION ink


def profile(font_path: Path, ch: str) -> dict:
    """Rasterise one glyph and return per-row left/right ink edges in em."""
    font = ImageFont.truetype(str(font_path), R)
    width, height, base = R * 3, R * 2, int(R * 1.4)
    img = Image.new("L", (width, height), 0)
    ImageDraw.Draw(img).text((R, base), ch, font=font, fill=255, anchor="ls")
    px = img.load()
    left, right = [None] * height, [None] * height
    top = None
    for y in range(height):
        xs = [x for x in range(width) if px[x, y] > 80]
        if xs:
            left[y] = (xs[0] - R) / R
            right[y] = (xs[-1] - R) / R
            if top is None:
                top = y
    inked = [i for i in range(height) if left[i] is not None]
    return {
        "L": left,
        "R": right,
        "adv": font.getlength(ch) / R,
        "minL": min(left[i] for i in inked),
        "maxR": max(right[i] for i in inked),
        "top": (base - top) / R,
        "base": base,
    }


def edge(p: dict, side: str, y: float, k: float, dy: float):
    row = round(((y - dy) / k) * R + p["base"])
    if row < 0 or row >= len(p["L"]):
        return None
    v = p[side][row]
    return None if v is None else v * k


def mean_gap(pa, xa, ka, da, pb, xb, kb, db, cap) -> float:
    total, n = 0.0, 0
    y = -cap
    while y <= 0:
        a = edge(pa, "R", y, ka, da)
        b = edge(pb, "L", y, kb, db)
        if a is not None and b is not None:
            total += min((xb + b) - (xa + a), 0.8)
            n += 1
        y += 0.005
    return total / n if n else 0.0


def min_gap(pa, xa, ka, da, pb, xb, kb, db, cap) -> float:
    """Closest horizontal approach between two glyphs' ink, across the cap band."""
    best = 9.0
    y = -cap
    while y <= 0:
        a = edge(pa, "R", y, ka, da)
        b = edge(pb, "L", y, kb, db)
        if a is not None and b is not None:
            best = min(best, (xb + b) - (xa + a))
        y += 0.0025
    return best


def layout(mode: str = "mean", clearance: float = 0.04) -> dict:
    """Place J, &, W.

    mode "mean": equal average ink gaps (the explorer's method).
    mode "clearance": equal closest-approach gaps of `clearance` em.
    mode "blend": equal (mean + closest) / 2 gaps of `clearance` em.
    """
    pj, pw, pa = profile(LETTERS, "J"), profile(LETTERS, "W"), profile(AMP, "&")
    cap = profile(LETTERS, "H")["top"]
    k, dy = AMP_SCALE, AMP_DY
    if mode == "mean":
        gap_fn = mean_gap
    elif mode == "blend":
        def gap_fn(*a):
            return 0.5 * mean_gap(*a) + 0.5 * min_gap(*a)
    else:
        gap_fn = min_gap
    target_l = GAP if mode == "mean" else clearance
    target_r = GAP + NUDGE if mode == "mean" else clearance
    xa0 = pj["adv"]
    xa = xa0 + (target_l - gap_fn(pj, 0, 1, 0, pa, xa0, k, dy, cap))
    xw0 = xa + k * pa["adv"]
    xw = xw0 + (target_r - gap_fn(pa, xa, k, dy, pw, xw0, 1, 0, cap))
    # Slide the J right so the ampersand overlaps it by J_OVERLAP em at the
    # closest point; the ampersand/W relationship is left as laid out.
    xj = 0.0
    if J_OVERLAP is not None:
        xj = min_gap(pj, 0, 1, 0, pa, xa, k, dy, cap) + J_OVERLAP
    return {
        "xJ": xj,
        "xA": xa,
        "xW": xw,
        "cap": cap,
        "mode": mode,
        "meanGapL": mean_gap(pj, xj, 1, 0, pa, xa, k, dy, cap),
        "meanGapR": mean_gap(pa, xa, k, dy, pw, xw, 1, 0, cap),
        "minGapL": min_gap(pj, xj, 1, 0, pa, xa, k, dy, cap),
        "minGapR": min_gap(pa, xa, k, dy, pw, xw, 1, 0, cap),
        "inkL": min(xj + pj["minL"], xa + k * pa["minL"]),
        "inkR": max(xw + pw["maxR"], xa + k * pa["maxR"]),
    }


def glyph_path(font: TTFont, ch: str, size: float, x: float, y: float) -> tuple[str, float]:
    """SVG path for one character at font size `size`, origin (x, y) baseline."""
    gs = font.getGlyphSet()
    name = font.getBestCmap()[ord(ch)]
    s = size / font["head"].unitsPerEm
    pen = SVGPathPen(gs)
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
    return pen.getCommands(), gs[name].width * s


def glyph_bounds(font: TTFont, ch: str, size: float, x: float, y: float) -> tuple:
    """Ink bounds (xMin, yMin, xMax, yMax) in SVG coordinates (y down)."""
    gs = font.getGlyphSet()
    name = font.getBestCmap()[ord(ch)]
    s = size / font["head"].unitsPerEm
    pen = BoundsPen(gs)
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
    return pen.bounds


def union(boxes) -> tuple:
    boxes = [b for b in boxes if b]
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def tracked(font: TTFont, text: str, size: float, cx: float, top: float = None,
            bottom: float = None) -> tuple[str, tuple]:
    """Letter-spaced line whose INK is centred on cx.

    Give `top` to place the ink top there, or `bottom` to place the ink
    bottom there. Returns (path, ink bounds).
    """
    x, placed = 0.0, []
    for c in text:
        placed.append((c, x))
        x += glyph_path(font, c, size, 0, 0)[1] + SMALL_TRACK * size
    box = union(glyph_bounds(font, c, size, gx, 0) for c, gx in placed)
    dx = cx - (box[0] + box[2]) / 2
    dy = (top - box[1]) if top is not None else (bottom - box[3])
    path = " ".join(glyph_path(font, c, size, gx + dx, dy)[0] for c, gx in placed)
    return path, (box[0] + dx, box[1] + dy, box[2] + dx, box[3] + dy)


def build(out_dir: Path, mode: str = "mean", clearance: float = 0.04) -> dict:
    lay = layout(mode, clearance)
    letters, amp, small = TTFont(LETTERS), TTFont(AMP), TTFont(SMALL)
    size = 100.0  # main cap-letter font size in SVG units
    xj, xa, xw = lay["xJ"] * size, lay["xA"] * size, lay["xW"] * size
    asz, ady = size * AMP_SCALE, AMP_DY * size
    j = glyph_path(letters, "J", size, xj, 0)[0]
    w = glyph_path(letters, "W", size, xw, 0)[0]
    a = glyph_path(amp, "&", asz, xa, ady)[0]
    amp_box = glyph_bounds(amp, "&", asz, xa, ady)
    main = union([glyph_bounds(letters, "J", size, xj, 0),
                  glyph_bounds(letters, "W", size, xw, 0), amp_box])

    # Optical centre: the cap-height mass. The J's descender hook reaches
    # well left of its stem and serif, so it is left out of the centring.
    pj = profile(LETTERS, "J")
    j_left_above_base = min(v for i, v in enumerate(pj["L"])
                            if v is not None and i <= pj["base"])
    mass_left = min(xj + j_left_above_base * size, amp_box[0])
    cx = (mass_left + main[2]) / 2

    # Equal space between THE's ink and the cap tops, and between the
    # J's descender and COLLECTION's ink.
    ssz = size * SMALL_RATIO
    space = SMALL_SPACE * size
    the, the_box = tracked(small, "THE", ssz, cx, bottom=main[1] - space)
    col, col_box = tracked(small, "COLLECTION", ssz, cx, top=main[3] + space)

    paths = {"letters": f"{j} {w}", "amp": a, "the": the, "collection": col}
    pad = 6
    compact_box = (main[0] - pad, main[1] - pad,
                   main[2] - main[0] + 2 * pad, main[3] - main[1] + 2 * pad)
    full = union([main, the_box, col_box])
    half_w = max(cx - full[0], full[2] - cx) + pad  # keep cx at the viewBox centre
    lockup_box = (cx - half_w, full[1] - pad, 2 * half_w, full[3] - full[1] + 2 * pad)
    lay.update({"opticalCentreX": cx / size, "smallSpace": SMALL_SPACE,
                "theInk": the_box, "collectionInk": col_box, "mainInk": main})

    schemes = {
        "wall": {"letters": "#F3ECDF", "amp": "#B8955A", "small": "#B8955A"},
        "paper": {"letters": "#221C18", "amp": "#221C18", "small": "#2C1A27"},
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    for scheme, c in schemes.items():
        for kind, box in (("lockup", lockup_box), ("compact", compact_box)):
            vb = " ".join(f"{v:.2f}" for v in box)
            body = [
                f'<path fill="{c["letters"]}" d="{paths["letters"]}"/>',
                f'<path fill="{c["amp"]}" d="{paths["amp"]}"/>',
            ]
            if kind == "lockup":
                body += [
                    f'<path fill="{c["small"]}" d="{paths["the"]}"/>',
                    f'<path fill="{c["small"]}" d="{paths["collection"]}"/>',
                ]
            svg = (
                f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
                f'role="img" aria-label="The J&amp;W Collection">'
                + "".join(body) + "</svg>\n"
            )
            (out_dir / f"jw-{kind}-{scheme}.svg").write_text(svg)
    (out_dir / "wordmark-paths.json").write_text(
        json.dumps({"paths": paths, "lockup_viewbox": lockup_box,
                    "compact_viewbox": compact_box, "layout": lay}, indent=1)
    )
    return lay


if __name__ == "__main__":
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent
    mode = sys.argv[2] if len(sys.argv) > 2 else "mean"
    clearance = float(sys.argv[3]) if len(sys.argv) > 3 else 0.04
    print(json.dumps(build(out, mode, clearance), indent=1))
