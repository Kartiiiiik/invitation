// Sections 6–10: one full-screen section per entry in invite.events.
// Builds the shared details (plain typography on the artwork); each event id then gets its own entrance + interaction.
import { invite } from '../invite.config.js';
import { formatDate, sortEvents } from '../lib/calendar.js';
import { $, placeZones, placeHotspots, artSrc, ART_SIZES } from '../lib/utils.js';
import { initBhajan } from './bhajan.js';
import { initMehendi } from './mehendi.js';
import { initCarnival } from './carnival.js';
import { initSangeet } from './sangeet.js';
import { initWedding } from './wedding.js';
import { initNanihal } from './nanihal.js';

// Per-background layout facts from ASSET_NOTES.md: size, text-safe zone, alt text.
// zone = "left top right bottom" in % of the artwork. To move an event's text up or down,
// change the 2nd and 4th numbers (e.g. '17 19 83 42' → '17 16 83 39' moves it up a little).
const ART = {
  'bhajan-sandhya-invite': { w: 900, h: 1600, zone: '14 18 86 58',
    alt: 'A pastel temple arch with lotuses and a line-drawn Ganesh at its peak; below, Khatu Shyam ji, garlanded in marigolds, stands between two white cows and green trees.' },
  mehendi: { w: 720, h: 1280, zone: '17 19 83 42',
    alt: 'Illustrated mehendi setting: the couple on a flower-covered swing under pink and yellow umbrellas, the bride in green showing her henna-painted hands.' },
  carnival: { w: 575, h: 1029, zone: '4 14 96 40',
    alt: 'Pink carnival stage with hanging diamond lights, a white floral arch and flamingos; the couple poses in bright, colourful outfits and sunglasses.' },
  sangeet: { w: 720, h: 1280, zone: '12 23 88 48',
    alt: 'Night-time sangeet stage: woven lanterns and fairy lights over a dark velvet backdrop, the couple dancing on a chequered floor in front of pastel fan panels.' },
  'nanihal-ki-mithaas': { w: 720, h: 1280, zone: '30 20 94 51',
    alt: 'Sunset by the sea under hanging brass bells and pink flower strings: the bride in an orange lehenga lovingly feeds sweets to the groom, with a smiling family elder in a green jacket beside them.' },
  wedding: { w: 720, h: 1280, zone: '17 15 83 56',
    alt: 'A carved palace arch strung with fairy lights over a glowing evening sky; the groom in an ivory sherwani and red safa stands beside the bride in a red lehenga, with a peacock, palms and diyas around them.' },
};

const INIT = { bhajan: initBhajan, mehendi: initMehendi, carnival: initCarnival, sangeet: initSangeet, nanihal: initNanihal, wedding: initWedding };

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DIVIDER = `
  <svg class="ecard__divider" viewBox="0 0 220 16" aria-hidden="true">
    <path d="M4 8H86M134 8H216" />
    <path d="M110 1.5l6.5 6.5-6.5 6.5-6.5-6.5z" class="gem" />
    <circle cx="94" cy="8" r="2" /><circle cx="126" cy="8" r="2" />
  </svg>`;

export function renderEvents({ petals }) {
  const mount = $('#events');
  sortEvents(invite.events).forEach((ev) => {
    const art = ART[ev.bg] || ART.wedding;
    const img = artSrc(ev.bg);
    const section = document.createElement('section');
    section.className = `scene scene--event scene--${ev.id}`;
    section.id = ev.id;
    section.dataset.bg = ev.bg;
    section.style.setProperty('--blur', `url(/assets/img/${ev.bg}-blur.webp)`);
    section.setAttribute('aria-labelledby', `${ev.id}-title`);
    section.innerHTML = `
      <img class="scene__bg art art--full" src="${img.src}" ${img.srcset ? `srcset="${img.srcset}" sizes="${ART_SIZES}"` : ''} loading="lazy" decoding="async" width="${art.w}" height="${art.h}" alt="${esc(art.alt)}" />
      <div class="scene__fx" aria-hidden="true"></div>
      <div class="zone" data-zone="${art.zone}">
        <div class="zone__inner"><article class="ecard ecard--${esc(ev.id)}">
          <h2 class="ecard__title" id="${esc(ev.id)}-title">${esc(ev.title)}</h2>
          ${DIVIDER}
          <div class="ecard__slot"></div>
          <div class="ecard__details">
            <p class="meta meta--date"><span class="sr-only">Date: </span><span class="meta__v">${esc(formatDate(ev.date))}</span></p>
            <p class="meta meta--time"><span class="sr-only">Time: </span><span class="meta__v">${esc(ev.time)}</span></p>
            ${ev.venue?.trim() ? `<p class="meta meta--venue"><span class="sr-only">Venue: </span><span class="meta__v">${esc(ev.venue)}</span></p>` : ''}
          </div>
        </article></div>
      </div>`;
    mount.append(section);

    INIT[ev.id]?.(section, ev, { petals });
    placeZones(section);
    placeHotspots(section);
  });
}
