# Asset notes — safe text zones

Originals live in `assets/original/` (kebab-case, untouched). Optimised copies are in
`public/assets/img/` (WebP, ≤1080 px wide, q80) plus a 40 px `*-blur.webp` used for the
desktop side-fill. Regenerate with `npm run images`.

Percentages are of the image's own width/height. The illustrated backgrounds use
`object-fit: contain` (`.art--full`), so the whole picture is always visible. Any space left on
screens of a different shape is filled with a blurred copy of the same art. Only the landscape
`hands` photo uses `cover`. Text zones are mapped from these image percentages at runtime, so they
stay on the artwork on any screen. (The "Position" lines below are from the earlier cover layout.)

| File | Source px | Orientation |
|---|---|---|
| ganesh-opening | 900×1600 | portrait 9:16 |
| first-invite-background | 728×1280 | portrait 9:16 |
| hands | 1280×853 | **landscape 3:2** |
| location | 959×1600 | portrait ~3:5 |
| bhajan-sandhya-invite | 900×1600 | portrait 9:16 |
| mehendi | 720×1280 | portrait 9:16 |
| carnival | 575×1029 | portrait ~9:16 |
| sangeet | 720×1280 | portrait 9:16 |
| nanihal-ki-mithaas | 720×1280 | portrait 9:16 |
| wedding | 720×1280 | portrait 9:16 |

---

### ganesh-opening — Opening gate
- **Artwork:** Ganesh (left 0–60%, y 25–100%) painting an easel canvas (right 40–100%, y 17–63%)
  that **already reads "KN" + "Kartik & Neha"**. Diya top-left (y 17–28%). Marigold rangoli on
  the right edge (y 15–35%, 80–100%). Background is a busy grey/cream triangle tile.
- **Safe zones:** only the **top ~15%** (tile pattern, no figures) and a narrow strip at the
  **very bottom-centre (y 88–97%, x 35–70%)** between Ganesh's foot and the rangoli.
- **Use:** Devanagari blessing in the top band on a soft dark pill for contrast. "Tap to open"
  button in the bottom strip. Never cover the face, trunk, easel monogram or the painted names.
- **Position:** `center 40%`.

### first-invite-background — The invitation
- **Artwork:** carved white marble arch frame, gold floral sprays on both sides, pink lotuses
  along the bottom (y 85–100%).
- **Safe zones:** the large glowing arch interior, **x 18–82%, y 18–82%** is almost blank cream.
  This is the easiest background on the site.
- **Use:** greeting, family message, calligraphic names, parents. Dark maroon/henna text on the
  light cream, no card needed (light text-shadow only).
- **Position:** `center center`.

### hands — Scratch to reveal
- **Artwork:** photograph of two clasped hands, soft-focus palace behind. The clasp (overlapping
  fingers + gold ring) sits at **x 38–67%, y 33–80%**. Top band (y 0–25%) and bottom band
  (y 80–100%) are blurred and plain.
- **Portrait crop:** on a 390×844 phone, `cover` shows roughly a 30% wide vertical slice. Centre
  that slice on the clasp: `object-position: 52% center`. Ken Burns zooms 1.0 → 1.12 around the
  same point so the hands stay in frame.
- **Safe zones:** top 25% (headline) and bottom 20% (fallback button / "Save the Date").
  Scratch cards sit in the middle over the hands on a translucent dark backing. They are the
  reveal moment, so covering the hands until they're scratched away is fine.

### location — Venue
- **Artwork:** **already has baked text**: "#dillNEhaaKAha" + heart divider (y 13–22%),
  "Nepal" (right, y 38–45%), "Rajasthan" (right, y 66–73%). Watercolour vignettes: Nepal stupa
  (x 5–62%, y 26–50%), Rajasthan fort + camel (x 30–95%, y 74–95%). A dashed flight path runs
  from a pin at (30%, 49%) to a pin at (53%, 74%). Foliage in the top-right and bottom-left corners.
- **Safe zones:** the **middle band y 52–65%** across the full width. The dashed line crosses it
  at x 37–45%, which is fine to sit over lightly.
- **Use:** the map-pin drop lands on the existing Rajasthan pin (53%, 74%). Venue name, address and
  the Maps button go in a translucent cream card in the y 52–65% band. Don't repeat the hashtag
  here, since it's already painted in.
- **Position:** `center center`.

