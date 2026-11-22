---
slug: /
title: Collection standards
sidebar_position: 1
---

# Collection standards

How The Jones & Wilson Collection is named, catalogued, labelled, hung and lit.
The aim is to follow real museum practice wherever a small private gallery
reasonably can, and to note plainly where it departs from it.

| Standard | Covers |
| --- | --- |
| [Brand](./brand.mdx) | Name, wordmark, colours, type, house style |
| [Cataloguing](./cataloguing.md) | Accession numbers, records, categories, dimensions, credit lines |
| [Placards](./placards.md) | Label content, sizes, type, printing, mounting |
| [Display](./display.md) | Hanging heights, spacing, the gallery itself |
| [Lighting](./lighting.md) | Light limits by material, ultraviolet, daylight, label lighting |

## Where the standards live in the repository

| Path | What it is |
| --- | --- |
| `collection/` | One YAML record per work; the single source for the website and placards |
| `brand/tokens.json` | Colour, type and wordmark values |
| `brand/wordmark/` | Wordmark SVGs and the script that builds them from the fonts |
| `brand/fonts/` | EB Garamond and Libre Caslon Display (SIL Open Font License) |
| `placards/make_placards.py` | Placard generator |
| `website/` | This site (Docusaurus) |

## Quick reference

- **Accession number:** `YYYY.N.N` (year acquired . acquisition that year . part).
- **Wall colour:** Deep oxblood `#4A171C`. **Accent:** Deep aubergine `#2C1A27`, graphic only.
- **Type:** Libre Caslon Display for the wordmark and website headings; EB Garamond for everything else.
- **Placard:** 6 × 4 in landscape; 5 × 3 in and 3.5 × 2 in where space is tight.
- **Hanging height:** centre of the work at 57 in (145 cm) from the floor.
- **Light:** textiles, prints, photographs and works on paper 50 lux maximum; paintings 200 lux maximum.
