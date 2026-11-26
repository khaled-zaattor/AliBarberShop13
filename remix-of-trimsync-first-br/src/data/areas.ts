import type { ServiceFaq } from "@/data/services";

// Nearby-area landing pages: /areas/<slug>/.
//
// READ BEFORE ADDING AN AREA. Google's spam policy calls pages that target
// "different regions or cities that funnel users to one page" doorway pages,
// and demotes them. What separates a legitimate location page from a doorway
// is whether it says something true and specific that a person from that place
// actually needs: how to get here from there, how long it takes, why it's worth
// the trip. So every entry below has its own directions, drive time, reasons and
// FAQs — never the same paragraph with the town name swapped.
//
// Rules:
//  - The shop is in Pinellas Park and only Pinellas Park. Pages say "near"
//    another town, never "in" it, and never imply a second location.
//  - There is deliberately NO Pinellas Park area page. The homepage is the
//    Pinellas Park page; a second one would compete with it for the same query.
//  - Drive times are approximate, normal-traffic figures. Don't sharpen them.
//  - Keep the list short. Six well-made pages beat thirty thin ones. Add an area
//    only when you can write directions and reasons that are genuinely its own.
//  - Testimonials are NOT attributed to areas unless the reviewer said where
//    they're from. Never invent one.

export interface AreaPage {
  /** Page lives at /areas/<slug>/. */
  slug: string;
  /** Short display name: "Largo". */
  name: string;
  /** For titles and schema: "Largo, FL". */
  placeName: string;
  /** Rough direction from the shop, for the hub cards. */
  direction: string;
  /** Approximate driving time in normal traffic. */
  driveTime: string;
  /** Approximate driving distance. */
  distance: string;
  /** One sentence for the hub card and the homepage section. */
  summary: string;
  /** Opening paragraphs. */
  intro: string[];
  /** Turn-by-turn, in plain words. */
  directions: string[];
  /** Why someone from this area would make the trip. Each specific to it. */
  reasons: { title: string; body: string }[];
  /** Slugs from src/data/services.ts to feature on the page. */
  featuredServices: string[];
  faqs: ServiceFaq[];
  meta: { title: string; description: string };
  lastmod: string;
  /** Primary focus areas get higher sitemap priority. */
  focus: boolean;
}

const LASTMOD = "2026-11-21";

