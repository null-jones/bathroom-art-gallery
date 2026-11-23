# Collection records

Every work in the collection is one YAML file in `objects/`. The website and the
placard generator both read these files, so a work is catalogued once.

The full field reference, the accession-number scheme and the category list are
in the standards on the website (`website/docs/standards/cataloguing.md`).

## Adding a work

1. Copy `objects/_template.yaml` to `objects/<slug>.yaml`. The slug becomes the
   web address (`/collection/<slug>`), so keep it short and never change it once
   a placard with a QR code has been printed.
2. Fill in what you know. Leave unknown values as `null`; never guess.
3. Put the photograph in `website/static/img/collection/` and name it in `image`.
4. Assign an accession number (`YYYY.N.N`) when the work formally enters the
   collection.
5. Print the placard: `python placards/make_placards.py <slug>`.

Files in this folder:

| File | Contents |
| --- | --- |
| `site.yaml` | Public site address, used for QR codes |
| `categories.yaml` | Collection categories and their light-sensitivity class |
| `gallery.yaml` | Gallery dimensions and walls, used by the gallery map |
| `objects/*.yaml` | One record per work |
| `exhibitions/*.yaml` | Temporary exhibitions |
