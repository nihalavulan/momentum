# Momentum — logo usage

**The mark:** Rising M. An M whose right peak climbs higher than the left — each day
builds on the last — with a checkmark hidden in the stroke from the valley to the top.
Monoline, round ends and joins, angles exactly 45° and 60°.

## Files (`design/logo/final/`)

| File | Use |
|---|---|
| `momentum-symbol.svg` | Master symbol, orange on light backgrounds |
| `momentum-symbol-small.svg` | Heavier cut for **32 px and below** (favicon, tab icons) |
| `momentum-symbol-reversed.svg` | White, thinned 5% — on orange or dark backgrounds |
| `momentum-app-icon.svg` | App icon: white M on a full-bleed orange tile (the OS rounds the corners) |
| `momentum-horizontal.svg` / `-reversed.svg` | Symbol + wordmark side by side (headers, web) |
| `momentum-stacked.svg` | Symbol above wordmark (square spaces, splash) |
| `momentum-wordmark.svg` | Wordmark alone |
| `exports/` | Black, white and orange one-colour versions, favicon.ico, PNG icon set, webmanifest |

## Colour

| Role | HEX | RGB | Notes |
|---|---|---|---|
| Primary (Momentum Orange) | `#FF5A1F` | 255 90 31 | The mark, app-icon tile |
| Ink | `#1A1A1A` | 26 26 26 | Wordmark on light |
| Paper | `#FFFFFF` | 255 255 255 | Mark on orange / dark |

In the app, colours come from `src/config/brand.ts` only. White on orange is about
3:1 contrast — fine for the logo and large shapes, too low for small body text.

## Approved combinations
- Orange symbol + ink wordmark on white or light grey.
- White symbol + white wordmark on orange or near-black.
- All black, or all white, when only one colour is available.

## Clear space and minimum size
- **Clear space:** keep a margin of at least **half the symbol's height** on every side.
- **Symbol:** min **16 px**; use the small cut at 32 px and below.
- **Horizontal lockup:** min **96 px** wide. Below that, use the symbol alone.

## Don't
- Don't level the two peaks, flip the M, or tilt it — the rising right peak *is* the idea.
- Don't change the stroke weight, cap shape or angles; don't outline or add effects/gradients/shadows.
- Don't recolour outside the palette or put the orange mark on orange-ish or busy photos.
- Don't retype the wordmark in a font — use the drawn artwork.
- Don't stretch, squash or rearrange the lockups.

## Notes and open items
- The wordmark is drawn letter by letter (no font licence needed). If the working name
  changes, the **symbol** stays only if the new name still starts with M; the wordmark
  must be redrawn. Inside the app, the name stays live text from `brand.appName`.
- Masters use strokes (round caps/joins). Expand them to outlines in a vector editor
  before print or vinyl cutting.
- No trademark search has been done. Run one (e.g. USPTO / EUIPO / WIPO and a reverse
  image search) before any public launch.
