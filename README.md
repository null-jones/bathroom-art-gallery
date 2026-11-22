<p align="center"><img src="brand/wordmark/jw-lockup-paper.svg" alt="The J&W Collection" width="220"></p>

# The J&W Collection

The Jones & Wilson Collection is a private collection of art and objects,
catalogued and displayed to museum standards in a single small gallery (a
washroom). This repository holds the collection's catalogue, its website, its
placard generator and its standards.

| Folder | Contents |
| --- | --- |
| `collection/` | The catalogue: one YAML record per work, plus categories, exhibitions and the gallery plan |
| `website/` | The public website (Docusaurus): home page, collection, object pages, gallery map, standards |
| `placards/` | `make_placards.py`: print-ready gallery labels with QR codes, generated from the catalogue |
| `brand/` | Wordmark, fonts and design tokens |

The standards for cataloguing, placards, hanging and lighting are published on
the site under **Standards** (source: `website/docs/`).

## Working on it

Website (Node 20 or later):

```bash
cd website
npm install
npm start          # local preview at http://localhost:3000/bathroom-art-gallery/
npm run build      # production build in website/build
```

Placards and wordmark (Python 3.10 or later):

```bash
pip install -r requirements.txt
python placards/make_placards.py            # placards for every work on view
python brand/wordmark/build_wordmark.py     # rebuild the wordmark SVGs
```

To add a work, see `collection/README.md`.

## Deployment

Every push to `main` builds the site and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). Pull requests run the same checks without
deploying. In the repository settings, Pages must be set to deploy from
**GitHub Actions**.

## Licences

Fonts: EB Garamond and Libre Caslon Display, SIL Open Font License 1.1
(`brand/fonts/`). Photographs of works in the collection are not licensed for
reuse.
