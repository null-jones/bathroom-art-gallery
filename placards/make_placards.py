"""Generate gallery placards (object labels) from the collection records.

Usage:
    python placards/make_placards.py                  # every on-view work
    python placards/make_placards.py sailboats radishes
    python placards/make_placards.py --all --size compact
    python placards/make_placards.py sailboats --size mini --background

Writes to placards/output/:
    <slug>-<size>.pdf      one placard at its exact size (proofs, print shops)
    sheet-<size>.pdf       US Letter sheets with crop marks for home printing

Sizes (landscape):
    standard  6 x 4 in      full label with descriptive text
    compact   5 x 3 in      full label, smaller type
    mini      3.5 x 2 in    tombstone and QR code only, for tight spots

Missing catalogue values are printed in [BRACKETS] so a proof shows what is
still to be filled in; the script lists them on the console.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path

import segno
import yaml
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parent.parent
COLLECTION = ROOT / "collection"
FONTS = ROOT / "brand" / "fonts"
OUTPUT = Path(__file__).resolve().parent / "output"

INK = HexColor("#221C18")
ACCENT = HexColor("#2C1A27")  # deep aubergine
GILT = HexColor("#B8955A")
PAPER = HexColor("#F3ECDF")

FONT_FILES = {
    "Garamond": "EBGaramond-Regular.ttf",
    "Garamond-Italic": "EBGaramond-Italic.ttf",
    "Garamond-Medium": "EBGaramond-Medium.ttf",
    "Garamond-SemiBold": "EBGaramond-SemiBold.ttf",
}


@dataclass(frozen=True)
class Size:
    name: str
    width: float          # points
    height: float
    margin: float
    columns: bool         # descriptive text in a right-hand column
    category: float       # font sizes, points
    artist: float
    title: float
    detail: float
    detail_leading: float
    label: float
    label_min: float
    label_leading: float  # as a multiple of the label size
    credit: float
    accession: float
    qr: float             # QR code side, points, including its quiet zone


SIZES = {
    "standard": Size("standard", 6 * inch, 4 * inch, 0.3 * inch, True,
                     8, 17, 17, 10.5, 13, 11.5, 9.5, 1.3, 9.5, 8.5, 0.85 * inch),
    "compact": Size("compact", 5 * inch, 3 * inch, 0.24 * inch, True,
                    7, 13.5, 13.5, 8.75, 11, 9.25, 8, 1.28, 8, 7.5, 0.7 * inch),
    "mini": Size("mini", 3.5 * inch, 2 * inch, 0.16 * inch, False,
                 6, 10, 10, 7, 8.4, 0, 0, 1.0, 6.5, 6, 0.56 * inch),
}


def register_fonts() -> None:
    for name, file in FONT_FILES.items():
        pdfmetrics.registerFont(TTFont(name, str(FONTS / file)))


def load_yaml(path: Path):
    with path.open(encoding="utf-8") as fh:
        return yaml.safe_load(fh)


# ---------------------------------------------------------------------------
# Formatting


def fmt_inches(value: float) -> str:
    """Inches to the nearest eighth, as '16', '7 1/2' or '3/8'."""
    frac = Fraction(round(value * 8), 8)
    whole, rest = divmod(frac.numerator, frac.denominator)
    rest = Fraction(rest, frac.denominator)
    if rest == 0:
        return str(whole)
    return f"{whole} {rest}" if whole else str(rest)


def fmt_dimensions(dim: dict | None) -> str | None:
    """'40.6 × 50.8 cm (16 × 20 in.)', centimetres first, height × width (× depth)."""
    if not dim or dim.get("height") is None or dim.get("width") is None:
        return None
    values = [dim["height"], dim["width"]] + ([dim["depth"]] if dim.get("depth") else [])
    if dim.get("unit", "in") == "cm":
        cm = values
        inches = [v / 2.54 for v in values]
    else:
        inches = values
        cm = [v * 2.54 for v in values]
    text = " × ".join(f"{v:.1f}" for v in cm) + " cm (" + " × ".join(fmt_inches(v) for v in inches) + " in.)"
    if dim.get("note"):
        text += f", {dim['note'].lower()}"
    return text


def site_url(site: dict, slug: str) -> str:
    parts = [site["url"].rstrip("/"), site["base_url"].strip("/"), "collection", slug]
    return "/".join(p for p in parts if p)


# ---------------------------------------------------------------------------
# Drawing


class Missing(list):
    def need(self, value, name: str):
        if value in (None, ""):
            self.append(name)
            return f"[{name.upper()}]"
        return value


def draw_qr(c: Canvas, data: str, x: float, y: float, side: float) -> None:
    """Vector QR code with its 4-module quiet zone inside the given square."""
    qr = segno.make(data, error="m")
    matrix = list(qr.matrix)
    n = len(matrix)
    module = side / (n + 8)
    c.setFillColor(INK)
    for row_i, row in enumerate(matrix):
        for col_i, dark in enumerate(row):
            if dark:
                c.rect(x + (col_i + 4) * module, y + side - (row_i + 5) * module,
                       module, module, stroke=0, fill=1)


def text_lines(text: str, font: str, size: float, width: float) -> list[str]:
    lines: list[str] = []
    for para in str(text).split("\n"):
        lines.extend(simpleSplit(para, font, size, width) or [""])
    return lines


def tracked(c: Canvas, text: str, x: float, y: float, font: str, size: float,
            tracking: float, align: str = "left") -> float:
    """Letter-spaced capitals; returns the drawn width."""
    widths = [pdfmetrics.stringWidth(ch, font, size) for ch in text]
    total = sum(widths) + tracking * size * (len(text) - 1)
    if align == "right":
        x -= total
    c.setFont(font, size)
    for ch, w in zip(text, widths):
        c.drawString(x, y, ch)
        x += w + tracking * size
    return total


def draw_placard(c: Canvas, obj: dict, slug: str, size: Size, categories: dict,
                 site: dict, ox: float, oy: float, background: bool) -> list[str]:
    """Draw one placard with its lower-left corner at (ox, oy). Returns missing fields."""
    miss = Missing()
    w, h, m = size.width, size.height, size.margin
    if background:
        c.setFillColor(PAPER)
        c.rect(ox, oy, w, h, stroke=0, fill=1)

    artist = obj.get("artist") or {}
    category = categories.get(obj.get("category"), {}).get("label")
    category = miss.need(category, "category")
    artist_name = miss.need(artist.get("name"), "artist")
    nat = ", ".join(v for v in (artist.get("nationality"), artist.get("dates")) if v)
    title = miss.need(obj.get("title"), "title")
    if obj.get("series"):
        title = f"{title}, from the {obj['series']} series"
    date = miss.need(obj.get("date"), "date")
    medium = miss.need(obj.get("medium"), "medium")
    dims = miss.need(fmt_dimensions(obj.get("dimensions")), "dimensions")
    credit = miss.need(obj.get("credit_line"), "credit line")
    accession = obj.get("accession_number") or "Accession no. pending"
    if not obj.get("accession_number"):
        miss.append("accession number")
    label = obj.get("label")
    if size.columns and not label:
        miss.append("label")

    # Bottom band: credit line and accession number at left, QR code at right.
    qr = size.qr
    draw_qr(c, site_url(site, slug), ox + w - m - qr + qr * 0.06, oy + m - qr * 0.06, qr)
    band_top = oy + m + qr * 0.88
    c.setStrokeColor(GILT)
    c.setLineWidth(0.6)
    c.line(ox + m, band_top + 5, ox + w - m, band_top + 5)

    text_right = ox + w - m - qr - 8
    if size.columns:
        cap = size.credit * 0.85
        c.setFillColor(INK)
        c.setFont("Garamond-Italic", cap)
        for i, line in enumerate(("Audio guide and", "full record")):
            c.drawRightString(text_right, oy + m + qr * 0.5 - i * cap * 1.2, line)
        text_right -= max(pdfmetrics.stringWidth(t, "Garamond-Italic", cap)
                          for t in ("Audio guide and", "full record")) + 10
    c.setFillColor(ACCENT)
    tracked(c, accession.upper() if not obj.get("accession_number") else accession,
            ox + m, oy + m + 1, "Garamond-Medium", size.accession, 0.08)
    c.setFillColor(INK)
    credit_lines = text_lines(credit, "Garamond", size.credit, text_right - ox - m)
    y = oy + m + 1 + size.accession + 4
    for line in reversed(credit_lines):
        c.setFont("Garamond", size.credit)
        c.drawString(ox + m, y, line)
        y += size.credit * 1.2

    # Upper area.
    top = oy + h - m
    floor = band_top + 12
    col_gap = 0.22 * inch
    left_w = (w - 2 * m - col_gap) * 0.47 if size.columns else w - 2 * m
    x = ox + m

    y = top - size.category
    c.setFillColor(ACCENT)
    tracked(c, category.upper(), x, y, "Garamond-Medium", size.category, 0.2)
    c.setFillColor(INK)
    y -= size.artist * 1.25
    for line in text_lines(artist_name, "Garamond-SemiBold", size.artist, left_w):
        c.setFont("Garamond-SemiBold", size.artist)
        c.drawString(x, y, line)
        y -= size.artist * 1.1
    if nat:
        y += size.artist * 1.1 - size.detail_leading
        c.setFont("Garamond", size.detail)
        c.drawString(x, y, nat)
        y -= size.detail_leading
    y -= size.title * 0.55
    for line in text_lines(title, "Garamond-Italic", size.title, left_w):
        c.setFont("Garamond-Italic", size.title)
        c.drawString(x, y, line)
        y -= size.title * 1.1
    y += size.title * 1.1 - size.detail_leading
    for value in (date, medium, dims):
        for line in text_lines(value, "Garamond", size.detail, left_w):
            c.setFont("Garamond", size.detail)
            c.drawString(x, y, line)
            y -= size.detail_leading
    if y + size.detail_leading - size.detail * 0.3 < floor:
        print(f"  ! {slug} ({size.name}): details overrun the bottom band; shorten medium or use a larger size",
              file=sys.stderr)

    # Descriptive label text in the right-hand column, shrinking to fit.
    if size.columns and label:
        rx = ox + m + left_w + col_gap
        rw = ox + w - m - rx
        fs = size.label
        while True:
            lines = text_lines(" ".join(str(label).split()), "Garamond", fs, rw)
            lead = fs * size.label_leading
            if top - fs - (len(lines) - 1) * lead >= floor or fs <= size.label_min:
                break
            fs = round(fs - 0.25, 2)
        if top - fs - (len(lines) - 1) * lead < floor:
            print(f"  ! {slug} ({size.name}): label text does not fit even at {fs} pt; "
                  f"shorten it (50 words or fewer) or use the standard size", file=sys.stderr)
        ly = top - size.category - size.artist * 1.25  # first baseline level with the artist
        c.setFont("Garamond", fs)
        for line in lines:
            c.drawString(rx, ly, line)
            ly -= lead
    return miss


def crop_marks(c: Canvas, x: float, y: float, w: float, h: float) -> None:
    c.setStrokeColor(INK)
    c.setLineWidth(0.25)
    off, length = 3, 9
    for cx, dx in ((x, -1), (x + w, 1)):
        for cy, dy in ((y, -1), (y + h, 1)):
            c.line(cx + dx * off, cy, cx + dx * (off + length), cy)
            c.line(cx, cy + dy * off, cx, cy + dy * (off + length))


# ---------------------------------------------------------------------------


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slugs", nargs="*", help="Object slugs (file names in collection/objects without .yaml)")
    parser.add_argument("--all", action="store_true", help="Every record, including drafts")
    parser.add_argument("--size", choices=SIZES, default="standard")
    parser.add_argument("--background", action="store_true",
                        help="Print the paper colour as a background (uses a lot of ink)")
    args = parser.parse_args(argv)

    register_fonts()
    site = load_yaml(COLLECTION / "site.yaml")
    categories = {c["key"]: c for c in load_yaml(COLLECTION / "categories.yaml")}
    records = {p.stem: load_yaml(p) for p in sorted((COLLECTION / "objects").glob("*.yaml"))
               if not p.stem.startswith("_")}

    if args.slugs:
        unknown = [s for s in args.slugs if s not in records]
        if unknown:
            parser.error(f"no record for: {', '.join(unknown)}")
        slugs = args.slugs
    elif args.all:
        slugs = list(records)
    else:
        slugs = [s for s, r in records.items() if r.get("status") == "on-view"]
    if not slugs:
        print("Nothing to print.")
        return 0

    size = SIZES[args.size]
    OUTPUT.mkdir(exist_ok=True)

    for slug in slugs:
        path = OUTPUT / f"{slug}-{size.name}.pdf"
        c = Canvas(str(path), pagesize=(size.width, size.height))
        c.setTitle(f"Placard: {records[slug].get('title') or slug}")
        missing = draw_placard(c, records[slug], slug, size, categories, site, 0, 0, args.background)
        c.showPage()
        c.save()
        note = f"  missing: {', '.join(missing)}" if missing else ""
        print(f"{path.relative_to(ROOT)}{note}")

    # Letter sheets with crop marks.
    page_w, page_h = letter
    gap, page_margin = 0.25 * inch, 0.5 * inch
    cols = max(1, int((page_w - 2 * page_margin + gap) // (size.width + gap)))
    rows = max(1, int((page_h - 2 * page_margin + gap) // (size.height + gap)))
    grid_w = cols * size.width + (cols - 1) * gap
    grid_h = rows * size.height + (rows - 1) * gap
    x0, y0 = (page_w - grid_w) / 2, (page_h + grid_h) / 2
    sheet = OUTPUT / f"sheet-{size.name}.pdf"
    c = Canvas(str(sheet), pagesize=letter)
    c.setTitle(f"Placards, {size.name}")
    for i, slug in enumerate(slugs):
        slot = i % (cols * rows)
        if i and slot == 0:
            c.showPage()
        col, row = slot % cols, slot // cols
        x = x0 + col * (size.width + gap)
        y = y0 - (row + 1) * size.height - row * gap
        draw_placard(c, records[slug], slug, size, categories, site, x, y, args.background)
        crop_marks(c, x, y, size.width, size.height)
    c.showPage()
    c.save()
    print(f"{sheet.relative_to(ROOT)}  ({cols * rows} per sheet; print at 100%, not 'fit to page')")
    return 0


if __name__ == "__main__":
    sys.exit(main())
