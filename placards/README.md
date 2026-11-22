# Placards

`make_placards.py` turns the records in `collection/objects/` into print-ready
placards (gallery labels). The layout rules are in the placard standard on the
website (`website/docs/standards/placards.md`).

## Setup

```bash
pip install -r requirements.txt
```

## Printing

```bash
python placards/make_placards.py                    # every work on view, 6 x 4 in
python placards/make_placards.py sailboats radishes # specific works
python placards/make_placards.py --all              # include drafts (proofs)
python placards/make_placards.py sailboats --size compact   # 5 x 3 in
python placards/make_placards.py sailboats --size mini      # 3.5 x 2 in, no text
```

Output goes to `placards/output/` (ignored by git):

- `sheet-<size>.pdf`: US Letter sheets with crop marks. Print at **100% / actual
  size** (not "fit to page") on matte cardstock, then cut along the marks.
- `<slug>-<size>.pdf`: one placard at its exact size, for proofs or a print shop.

Add `--background` to print the paper colour. It uses a lot of ink; on cream
cardstock it is not needed.

Anything missing from a record prints in `[BRACKETS]` and is listed on the
console, so a proof shows what is still to be catalogued. Before printing a
final placard, check that nothing is listed as missing and that the QR code
opens the right page.
