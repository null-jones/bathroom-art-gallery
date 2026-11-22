---
title: Cataloguing
sidebar_position: 3
---

# Cataloguing

Every work has one record: a YAML file in `collection/objects/`. The website,
the gallery map and the placards are all generated from it, so a fact is
entered once. Copy `collection/objects/_template.yaml` to start a record.

## Principles

- **Record only what is known.** Unknown fields stay empty (`null`). The site
  shows "Artist to be confirmed" or "Photograph to come"; placard proofs print
  the gap in `[BRACKETS]`. Nothing is filled in by guesswork.
- **Keep the source.** Measurements are entered in the unit they were taken
  in; conversions are calculated, never typed.
- **The slug is permanent.** The file name (`sailboats.yaml`) is the web
  address (`/collection/sailboats`) that printed QR codes point to. Do not
  rename it once a placard has been printed.

## Accession numbers

Format: **`YYYY.N.N`**

| Part | Meaning | Example |
| --- | --- | --- |
| `YYYY` | Year the work formally entered the collection | `2024` |
| first `N` | Acquisition number within that year (one gift or purchase = one number) | `2024.3` = the third acquisition of 2024 |
| second `N` | Part of that acquisition | `2024.3.1`, `2024.3.2` for a pair given together |

A single object is still given a part number: `2024.1.1`. Numbers are never
reused, even if a work leaves the collection. Assign the number when the work
is accessioned; until then the field is empty and the placard reads
"Accession no. pending". The site rejects numbers in any other format.

## Status

| Value | Meaning |
| --- | --- |
| `draft` | Record started; catalogue details incomplete |
| `on-view` | Catalogued and hanging in the gallery |
| `in-storage` | In the collection but not on display |
| `on-loan` | Lent elsewhere |

Running `make_placards.py` without arguments prints placards for `on-view` works only.

## Categories

Defined in `collection/categories.yaml`. Each work has exactly one.

| Category | Includes | Light class |
| --- | --- | --- |
| Paintings | Oil, acrylic (including acrylic pours), tempera, gouache on board or canvas | Moderate |
| Prints | Engravings, etchings, lithographs, screenprints and other printmaking | High |
| Photography | Photographic prints of any process | High |
| Numismatics | Coins, tokens, medals; paper money is light class high | Low |
| Fossils & geology | Fossils, minerals, rocks; some minerals are light sensitive | Assess each |
| Textiles | Embroidery, cross-stitch, weaving and other needlework | High |
| Other | Anything else | Assess each |

Light classes set the maximum illuminance on the work; see [Lighting](./lighting.md).
Watercolours and drawings go in Other until enough exist to justify a
Works on paper category; their light class is high.

## Fields

| Field | Rule |
| --- | --- |
| `title` | As the artist titled it. A descriptive title for an untitled work goes in square brackets: `[Harbour at dusk]`. |
| `series` | Series name, if any, without the word "series" |
| `artist.name` | As the artist signed or is known. "Artist unknown" when unknown. |
| `artist.nationality`, `artist.dates` | `Canadian`; `1921–2009`, `born 1985` |
| `date` | Display date: `1974`, `c. 1960s–80s`, `Undated` |
| `medium` | Materials and technique, support last: `Oil on canvas board` |
| `dimensions` | Height × width (× depth), as measured, in `in` or `cm`; `note` for "framed" or "sight size" |
| `credit_line` | How the acquisition is acknowledged: `Gift of …`, `Purchase`, `Bequest of …` |
| `acquisition` | Method, source and year |
| `provenance` | Ownership history, earliest first, as far as known |
| `location` | Wall (`north`, `east`, `south`, `west`), distance along it in feet, and whether that position is confirmed |
| `image`, `image_alt` | Photograph file and a plain description of what it shows |
| `label` | Placard text, 50 words or fewer |
| `description`, `artist_bio` | Longer text for the website |
| `audio` | Stop number, audio file, narrator and transcript |

## Dimensions

Measure the work itself (height, then width, then depth for objects) and note
when a measurement is of the frame ("framed") or of the visible area inside a
mat ("sight size"). Labels give centimetres to one decimal place, then inches
to the nearest eighth: `40.6 × 50.8 cm (16 × 20 in.)`.

## Photography

- Photograph flat works straight on, filling the frame, under even light with
  no glare; include the frame only when it is part of the work.
- Name the file after the slug: `sailboats.jpg`. Keep the longest side at
  about 1,600 px for the site; keep the full-resolution original separately.
- Write `image_alt` as a description of what is visible, not an interpretation.
