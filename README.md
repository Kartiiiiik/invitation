# Kartik & Neha: Wedding Invitation

A mobile-first animated invitation site. It's static and needs no backend, so it can be hosted on Vercel or Netlify.

Page flow: gatefold doors with wax seal (the only button) → Ganesh card (swipe up) → invitation →
scratch-to-reveal date → countdown → venue → Bhajan Sandhya → Mehendi → Carnival → Sangeet →
Wedding → closing monogram.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (also shown on your LAN IP, so you can open it on a phone)
npm run build      # production build in dist/
npm run preview    # serve the built site
```

## Edit the text: `src/invite.config.js`

All names, dates, times, venues, dress codes and the WhatsApp number are in this one file.
Anything still in `[SQUARE BRACKETS]` is a placeholder.

- `namesOrder`: which name comes first (`["groom", "bride"]` matches the artwork).
- `weddingDate`: replace `[HH:MM]` with the ceremony time in 24h IST, e.g. `2026-12-02T19:30:00+05:30`.
- `showGatefold`: `true` shows the two-door wax-seal intro. With `false`, the Ganesh card gets its own "Tap to open" button instead.
- `initials`: the monogram pressed into the wax seal and shown on the closing screen.
- `rsvpWhatsApp`: kept for later; the RSVP form is switched off for now.
- `events[].date`: use `YYYY-MM-DD` (e.g. `2026-11-30`). It's shown as "Monday, 30 November 2026".
- `events[].time`: free text, e.g. `7:30 PM onwards`.
- `events[].swatches`: the colour dots next to the dress code (any CSS colours).
- `copy`: headings and fun-interaction text (diya prompt, mehendi hunt message, marquee, etc.).
  `{time}` in `sangeetMarquee` is replaced with the Sangeet time.
- `siteUrl`: your final URL. It makes the WhatsApp link-preview image work. Rebuild after changing it.

## Add music

Put files in `public/assets/audio/`:

| File | Used for |
|---|---|
| `background-music.mp3` | loops for the whole visit; starts silently on the seal tap and fades in after the Ganesh card |
| `wax-crack.mp3` | the seal cracking (synthesised if missing) |
| `temple-bell.mp3` | when the Ganesh card parts (synthesised if missing) |
| `dhol-loop.mp3` | loops while the Sangeet screen is on (a synthesised dhol beat plays if missing) |

All are optional. If the music is missing, the site stays silent and the music toggle is hidden.

## Custom door artwork

The gatefold draws its gold vines as SVG. To use painted doors instead, add
`public/assets/door-left.webp` and `public/assets/door-right.webp` (tall portraits, about 540×1920). They replace the vines automatically.

## Personalised links

Add `?to=` with the family's name (spaces become `%20`):

```
https://your-site.vercel.app/?to=Sharma%20Family
https://your-site.vercel.app/?to=Mehta%20Ji%20%26%20Family     (& is %26)
```

Without it the greeting reads "Dear Family & Friends". The name is shown as plain text only.

## Replacing artwork

Put new originals in `assets/original/` with kebab-case names, then run `npm run images`.
It regenerates, in `public/assets/img/`:
- `NAME-480.webp` for 1x phones and slow connections or Data Saver,
- `NAME.webp` (800px) for sharp 2x screens,
- `NAME-blur.webp`, a tiny pre-blurred placeholder,
- the 1200×630 `og-image.jpg`.

Each phone downloads only one size (about 420 KB for all backgrounds on 1x/slow, 730 KB on 2x).
Backgrounds below the first screen load lazily, one section ahead of the guest. Text-safe zones for each background are documented in `ASSET_NOTES.md`.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On vercel.com: **Add New → Project**, import the repo. Vercel detects Vite
   (build `npm run build`, output `dist`).
3. Set `siteUrl` in the config to the URL Vercel gives you, commit, and push again.

Netlify works the same way: build command `npm run build`, publish directory `dist`.

WhatsApp caches link previews. If you change the preview later, test with a fresh link such as `/?v=2`.
