// Content for /about-ali/ and the Person schema node.
//
// Why this page matters: the reviews talk about Ali constantly, but the site
// never built "Ali" into an entity a search engine could resolve. GEO/AI
// visibility rewards clear, connected facts — Person → worksFor → LocalBusiness
// → location → services — far more than it rewards adjectives.
//
// Every fact here is confirmed by the owner. Anything still unconfirmed stays
// null and the page omits it rather than shipping a guess.

export interface AboutData {
  /** Display name used in headings and the Person schema. */
  name: string;
  /** Full professional name, for entity disambiguation. Owner must confirm. */
  fullName: string | null;
  jobTitle: string;
  /** Total years as a barber, approximate — always displayed as "nearly N". */
  yearsExperience: number | null;
  photo: { src: string; alt: string; width: number; height: number } | null;
  /** Heading shown above the bio. */
  bioHeading: string;
  bio: string[];
  specialties: string[];
  languages: string[];
}

export const ABOUT: AboutData = {
  name: "Ali",
  fullName: null, // TODO(owner): confirm. Listings currently show "Ali Zaatour",
  // "ALIS BARBERSHOP LLC" and "Ali's Barbershop" interchangeably — see
  // SEO-OFFSITE-CHECKLIST.md. Pick one and use it everywhere.
  jobTitle: "Barber",
  // Confirmed by the owner: nearly 15 years as a barber in total (started in
  // 2012). Always shown with "nearly" so it stays true.
  yearsExperience: 15,
  photo: {
    src: "/images/ali-barber.webp",
    alt: "Ali, barber at Ali's Barber Shop in Pinellas Park, FL",
    width: 768,
    height: 512,
  },

  bioHeading: "Ali Zaatour – Owner & Barber 💈",

  // Written by the owner, in his own words.
  bio: [
    "I’ve always believed that passion and determination can turn dreams into reality, and that even the hardest beginnings can lead to something beautiful.",
    "In 2012, I had to leave my home country and start over in a neighboring country. It was there that I discovered my passion for barbering and began learning the craft I would come to love. With hard work and dedication, I opened my first barbershop in 2014.",
    "At the end of 2024, my wife, our children, and I arrived in the United States to begin a new chapter. Starting over came with many challenges, from learning English and adjusting to a new culture to managing the high cost of living. But through it all, I never gave up on my dream of owning my own barbershop again.",
    "In mid-2026, that dream finally became a reality. I proudly opened my own shop, bringing nearly 15 years of experience to a community I’ve grown to love and deeply respect.",
    "To me, barbering is more than just a profession. It’s my passion, my art, and a way to connect with people. My goal is simple: to make every client feel welcome, valued, and confident every time they leave my chair.",
  ],

  specialties: [
    "Skin fades, taper fades, and low, mid and high fades",
    "Scissor work and classic cuts",
    "Beard shaping with a straight-razor finish",
    "Line-ups and perimeter edge-ups",
    "Kids' haircuts, including nervous first-timers",
  ],

  languages: ["English", "Arabic"],
};