export const AREAS: AreaPage[] = [
  {
    slug: "lealman-fl",
    name: "Lealman",
    placeName: "Lealman, FL",
    direction: "Right next door",
    driveTime: "about 5 minutes",
    distance: "1–2 miles",
    summary:
      "The shop sits on the Lealman line. For most of Lealman it's the closest barbershop, just a few minutes up 34th or 49th Street.",
    intro: [
      "Lealman is unincorporated Pinellas County. It doesn't have its own town center, so a haircut usually means driving somewhere. Ali's Barber Shop is about as close as that drive gets. The shop is at 4201 62nd Ave N, on the Pinellas Park side of the line that Lealman shares, a few minutes from most Lealman streets.",
      "Because it's this close, a lot of people just walk in. If there's a chair free, you're in it. If you'd rather not wait, book online and pick a time.",
    ],
    directions: [
      "From central Lealman (around 54th Ave N), head north on 34th Street N (US-19) or 49th Street N.",
      "Turn onto 62nd Avenue N. From 34th Street turn left (west), from 49th Street turn right (east).",
      "The shop is at 4201 62nd Ave N, Unit 9. Parking is free right outside.",
    ],
    reasons: [
      {
        title: "Close enough for a walk-in",
        body: "A few minutes away, so you can check the line and come straight over. Walk-ins are welcome whenever a chair is open.",
      },
      {
        title: "Kids' cuts after school",
        body: "Kids' haircuts are $25 and the shop is open until 8 PM on weekdays, so an after-school or after-practice cut fits.",
      },
      {
        title: "Sunday hours",
        body: "Open Sunday 9 AM – 3 PM. Plenty of shops nearby are closed then.",
      },
    ],
    featuredServices: [
      "mens-haircut-pinellas-park",
      "kids-haircut-pinellas-park",
      "line-up-edge-up-pinellas-park",
    ],
    faqs: [
      {
        question: "Is Ali's Barber Shop close to Lealman?",
        answer:
          "Yes. The shop is at 4201 62nd Ave N in Pinellas Park, right on the edge of Lealman. From most of Lealman it's about a five-minute drive up 34th Street N or 49th Street N.",
      },
      {
        question: "Can I walk in from Lealman without an appointment?",
        answer:
          "Yes, walk-ins are welcome whenever a chair is free. If you want a guaranteed time, booking online takes about a minute.",
      },
    ],
    meta: {
      title: "Barber Near Lealman, FL — 5 Minutes Away | Ali's Barber Shop",
      description:
        "Ali's Barber Shop is on the Lealman line, about 5 minutes from most of Lealman. Men's haircuts $30, kids $25, walk-ins welcome, open Sundays. Free parking.",
    },
    lastmod: LASTMOD,
    focus: true,
  },

  {
    slug: "kenneth-city-fl",
    name: "Kenneth City",
    placeName: "Kenneth City, FL",
    direction: "Just southwest",
    driveTime: "about 5 minutes",
    distance: "about 2 miles",
    summary:
      "A short run north on 49th or 58th Street. Close enough to fit a cut into a lunch break.",
    intro: [
      "Kenneth City is a small town tucked between Pinellas Park and St. Petersburg, and the shop is just to its northeast. From most of Kenneth City it's about a five-minute drive. Most cuts take 30 minutes, so you can be back within the hour.",
      "That's why people come over at lunch or right after work. Book a time online and you'll get straight in.",
    ],
    directions: [
      "From Kenneth City, head north on 49th Street N or 58th Street N.",
      "Turn right (east) onto 62nd Avenue N.",
      "The shop is at 4201 62nd Ave N, Unit 9, Pinellas Park, with free parking outside.",
    ],
    reasons: [
      {
        title: "Fits in a lunch hour",
        body: "Five minutes each way and a 30-minute appointment. Book online, show up on time, and you're in the chair.",
      },
      {
        title: "Senior haircuts $25",
        body: "A lower price for seniors, with the same care and attention as any other cut.",
      },
      {
        title: "Beard and haircut together",
        body: "Haircut and beard together is $45, in one appointment.",
      },
    ],
    featuredServices: [
      "mens-haircut-pinellas-park",
      "senior-haircut-pinellas-park",
      "haircut-and-beard-pinellas-park",
    ],
    faqs: [
      {
        question: "How far is Ali's Barber Shop from Kenneth City?",
        answer:
          "About two miles, roughly five minutes by car. Head north on 49th Street N or 58th Street N and turn east onto 62nd Avenue N. The shop is at number 4201.",
      },
      {
        question: "Do you offer senior haircuts?",
        answer:
          "Yes. Senior haircuts are $25. You can book online or walk in when a chair is open.",
      },
    ],
    meta: {
      title: "Barber Near Kenneth City, FL — 5 Min Away | Ali's Barber Shop",
      description:
        "Barber about 5 minutes from Kenneth City, at 4201 62nd Ave N, Pinellas Park. Haircuts $30, seniors $25, haircut & beard $45. Book online or walk in.",
    },
    lastmod: LASTMOD,
    focus: true,
  },

  {
    slug: "disston-heights-st-petersburg",
    name: "Disston Heights",
    placeName: "Disston Heights, St. Petersburg, FL",
    direction: "Straight up 49th Street",
    driveTime: "5–10 minutes",
    distance: "2–3 miles",
    summary:
      "One road, one turn. Head north on 49th Street N and turn right on 62nd Ave N.",
    intro: [
      "Disston Heights runs along 49th Street N in northwest St. Petersburg, the road that used to be Disston Avenue. That makes it one of the easiest places to get to the shop from. Drive north on 49th, turn right on 62nd Avenue N, and you're there.",
      "It usually takes 5 to 10 minutes. That's close enough to book a same-day appointment and still make it on time.",
    ],
    directions: [
      "Head north on 49th Street N.",
      "Turn right (east) onto 62nd Avenue N.",
      "The shop is at 4201 62nd Ave N, Unit 9, on the left, with free parking.",
    ],
    reasons: [
      {
        title: "No highway, no hassle",
        body: "One straight road and one turn. No I-275 and no downtown parking.",
      },
      {
        title: "Same-day booking",
        body: "Open slots show live on the booking page, so you can grab one for later today.",
      },
      {
        title: "Fades and line-ups",
        body: "Skin, low and taper fades are the shop's main work. A line-up between cuts is $20.",
      },
    ],
    featuredServices: [
      "mens-haircut-pinellas-park",
      "line-up-edge-up-pinellas-park",
      "beard-trim-pinellas-park",
    ],
    faqs: [
      {
        question: "How do I get to Ali's Barber Shop from Disston Heights?",
        answer:
          "Drive north on 49th Street N and turn right onto 62nd Avenue N. The shop is at 4201 62nd Ave N, Unit 9. It usually takes 5 to 10 minutes.",
      },
      {
        question: "Can I book a same-day appointment?",
        answer:
          "Yes. The online booking shows live availability, so if a slot is open today you can take it. Walk-ins are welcome too when a chair is free.",
      },
    ],
    meta: {
      title: "Barber Near Disston Heights, St. Pete — 49th St N | Ali's Barber Shop",
      description:
        "From Disston Heights, drive north on 49th St N, about 5–10 minutes, to Ali's Barber Shop. Fades, beard work and line-ups. Haircuts $30. Same-day booking.",
    },
    lastmod: LASTMOD,
    focus: true,
  },

  {
    slug: "st-petersburg-fl",
    name: "St. Petersburg",
    placeName: "St. Petersburg, FL",
    direction: "South",
    driveTime: "10–20 minutes",
    distance: "3–9 miles",
    summary:
      "Under 10 minutes from north St. Pete, about 20 from downtown. Free parking, no meters, and a $30 haircut.",
    intro: [
      "The shop is just over St. Petersburg's northern edge. From north St. Pete neighborhoods like Meadowlawn and Fossil Park it's under 10 minutes. From downtown it's about 20 minutes up 34th Street N or I-275.",
      "Downtown means paying for parking and usually paying more for the cut. Here, a men's haircut is $30, parking is free outside the door, and the shop is open seven days, including Sunday 9 AM – 3 PM.",
    ],
    directions: [
      "From downtown or central St. Pete, take 34th Street N (US-19) north. Or take I-275 north, exit at 54th Avenue N, head west to 34th Street N, then go north.",
      "Turn left (west) onto 62nd Avenue N.",
      "The shop is at 4201 62nd Ave N, Unit 9. Park free right outside.",
      "From west St. Pete, take 49th Street N north and turn right (east) onto 62nd Avenue N.",
    ],
    reasons: [
      {
        title: "Free parking",
        body: "No meters and no garage. Park right outside the door.",
      },
      {
        title: "Open seven days",
        body: "Mon–Fri 9 AM – 8 PM, Sat 9 AM – 7 PM, Sun 9 AM – 3 PM. A Sunday cut is easy to fit in.",
      },
      {
        title: "English and Arabic",
        body: "Ali speaks both, so you can explain the cut you want in whichever language suits you.",
      },
    ],
    featuredServices: [
      "mens-haircut-pinellas-park",
      "haircut-and-beard-pinellas-park",
      "beard-trim-pinellas-park",
    ],
    faqs: [
      {
        question: "How far is Ali's Barber Shop from downtown St. Petersburg?",
        answer:
          "About 20 minutes in normal traffic. Take 34th Street N (US-19) or I-275 north, then 62nd Avenue N west to number 4201. From north St. Pete it's under 10 minutes.",
      },
      {
        question: "Is there parking?",
        answer:
          "Yes. Parking is free and right outside the shop at 4201 62nd Ave N, Unit 9. No meters.",
      },
      {
        question: "Is the shop open on Sundays?",
        answer: "Yes, Sundays from 9 AM to 3 PM.",
      },
    ],
    meta: {
      title: "Barber Near St. Petersburg, FL — Free Parking, $30 Cuts | Ali's Barber Shop",
      description:
        "Barber shop just north of St. Pete, about 20 min from downtown and under 10 from north St. Pete. Men's haircuts $30, free parking, open Sundays. Book online.",
    },
    lastmod: LASTMOD,
    focus: true,
  },

  {
    slug: "seminole-fl",
    name: "Seminole",
    placeName: "Seminole, FL",
    direction: "West, along Park Blvd",
    driveTime: "15–20 minutes",
    distance: "6–8 miles",
    summary:
      "Park Boulevard runs straight from Seminole to Pinellas Park. About 15–20 minutes, almost all on one road.",
    intro: [
      "From Seminole the drive is simple. Park Boulevard runs east from Seminole straight into Pinellas Park. Stay on it, make two turns at the end, and you're at the shop. It's about 15 to 20 minutes in normal traffic.",
      "Book ahead and your chair is ready when you arrive. You can check open times on the booking page before you leave.",
    ],
    directions: [
      "Take Park Boulevard east from Seminole.",
      "Turn right (south) onto 49th Street N.",
      "Turn left (east) onto 62nd Avenue N. The shop is at 4201 62nd Ave N, Unit 9, with free parking.",
    ],
    reasons: [
      {
        title: "One road most of the way",
        body: "Park Boulevard, then two turns. Easy to remember.",
      },
      {
        title: "Your time is booked",
        body: "The booking page holds your slot, so you don't drive 15 minutes and then wait.",
      },
      {
        title: "Haircut and beard in one visit",
        body: "Haircut and beard together is $45, so one trip covers both.",
      },
    ],
    featuredServices: [
      "haircut-and-beard-pinellas-park",
      "mens-haircut-pinellas-park",
      "kids-haircut-pinellas-park",
    ],
    faqs: [
      {
        question: "How long is the drive from Seminole?",
        answer:
          "About 15 to 20 minutes. Take Park Boulevard east, turn south on 49th Street N, then east on 62nd Avenue N to number 4201.",
      },
      {
        question: "Should I book ahead if I'm coming from Seminole?",
        answer:
          "We recommend it. Booking online holds your time, so you don't make the drive and then wait for a chair.",
      },
    ],
    meta: {
      title: "Barber Near Seminole, FL — Straight Down Park Blvd | Ali's Barber Shop",
      description:
        "About 15–20 minutes from Seminole along Park Blvd. Ali's Barber Shop in Pinellas Park: haircuts $30, haircut & beard $45, kids $25. Book your time online.",
    },
    lastmod: LASTMOD,
    focus: true,
  },

  {
    slug: "largo-fl",
    name: "Largo",
    placeName: "Largo, FL",
    direction: "Northwest",
    driveTime: "20–25 minutes",
    distance: "8–10 miles",
    summary:
      "About 20–25 minutes down 49th Street N. Book ahead and your chair is ready when you arrive.",
    intro: [
      "Largo is the longest drive of the areas on this site, about 20 to 25 minutes in normal traffic. The route is easy, though: get to 49th Street N and follow it south almost all the way to the shop.",
      "Because it's a longer trip, book online. Your time is held, the chair is ready when you get there, and you'll see the price before you leave home.",
    ],
    directions: [
      "From central Largo, take Ulmerton Road east to 49th Street N. From south Largo, take Park Boulevard east to 49th Street N.",
      "Go south on 49th Street N.",
      "Turn left (east) onto 62nd Avenue N. The shop is at 4201 62nd Ave N, Unit 9, Pinellas Park, with free parking.",
    ],
    reasons: [
      {
        title: "Book it and skip the wait",
        body: "Online booking holds your time, so the drive is the only part that takes a while.",
      },
      {
        title: "Fades that last",
        body: "Skin, low and taper fades are the shop's main work. A $20 line-up between cuts keeps one sharp longer.",
      },
      {
        title: "Prices before you leave",
        body: "Every price is on the site: $30 haircut, $45 with beard, $25 kids and seniors. No surprises when you pay.",
      },
    ],
    featuredServices: [
      "mens-haircut-pinellas-park",
      "haircut-and-beard-pinellas-park",
      "line-up-edge-up-pinellas-park",
    ],
    faqs: [
      {
        question: "How far is Ali's Barber Shop from Largo?",
        answer:
          "About 8 to 10 miles, roughly 20 to 25 minutes. Take Ulmerton Road or Park Boulevard east to 49th Street N, go south, then turn east on 62nd Avenue N to number 4201.",
      },
      {
        question: "Is it worth booking ahead from Largo?",
        answer:
          "Yes. Booking online holds your time, so you won't arrive to a full shop after a 20-minute drive.",
      },
    ],
    meta: {
      title: "Barber Near Largo, FL — Book Online, No Wait | Ali's Barber Shop",
      description:
        "About 20–25 minutes from Largo via 49th St N. Ali's Barber Shop in Pinellas Park: fades, beard work, haircuts $30. Book online so your chair is ready.",
    },
    lastmod: LASTMOD,
    focus: true,
  },
];

export const getArea = (slug: string): AreaPage | undefined =>
  AREAS.find((a) => a.slug === slug);

export const areaPath = (a: AreaPage) => `/areas/${a.slug}/`;
