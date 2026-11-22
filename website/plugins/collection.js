// Loads the collection records in ../collection and creates a page for each
// work (/collection/<slug>) and each exhibition (/exhibitions/<slug>).
// Everything is also exposed as global data for the home and collection pages:
//   import {usePluginData} from '@docusaurus/useGlobalData';
//   const {objects, categories, gallery, exhibitions} = usePluginData('jw-collection');

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';

const ROOT = fileURLToPath(new URL('../../collection', import.meta.url));
const WALL_ORDER = ['north', 'east', 'south', 'west'];

const load = (file) => yaml.load(fs.readFileSync(file, 'utf8'));

function loadDir(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') && !f.startsWith('_'))
    .sort()
    .map((f) => ({slug: f.replace(/\.yaml$/, ''), ...load(path.join(dir, f))}));
}

// Map numbers run clockwise from the north wall, then along each wall.
function assignMapNumbers(objects) {
  const placed = objects
    .filter((o) => o.location && WALL_ORDER.includes(o.location.wall))
    .sort(
      (a, b) =>
        WALL_ORDER.indexOf(a.location.wall) - WALL_ORDER.indexOf(b.location.wall) ||
        (a.location.along_ft ?? 0) - (b.location.along_ft ?? 0),
    );
  placed.forEach((o, i) => {
    o.map_number = i + 1;
  });
  return objects;
}

export default function collectionPlugin(context) {
  return {
    name: 'jw-collection',

    getPathsToWatch() {
      return [path.join(ROOT, '**/*.yaml')];
    },

    async loadContent() {
      const categories = load(path.join(ROOT, 'categories.yaml'));
      const keys = new Set(categories.map((c) => c.key));
      const objects = assignMapNumbers(loadDir(path.join(ROOT, 'objects')));
      for (const o of objects) {
        if (o.category && !keys.has(o.category)) {
          throw new Error(`collection/objects/${o.slug}.yaml: unknown category "${o.category}"`);
        }
        if (o.accession_number && !/^\d{4}\.\d+\.\d+$/.test(o.accession_number)) {
          throw new Error(`collection/objects/${o.slug}.yaml: accession number must be YYYY.N.N`);
        }
      }
      return {
        site: load(path.join(ROOT, 'site.yaml')),
        gallery: load(path.join(ROOT, 'gallery.yaml')),
        categories,
        objects,
        exhibitions: loadDir(path.join(ROOT, 'exhibitions')),
      };
    },

    async contentLoaded({content, actions}) {
      const {createData, addRoute, setGlobalData} = actions;
      setGlobalData(content);
      const base = context.baseUrl;
      for (const object of content.objects) {
        const data = await createData(`object-${object.slug}.json`, JSON.stringify(object));
        addRoute({
          path: `${base}collection/${object.slug}`,
          component: '@site/src/components/ObjectPage/index.js',
          modules: {object: data},
          exact: true,
        });
      }
      for (const exhibition of content.exhibitions) {
        const data = await createData(`exhibition-${exhibition.slug}.json`, JSON.stringify(exhibition));
        addRoute({
          path: `${base}exhibitions/${exhibition.slug}`,
          component: '@site/src/components/ExhibitionPage/index.js',
          modules: {exhibition: data},
          exact: true,
        });
      }
    },
  };
}
