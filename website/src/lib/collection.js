// Helpers shared by the collection pages. Formatting here matches the placard
// generator (placards/make_placards.py) so labels and web records agree.

import {usePluginData} from '@docusaurus/useGlobalData';

export function useCollection() {
  return usePluginData('jw-collection');
}

export const WALL_LABEL = {
  north: 'North wall',
  east: 'East wall',
  south: 'South wall',
  west: 'West wall',
};

/** Inches to the nearest eighth: "16", "7 1/2", "3/8". */
export function fmtInches(value) {
  const eighths = Math.round(value * 8);
  const whole = Math.floor(eighths / 8);
  let num = eighths % 8;
  if (!num) return String(whole);
  let den = 8;
  while (num % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  return whole ? `${whole} ${num}/${den}` : `${num}/${den}`;
}

/** "40.6 × 50.8 cm (16 × 20 in.)": height × width (× depth), centimetres first. */
export function fmtDimensions(dim) {
  if (!dim || dim.height == null || dim.width == null) return null;
  const values = [dim.height, dim.width, ...(dim.depth ? [dim.depth] : [])];
  const cm = dim.unit === 'cm' ? values : values.map((v) => v * 2.54);
  const inches = dim.unit === 'cm' ? values.map((v) => v / 2.54) : values;
  let text = `${cm.map((v) => v.toFixed(1)).join(' × ')} cm (${inches.map(fmtInches).join(' × ')} in.)`;
  if (dim.note) text += `, ${dim.note.toLowerCase()}`;
  return text;
}

export function paragraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export function categoryLabel(categories, key) {
  return categories.find((c) => c.key === key)?.label ?? null;
}

export function artistLine(artist) {
  if (!artist) return null;
  return [artist.nationality, artist.dates].filter(Boolean).join(', ') || null;
}

export function displayTitle(object) {
  return object.title || 'Untitled';
}
