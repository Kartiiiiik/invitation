// Date/time parsing (IST) + "Add to calendar" helpers: .ics download and Google Calendar link.
import { coupleNames, isPlaceholder } from '../invite.config.js';

const IST_OFFSET_MIN = 330;
const DEFAULT_HOURS = 3;

export function parseDate(str) {
  const m = !isPlaceholder(str) && /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

export function parseTime(str) {
  if (isPlaceholder(str)) return null;
  const m = /(\d{1,2})(?:[:.](\d{2}))?\s*(?:([ap])\.?\s*m\b\.?)?/i.exec(str);
  if (!m) return null;
  let h = +m[1];
  const min = +(m[2] || 0);
  const ap = m[3]?.toLowerCase(); // "a" / "p" from AM, a.m., P.M. …
  if (ap === 'p' && h < 12) h += 12;
  if (ap === 'a' && h === 12) h = 0;
  return h < 24 && min < 60 ? { h, min } : null;
}

/**
 * Returns events sorted by date + time. An event without a date yet is placed just before
 * the next dated event listed after it in the config (or at the end if there is none).
 */
export function sortEvents(events) {
  let nextKey = Infinity;
  const keyed = [];
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    const d = parseDate(ev.date);
    const t = parseTime(ev.time) || { h: 23, min: 59 }; // no time yet → end of that day
    if (d) nextKey = Date.UTC(d.y, d.m - 1, d.d, t.h, t.min);
    keyed.push({ ev, key: d ? nextKey : nextKey - 1, i });
  }
  return keyed.sort((a, b) => a.key - b.key || a.i - b.i).map((x) => x.ev);
}

/** "2 December 2026", or the raw string if it isn't an ISO date. */
export function formatDate(str) {
  const d = parseDate(str);
  if (!d) return str;
  return new Date(Date.UTC(d.y, d.m - 1, d.d, 12)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

/** Start/end as UTC Dates, or null if the date isn't set yet. `allDay` when no time. */
export function eventRange(ev) {
  const d = parseDate(ev.date);
  if (!d) return null;
  const t = parseTime(ev.time);
  if (!t) return { allDay: true, d };
  const start = new Date(Date.UTC(d.y, d.m - 1, d.d, t.h, t.min) - IST_OFFSET_MIN * 60000);
  const end = new Date(start.getTime() + (ev.durationHours || DEFAULT_HOURS) * 3600000);
  return { allDay: false, start, end, d };
}

const pad = (n) => String(n).padStart(2, '0');
const utcStamp = (dt) =>
  `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
const dateStamp = ({ y, m, d }) => `${y}${pad(m)}${pad(d)}`;
const nextDay = ({ y, m, d }) => {
  const n = new Date(Date.UTC(y, m - 1, d + 1));
  return { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1, d: n.getUTCDate() };
};

function details(ev, venue) {
  const [a, b] = coupleNames();
  return {
    title: `${ev.title} · ${a} & ${b}`,
    location: [ev.venue, venue?.address].filter((v) => !isPlaceholder(v)).join(', '),
    description: isPlaceholder(ev.dressCode) ? `${ev.title} celebrations` : `Dress code: ${ev.dressCode}`,
  };
}

export function googleCalendarUrl(ev, venue) {
  const r = eventRange(ev);
  if (!r) return null;
  const info = details(ev, venue);
  const dates = r.allDay
    ? `${dateStamp(r.d)}/${dateStamp(nextDay(r.d))}`
    : `${utcStamp(r.start)}/${utcStamp(r.end)}`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: info.title, dates, details: info.description, location: info.location, ctz: 'Asia/Kolkata' });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

export function downloadIcs(ev, venue) {
  const r = eventRange(ev);
  if (!r) return false;
  const info = details(ev, venue);
  const when = r.allDay
    ? [`DTSTART;VALUE=DATE:${dateStamp(r.d)}`, `DTEND;VALUE=DATE:${dateStamp(nextDay(r.d))}`]
    : [`DTSTART:${utcStamp(r.start)}`, `DTEND:${utcStamp(r.end)}`];
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invite//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.id}-${dateStamp(r.d)}@wedding-invite`,
    `DTSTAMP:${utcStamp(new Date())}`,
    ...when,
    `SUMMARY:${icsEscape(info.title)}`,
    `DESCRIPTION:${icsEscape(info.description)}`,
    info.location && `LOCATION:${icsEscape(info.location)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(info.title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${ev.id}.ics` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