### bhajan-sandhya-invite — Bhajan Sandhya
- **Artwork:** Ganesh line-art at the arch apex (x 42–54%, y 0–15%). Lotuses in the top corners.
  Faint mandala centred at y 25–65%. **Deity (Khatu Shyam ji) with cows, trees and domes fills
  y 62–100%.**
- **Safe zones:** inside the arch **x 15–85%, y 17–58%**, over the faint mandala. Plain cream/beige.
- **Use:** tap-to-light diyas and the info card in this zone. **Never place anything over y > 62%**
  (the deity).
- **Position:** `center top` (keeps the deity whole at the bottom on tall phones).

### mehendi — Mehendi
- **Artwork:** pink/yellow canopy (y 0–5%), trees on both edges, small floral ornament
  (y 13–18%), leaf ornament (y 43–45%). **Couple on a swing (y 55–100%)**, umbrellas y 48–62%.
- **Safe zones:** sky between the ornaments, **x 15–85%, y 18–43%**. Light blue/white.
- **Use:** henna-drawn title and details in henna brown. The hidden groom initial "K" sits on the
  henna of the bride's outstretched forearm at around (78%, 64.3%), away from the faces
  (`HIDE_AT` in `src/sections/mehendi.js`).
- **Position:** `center top`.

### carnival — Carnival
- **Artwork:** hanging pink diamond lights (y 0–20%). **Couple (x 32–72%, y 53–86%)** with a
  floral arch behind (y 45–58%), flamingos at both edges, a pool strip at the bottom (y 90–100%).
- **Safe zones:** white/lilac sky **x 8–92%, y 20–44%**.
- **Use:** ticket card in that sky band. Balloons rise from the bottom and may float over
  everything briefly, since they're tappable and transient.
- **Position:** `center top`.

### sangeet — Sangeet
- **Artwork:** wicker lanterns + fairy lights (y 0–28% and down both edges to y 55%).
  **Dark teal/navy velvet backdrop x 12–88%, y 22–48%.** Big pastel shell/fan panels y 48–72%,
  dancing couple y 58–92%, chequered floor below.
- **Safe zones:** the dark velvet, **x 14–86%, y 24–48%**. Use **light/gold text**, the only dark
  background on the site.
- **Use:** disco-light sweep, dhol card, marquee ticker at the very bottom (y 94–100% is floor
  only, fine to overlay).
- **Position:** `center top`.

### nanihal-ki-mithaas — Nanihal Ki Mithaas
- **Artwork:** hanging brass bells and pink flower strings across the top (y 0–19%), bamboo up the
  left side (x 0–28%, y 0–50%). **Family elder, groom and bride (x 25–100%, y 52–100%)**, with a
  mandap pillar and garlands at the bottom-left and the sea on the right.
- **Safe zones:** the peach sunset sky **x 30–94%, y 20–51%**.
- **Use:** title, date and time in warm vermilion-brown (`#9c2f14`), matching the bride's lehenga.

### wedding — Wedding
- **Artwork:** carved arch with fairy lights (frame). Glowing gradient sky inside the arch,
  **teal at the top fading to cream**. Palms and peacock on the sides. **Couple
  (x 27–75%, y 60–100%).** Small AI "sparkle" watermark at the bottom-right corner (≈ 93%, 97%),
  worth editing out of the original if you have a clean copy.
- **Safe zones:** inside the arch **x 15–85%, y 12–58%**. Top half is darker teal (light text),
  lower half is cream (dark text), so the card uses a translucent backing to work on both.
- **Use:** mandap glow, names + varmala garland, saat-phere dots, event card, RSVP entry point.
- **Position:** `center top`.

---

### Palette sampled from the artwork
| Token | Hex | From |
|---|---|---|
| `--gold` | `#c9973b` | Ganesh's crown, wedding lights |
| `--gold-light` | `#f1d58a` | diya flame, fairy lights |
| `--maroon` | `#7a1424` | wedding lehenga, Ganesh's dupatta |
| `--vermilion` | `#c8242f` | Ganesh's dhoti trim |
| `--marigold` | `#f2a516` | rangoli, mehendi flowers |
| `--cream` | `#f7eedd` | invitation arch, bhajan backdrop |
| `--henna` | `#6b3a1f` | mehendi hands, location script |
| `--rose` | `#e48aa6` | lotuses |
| `--teal-night` | `#0f2b33` | sangeet velvet, wedding sky |
| `--leaf` | `#4f7a3a` | foliage |
