// ─────────────────────────────────────────────────────────────────────────────
//  ALL invitation text lives here. Edit freely; layout code never needs touching.
//  Anything in [SQUARE BRACKETS] is a placeholder that still needs real info.
// ─────────────────────────────────────────────────────────────────────────────

export const invite = {
  // Names below were read off the artwork (Ganesh easel + location card). Please confirm spelling.
  // Under the couple's names, each family is shown as: label → grandparents → parents.
  // \n starts a new line.
  bride: {
    name: "Neha",
    grandparentsLabel: "Granddaughter of",
    grandparents: "Lt. Shri Nathmal Ji Soni\nand Bhauri Devi Soni",
    parents: "D/o Vikram Ji Soni\nand Suman Devi Soni",
  },
  groom: {
    name: "Kartik",
    grandparentsLabel: "Grandson of",
    grandparents: "Lt. Shri Kishan Lal Ji Soni\nand Sampat Devi Soni",
    parents: "S/o Suresh Ji Soni\nand Chanda Devi Soni",
  },
  // Which name is shown first everywhere. The artwork reads "Kartik & Neha".
  namesOrder: ["groom", "bride"],
  initials: "K&N",
  // Gatefold "two doors + wax seal" intro before the Ganesh card.
  // To use your own door art, add public/assets/door-left.webp and door-right.webp.
  showGatefold: true,
  hashtag: "#dillNEhaaKAha",

  weddingDate: "2026-12-02T[HH:MM]:00+05:30", // countdown target: 2 December 2026, IST

  familyMessage:
    "With the blessings of Lord Ganesha, we joyfully invite you to celebrate the wedding of our children",

  rsvpWhatsApp: "[91XXXXXXXXXX]", // digits only, with country code (RSVP form is currently switched off)

  // Background music (starts when the guest taps "Open"). Missing file = silently skipped.
  music: "assets/audio/background-music.mp3",
  // Short sound effects. Missing files fall back to a synthesised sound.
  sfx: {
    bell: "assets/audio/temple-bell.mp3",
    crack: "assets/audio/wax-crack.mp3",
    dhol: "assets/audio/dhol-loop.mp3", // loops while the Sangeet is on screen (synthesised beat if missing)
  },

  // Public URL once deployed; used for the WhatsApp/OG link preview image.
  siteUrl: "[https://your-site.vercel.app]",

  venue: {
    name: "Oswal Panchayat",
    address: "Chhapar",
    mapsUrl: "[GOOGLE MAPS LINK]",
    note: "December evenings are cool — carry a shawl",
  },

  // Sections are shown sorted by date + time automatically (order here doesn't matter).
  // An event without a date yet is placed just before the next dated event listed after it.
  // Dates: use YYYY-MM-DD. Times: "7:30 PM", "1:15 P.M. Onwards" or "19:30" (IST).
  // Leave `venue` empty to hide the venue line for that event.
  // Leave `mapsUrl` empty to use the main venue's map link.
  // dressCode / swatches are kept for later but not shown right now.
  events: [
    { id: "bhajan",   title: "Bhajan Sandhya", date: "2026-11-30", time: "5:00 P.M. Onwards", venue: "", mapsUrl: "", dressCode: "[e.g. Pastels / white]", bg: "bhajan-sandhya-invite",
      swatches: ["#fffaf0", "#f6d7e0", "#f3e3b5"] },
    { id: "mehendi",  title: "Mehfil-e-Mehendi", date: "2026-11-30", time: "1:15 P.M. Onwards", venue: "", mapsUrl: "", dressCode: "[Greens & yellows]",    bg: "mehendi",
      swatches: ["#4f7a3a", "#9cc24a", "#f2c230"] },
    { id: "carnival", title: "Carnival Fiesta", date: "2026-12-01", time: "10:15 A.M. Onwards", venue: "", mapsUrl: "", dressCode: "[Fun & colourful]",     bg: "carnival",
      swatches: ["#e8457c", "#35b6d6", "#f7d23e", "#8a5cf0"] },
    { id: "sangeet",  title: "Sangeet Night", date: "2026-12-01", time: "7:15 P.M. Onwards", venue: "", mapsUrl: "", dressCode: "[Glam / black & gold]", bg: "sangeet",
      swatches: ["#141414", "#c9973b", "#f1d58a"] },
    { id: "nanihal",  title: "Nanihal Ki Mithaas", date: "2026-12-02", time: "10:15 A.M.", venue: "", mapsUrl: "", dressCode: "", bg: "nanihal-ki-mithaas" },
    { id: "wedding",  title: "Wedding",        date: "2026-12-02", time: "[TIME]", venue: "Oswal Panchayat, Chhapar", mapsUrl: "", dressCode: "[Traditional]",   bg: "wedding",
      swatches: ["#7a1424", "#c9973b", "#f7eedd"] },
  ],

  // Headings and small copy used around the site.
  copy: {
    countdownTitle: "Counting down to forever",
    countdownToday: "Today's the day! 🎉",
    countdownAfter: "Thank you for celebrating with us ❤️",
    sangeetMarquee: "Dance floor opens at {time}",
    finaleMessage: "We can't wait to celebrate with you",
  },
};

// Helpers so templates don't repeat the ordering logic.
export const coupleNames = () => invite.namesOrder.map((k) => invite[k].name);
export const isPlaceholder = (v) => typeof v !== "string" || v.trim() === "" || /\[.*\]/.test(v);
