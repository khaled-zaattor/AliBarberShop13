import type { BusinessHours } from "@/lib/api";

// Single source of truth for everything a search engine, an AI answer engine, or
// a customer needs to know about the shop. Before this module the name, address,
// phone and hours were written out by hand in five different files and disagreed
// with each other in three different ways — which is exactly the kind of drift
// that makes an entity look like several businesses instead of one.
//
// NAP rule: these strings must match the Google Business Profile, Booksy, Bing
// Places, Apple Business Connect and every other listing character for
// character. See SEO-OFFSITE-CHECKLIST.md before editing any of them.

const MAPS_URL =
  "https://www.google.com/maps/place/Ali's+Barbershop/@27.8288039,-82.7676914,13z/data=!4m10!1m2!2m1!1sAli's+Barbershop,+4201+62nd+North+Unit+9,+Pinellas+Park,+FL+33781!3m6!1s0x88c2e5e61c59b849:0xd1899ae87c607955!8m2!3d27.8288039!4d-82.6914737!15sCkFBbGkncyBCYXJiZXJzaG9wLCA0MjAxIDYybmQgTm9ydGggVW5pdCA5LCBQaW5lbGxhcyBQYXJrLCBGTCAzMzc4MVpAIj5hbGkncyBiYXJiZXJzaG9wIDQyMDEgNjJuZCBub3J0aCB1bml0IDkgcGluZWxsYXMgcGFyayBmbCAzMzc4MZIBCmhhaXJfc2Fsb26aAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnQzTVZwSFduRlNlazVUVlZaV05sUjZhRTFOYkd4eVRqSnJlVlJzUlJBQuABAPoBBAgAEDE!16s%2Fg%2F11xkrdhb2h?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D";

export const SITE_URL = "https://alisbarbershop.com";

export const BUSINESS = {
  name: "Ali's Barber Shop",
  alternateName: "صالون حلاقة علي",
  url: SITE_URL,

  phone: {
    e164: "+18138959229",
    display: "813-895-9229",
    href: "tel:+18138959229",
  },

  email: "alisbarbershop2026@gmail.com",

  address: {
    // Matches the Google Business Profile exactly. Change both together or the
    // listings disagree again.
    street: "4201 62nd Ave N, Unit 9",
    city: "Pinellas Park",
    region: "FL",
    postalCode: "33781",
    country: "US",
  },

  geo: { lat: 27.8288039, lng: -82.6914737 },

  mapsUrl: MAPS_URL,
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3529.461893485!2d-82.6914737!3d27.8288039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2e5e61c59b849%3A0xd1899ae87c607955!2sAli's%20Barbershop!5e0!3m2!1sen!2sus!4v1716000000000!5m2!1sen!2sus",

  priceRange: "$$",
  currenciesAccepted: "USD",
  languages: ["English", "Arabic"] as const,

  // Pinellas Park is the primary entity-location relationship — the shop is
  // physically there, and distance is one of the three local ranking factors.
  // The rest are genuine secondary service areas, ordered by proximity. Each
  // has a page in src/data/areas.ts (Disston Heights is part of St. Petersburg,
  // so it's covered by that entry here).
  areaServed: [
    "Pinellas Park, FL",
    "Lealman, FL",
    "Kenneth City, FL",
    "St. Petersburg, FL",
    "Seminole, FL",
    "Largo, FL",
  ],

  socials: {
    instagram: "https://www.instagram.com/alisbarbershop2026",
    facebook: "https://www.facebook.com/profile.php?id=61574278858877",
    tiktok: "https://www.tiktok.com/@alis.barber.shop",
  },

  // Deliberately NOT emitted as AggregateRating JSON-LD. Google's structured
  // data policy makes reviews a business collects about itself, on its own site,
  // ineligible for review rich results — marking them up risks a manual action.
  // The reviews stay as visible content; schema waits for a third-party count.
  rating: { value: 5.0, displayedOn: "Google" },
} as const;

/** Street address on one line, the way it should appear everywhere. */
export const addressLine = (): string =>
  `${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.region} ${BUSINESS.address.postalCode}`;

/**
 * Mirrors GET /api/business-hours exactly, so it drops straight into that
 * query as `initialData` with no adapter and `buildHoursRows()` formats it
 * unchanged. This is what makes the hours render in static HTML even when the
 * API is unreachable.
 */
export const BUSINESS_HOURS: BusinessHours[] = [
  { day_of_week: 0, is_closed: false, open_time: "09:00:00", close_time: "15:00:00", slot_duration: 30 },
  { day_of_week: 1, is_closed: false, open_time: "09:00:00", close_time: "20:00:00", slot_duration: 30 },
  { day_of_week: 2, is_closed: false, open_time: "09:00:00", close_time: "20:00:00", slot_duration: 30 },
  { day_of_week: 3, is_closed: false, open_time: "09:00:00", close_time: "20:00:00", slot_duration: 30 },
  { day_of_week: 4, is_closed: false, open_time: "09:00:00", close_time: "20:00:00", slot_duration: 30 },
  { day_of_week: 5, is_closed: false, open_time: "09:00:00", close_time: "20:00:00", slot_duration: 30 },
  { day_of_week: 6, is_closed: false, open_time: "09:00:00", close_time: "19:00:00", slot_duration: 30 },
];

/**
 * Holiday and other one-off hours. Add an entry before each holiday and keep it
 * identical to the "Special hours" set on the Google Business Profile, or the
 * two disagree on the day it matters most.
 *
 * Omit open/close to mark the shop closed that day. Past dates are ignored
 * automatically, so old entries can stay until someone tidies up.
 *
 * Example:
 *   { date: "2026-12-25", label: "Christmas Day" },                                  // closed
 *   { date: "2026-12-24", label: "Christmas Eve", open: "09:00", close: "15:00" },
 */
export interface SpecialHours {
  /** YYYY-MM-DD, shop local time. */
  date: string;
  label: string;
  /** HH:MM, 24-hour. Leave both out when closed. */
  open?: string;
  close?: string;
}

export const HOLIDAY_HOURS: SpecialHours[] = [];

/** Today's date in the shop's time zone as YYYY-MM-DD. */
export const shopToday = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

/** Holiday entries from today onward, soonest first. */
export const upcomingSpecialHours = (
  list: SpecialHours[] = HOLIDAY_HOURS,
  now: Date = new Date()
): SpecialHours[] => {
  const today = shopToday(now);
  return list
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
};

// "09:00" → "9:00 AM"
const fmtTime = (t: string): string => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

/**
 * "Christmas Eve (Thu, Dec 24): 9:00 AM – 3:00 PM". The date is formatted in
 * UTC from noon so the weekday can't shift whatever the visitor's time zone.
 */
export const specialHoursLine = (h: SpecialHours): string => {
  const day = new Date(`${h.date}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const when =
    h.open && h.close ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : "Closed";
  return `${h.label} (${day}): ${when}`;
};
