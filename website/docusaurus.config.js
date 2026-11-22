// @ts-check
// Site configuration for The J&W Collection.
// The public address comes from ../collection/site.yaml, which the placard
// generator also reads for its QR codes.

import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';

const site = /** @type {{url: string, base_url: string}} */ (
  yaml.load(fs.readFileSync(fileURLToPath(new URL('../collection/site.yaml', import.meta.url)), 'utf8'))
);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'The J&W Collection',
  tagline: 'The Jones & Wilson Collection',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: site.url,
  baseUrl: site.base_url,
  organizationName: 'null-jones',
  projectName: 'bathroom-art-gallery',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en-CA',
    locales: ['en-CA'],
  },

  plugins: ['./plugins/collection.js'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: 'standards',
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'The Jones & Wilson Collection',
        logo: {
          alt: 'The J&W Collection',
          src: 'img/jw-compact-paper.svg',
        },
        items: [
          {to: '/#visit', label: 'Visit', position: 'right', activeBaseRegex: '^/#'},
          {to: '/collection', label: 'Collection', position: 'right'},
          {to: '/#map', label: 'Gallery map', position: 'right', activeBaseRegex: '^/#'},
          {to: '/#exhibitions', label: 'Exhibitions', position: 'right', activeBaseRegex: '^/#'},
          {to: '/standards', label: 'Standards', position: 'right'},
        ],
      },
      footer: {
        logo: {
          alt: 'The J&W Collection',
          src: 'img/jw-lockup-wall.svg',
          height: 140,
        },
        links: [
          {
            title: 'The collection',
            items: [
              {label: 'Collection', to: '/collection'},
              {label: 'Gallery map', to: '/#map'},
              {label: 'Exhibitions', to: '/#exhibitions'},
            ],
          },
          {
            title: 'About',
            items: [
              {label: 'Plan your visit', to: '/#visit'},
              {label: 'Collection standards', to: '/standards'},
              {label: 'Source on GitHub', href: 'https://github.com/null-jones/bathroom-art-gallery'},
            ],
          },
        ],
        copyright: 'The Jones & Wilson Collection',
      },
    }),
};

export default config;
