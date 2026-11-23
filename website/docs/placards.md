---
title: Placards
sidebar_position: 4
---

# Placards

Each work has a printed placard (an object label) beside it. Placards are
generated from the collection record by `placards/make_placards.py`; nothing
on a placard is typed by hand.

## Content, in order

1. **Category**: small capitals, accent colour.
2. **Artist**, then nationality and dates.
3. **Title** in italic, then date, medium and dimensions.
4. **Label text**: 50 words or fewer, in a right-hand column. Optional on small placards.
5. **Credit line** and **accession number**, below a gilt rule.
6. **QR code** to the work's page (audio guide and full record).

This follows the usual museum "tombstone" order: who made it, what it is,
when, what it is made of, how big, and how the collection acquired it.

## Sizes

| Size | Dimensions | Use | Label text |
| --- | --- | --- | --- |
| `standard` | 6 × 4 in, landscape | Default | Yes |
| `compact` | 5 × 3 in, landscape | Where a standard placard will not fit | Yes, smaller |
| `mini` | 3.5 × 2 in, landscape | Tight spots, small objects | No; tombstone and QR code only |

## Type

All text is EB Garamond, ink on paper, flush left with a ragged right edge.

| Element | Standard | Compact | Mini |
| --- | --- | --- | --- |
| Category | 8 pt capitals, tracked | 7 pt | 6 pt |
| Artist | 17 pt semibold | 13.5 pt | 10 pt |
| Title | 17 pt italic | 13.5 pt | 10 pt |
| Date, medium, dimensions | 10.5 / 13 pt | 8.75 / 11 pt | 7 / 8.4 pt |
| Label text | 11.5 / 15 pt, shrinking to 9.5 pt to fit | 9.25 pt, to 8 pt | |
| Credit line | 9.5 pt | 8 pt | 6.5 pt |
| Accession number | 8.5 pt capitals, accent | 7.5 pt | 6 pt |

### Departures from accessibility guidance

The Smithsonian's guidelines for accessible exhibitions set a minimum x-height
of 4.5 mm (about 24 pt in a typical sans serif) even for text read from
closer than 75 mm, and prefer sans serif or simple serif faces with a large
x-height. These placards are deliberately smaller, because the walls are
crowded and visitors stand close. EB Garamond also has a small x-height for
its size. To compensate:

- every placard links by QR code (and NFC tag, when fitted) to the same text
  on the website, where it can be enlarged or read aloud;
- the audio guide reads the label text;
- contrast is high (ink on paper, 14.3:1) and the stock is matte.

Follow the guidelines' other rules in full: no text in all capitals beyond
short labels, no centred text blocks, no text over images, and lines of about
45–55 characters.

## Materials and printing

- **Stock:** matte or eggshell cardstock, cream or white. No gloss: glare makes
  labels hard to read under spotlights.
- **Printing:** run `python placards/make_placards.py`, then print
  `placards/output/sheet-standard.pdf` at **100% / actual size**, not "fit to
  page". Cut along the crop marks.
- **Mounting:** on a rigid backing (foam board or mat board) cut to size, hung
  with removable mounting strips. Do not cover a label with clear acrylic
  sitting on the wall; its shadow makes the text harder to read.
- **Proofs:** print `--all` to see drafts with gaps in `[BRACKETS]`. A placard
  is final only when the console lists nothing missing and the QR code opens
  the right page on a phone.

## Placement

- Beside the work, normally to the right, at the same position relative to
  every work in the gallery.
- Centre line between 48 and 67 in (1,220–1,675 mm) from the floor; the
  optimum is 54 in (1,370 mm).
- Where the work hangs over the vanity or toilet, keep the placard in that
  band if possible and never where it will be splashed.
- Lit at 100–300 lux, evenly and without shadows (see [Lighting](./lighting.md)).

## Sources

- Smithsonian Accessibility Program, [*Smithsonian Guidelines for Accessible Exhibition Design*](https://www.sifacilities.si.edu/sites/default/files/Files/Accessibility/accessible-exhibition-design1.pdf): type size by viewing distance, typeface and x-height, leading, line length, contrast, matte finish, label lighting and mounting height.
- Association of Independent Museums, [Text writing](https://aim-museums.co.uk/museum-displays-interpretation/text-writing): object labels of 30–50 words.
