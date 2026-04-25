// Curated Viator experience catalog + profile-aware ranker.
// Phase 1: hand-picked archetypes with deep links to public Viator search.
// Phase 2 (later): swap rankExperiencesForProfile to call an edge function
//                  that proxies the Viator Partner API (api.viator.com).

import type { Profile, Interest, Vibe, Budget, Mobility } from "./types";
import cafeImg from "@/assets/detour-cafe.jpg";
import parkImg from "@/assets/detour-park.jpg";
import bookstoreImg from "@/assets/detour-bookstore.jpg";
import marketImg from "@/assets/detour-market.jpg";

export type ExperienceCategory =
  | "food & drink"
  | "walking tour"
  | "museum & art"
  | "outdoors & water"
  | "music & nightlife"
  | "architecture"
  | "day trip"
  | "hidden gem";

export interface ViatorExperience {
  id: string;
  title: string;
  category: ExperienceCategory;
  city: string;
  blurb: string;
  durationLabel: string; // "2 hours", "Half day"
  priceTier: 1 | 2 | 3; // 1 = $, 2 = $$, 3 = $$$
  searchQuery: string; // used to construct the Viator search URL
  image: string;
  // Tags used by the ranker to match against Profile.interests / vibe.
  matchTags: Array<Interest | Vibe | "social" | "iconic" | "local">;
}

const IMG_BY_CATEGORY: Record<ExperienceCategory, string> = {
  "food & drink": marketImg,
  "walking tour": parkImg,
  "museum & art": bookstoreImg,
  "outdoors & water": parkImg,
  "music & nightlife": cafeImg,
  architecture: bookstoreImg,
  "day trip": parkImg,
  "hidden gem": cafeImg,
};

// Curated archetypes per supported city. Titles intentionally mirror real
// product categories you'd find on Viator so deep-link search returns matches.
const CITY_CATALOG: Record<string, ViatorExperience[]> = {
  Boston: [
    {
      id: "bos-freedom-trail",
      title: "Freedom Trail walking tour",
      category: "walking tour",
      city: "Boston",
      blurb: "A small-group history walk through the city's oldest streets.",
      durationLabel: "2 hours",
      priceTier: 1,
      searchQuery: "Freedom Trail walking tour Boston",
      image: IMG_BY_CATEGORY["walking tour"],
      matchTags: ["architecture", "iconic", "scenic"],
    },
    {
      id: "bos-north-end-food",
      title: "North End food & wine tour",
      category: "food & drink",
      city: "Boston",
      blurb: "Cannoli, pasta, and red sauce stories with a local guide.",
      durationLabel: "3 hours",
      priceTier: 2,
      searchQuery: "North End food tour Boston",
      image: IMG_BY_CATEGORY["food & drink"],
      matchTags: ["food", "social", "local"],
    },
    {
      id: "bos-harbor-cruise",
      title: "Boston Harbor sunset cruise",
      category: "outdoors & water",
      city: "Boston",
      blurb: "Skyline, sea breeze, and a quieter way to see the city.",
      durationLabel: "90 min",
      priceTier: 2,
      searchQuery: "Boston Harbor sunset cruise",
      image: IMG_BY_CATEGORY["outdoors & water"],
      matchTags: ["scenic", "quiet", "iconic"],
    },
    {
      id: "bos-mfa-tour",
      title: "Museum of Fine Arts guided visit",
      category: "museum & art",
      city: "Boston",
      blurb: "Highlights tour with a curator-trained guide; skip-the-line entry.",
      durationLabel: "2 hours",
      priceTier: 2,
      searchQuery: "Museum of Fine Arts Boston guided tour",
      image: IMG_BY_CATEGORY["museum & art"],
      matchTags: ["museums", "art", "quiet"],
    },
    {
      id: "bos-bike-charles",
      title: "Charles River bike tour",
      category: "outdoors & water",
      city: "Boston",
      blurb: "Easy 8-mile loop with bike + helmet + a guide who knows the bridges.",
      durationLabel: "2.5 hours",
      priceTier: 2,
      searchQuery: "Boston Charles River bike tour",
      image: IMG_BY_CATEGORY["outdoors & water"],
      matchTags: ["parks", "scenic", "social"],
    },
    {
      id: "bos-jazz-night",
      title: "Boston jazz club evening",
      category: "music & nightlife",
      city: "Boston",
      blurb: "Two-set night at a Wally's-style room, drinks included.",
      durationLabel: "3 hours",
      priceTier: 2,
      searchQuery: "Boston jazz club tour evening",
      image: IMG_BY_CATEGORY["music & nightlife"],
      matchTags: ["music", "nightlife", "social"],
    },
    {
      id: "bos-architecture",
      title: "Back Bay architecture walk",
      category: "architecture",
      city: "Boston",
      blurb: "Brownstones, Trinity Church, and the bones of a planned neighborhood.",
      durationLabel: "2 hours",
      priceTier: 1,
      searchQuery: "Back Bay architecture tour Boston",
      image: IMG_BY_CATEGORY.architecture,
      matchTags: ["architecture", "quiet", "local"],
    },
    {
      id: "bos-salem",
      title: "Salem witch trials day trip",
      category: "day trip",
      city: "Boston",
      blurb: "Half-day with transport, a costumed guide, and the museum.",
      durationLabel: "Half day",
      priceTier: 2,
      searchQuery: "Salem day trip from Boston",
      image: IMG_BY_CATEGORY["day trip"],
      matchTags: ["iconic", "family"],
    },
    {
      id: "bos-cooking",
      title: "Italian cooking class in the North End",
      category: "food & drink",
      city: "Boston",
      blurb: "Roll your own pasta, eat it together, leave with a recipe card.",
      durationLabel: "3 hours",
      priceTier: 3,
      searchQuery: "Italian cooking class Boston North End",
      image: IMG_BY_CATEGORY["food & drink"],
      matchTags: ["food", "social"],
    },
  ],
  Paris: [
    {
      id: "par-louvre",
      title: "Louvre skip-the-line guided tour",
      category: "museum & art",
      city: "Paris",
      blurb: "Mona Lisa, Venus, and a guide who'll keep you out of the crush.",
      durationLabel: "2.5 hours",
      priceTier: 2,
      searchQuery: "Louvre skip the line guided tour",
      image: IMG_BY_CATEGORY["museum & art"],
      matchTags: ["museums", "art", "iconic"],
    },
    {
      id: "par-marais-food",
      title: "Le Marais food walking tour",
      category: "food & drink",
      city: "Paris",
      blurb: "Falafel, fromage, and the best chocolate shops in the 4th.",
      durationLabel: "3 hours",
      priceTier: 2,
      searchQuery: "Le Marais food tour Paris",
      image: IMG_BY_CATEGORY["food & drink"],
      matchTags: ["food", "local", "social"],
    },
    {
      id: "par-seine",
      title: "Seine evening cruise with dinner",
      category: "outdoors & water",
      city: "Paris",
      blurb: "Lit-up monuments, three courses, and a lazy hour and a half.",
      durationLabel: "2 hours",
      priceTier: 3,
      searchQuery: "Seine river evening cruise dinner Paris",
      image: IMG_BY_CATEGORY["outdoors & water"],
      matchTags: ["scenic", "iconic"],
    },
    {
      id: "par-montmartre",
      title: "Montmartre artists' walk",
      category: "walking tour",
      city: "Paris",
      blurb: "Side streets, painters' studios, and a cafe Picasso once liked.",
      durationLabel: "2 hours",
      priceTier: 1,
      searchQuery: "Montmartre walking tour Paris",
      image: IMG_BY_CATEGORY["walking tour"],
      matchTags: ["art", "local", "architecture"],
    },
    {
      id: "par-versailles",
      title: "Versailles half-day from Paris",
      category: "day trip",
      city: "Paris",
      blurb: "Train + skip-the-line palace + the gardens at their quietest.",
      durationLabel: "Half day",
      priceTier: 2,
      searchQuery: "Versailles half day from Paris",
      image: IMG_BY_CATEGORY["day trip"],
      matchTags: ["iconic", "family", "architecture"],
    },
    {
      id: "par-wine",
      title: "Paris wine tasting in a hidden cellar",
      category: "hidden gem",
      city: "Paris",
      blurb: "Six pours, a sommelier with opinions, no phones encouraged.",
      durationLabel: "2 hours",
      priceTier: 2,
      searchQuery: "Paris wine tasting cellar",
      image: IMG_BY_CATEGORY["hidden gem"],
      matchTags: ["food", "quiet", "local"],
    },
  ],
  "New York": [
    {
      id: "nyc-statue",
      title: "Statue of Liberty + Ellis Island tour",
      category: "outdoors & water",
      city: "New York",
      blurb: "Ferry, pedestal access, and the immigration museum.",
      durationLabel: "Half day",
      priceTier: 2,
      searchQuery: "Statue of Liberty Ellis Island tour",
      image: IMG_BY_CATEGORY["outdoors & water"],
      matchTags: ["iconic", "family"],
    },
    {
      id: "nyc-broadway",
      title: "Broadway show with backstage talk",
      category: "music & nightlife",
      city: "New York",
      blurb: "Orchestra-section seats and a Q&A with a working performer.",
      durationLabel: "3 hours",
      priceTier: 3,
      searchQuery: "Broadway show backstage tour New York",
      image: IMG_BY_CATEGORY["music & nightlife"],
      matchTags: ["music", "iconic", "social"],
    },
    {
      id: "nyc-greenwich",
      title: "Greenwich Village food tour",
      category: "food & drink",
      city: "New York",
      blurb: "Pizza, pickles, cannoli, and the bar from the album cover.",
      durationLabel: "3 hours",
      priceTier: 2,
      searchQuery: "Greenwich Village food tour NYC",
      image: IMG_BY_CATEGORY["food & drink"],
      matchTags: ["food", "music", "local"],
    },
    {
      id: "nyc-met",
      title: "Met Museum highlights tour",
      category: "museum & art",
      city: "New York",
      blurb: "Two hours, the right galleries, none of the wandering.",
      durationLabel: "2 hours",
      priceTier: 2,
      searchQuery: "Met Museum guided tour New York",
      image: IMG_BY_CATEGORY["museum & art"],
      matchTags: ["museums", "art"],
    },
    {
      id: "nyc-highline",
      title: "High Line + Chelsea galleries walk",
      category: "walking tour",
      city: "New York",
      blurb: "Elevated park north to south, with three gallery stops.",
      durationLabel: "2 hours",
      priceTier: 1,
      searchQuery: "High Line Chelsea galleries walking tour NYC",
      image: IMG_BY_CATEGORY["walking tour"],
      matchTags: ["art", "architecture", "scenic"],
    },
    {
      id: "nyc-jazz",
      title: "Harlem jazz night",
      category: "music & nightlife",
      city: "New York",
      blurb: "A small room, two sets, and soul food before the lights drop.",
      durationLabel: "3 hours",
      priceTier: 2,
      searchQuery: "Harlem jazz tour New York",
      image: IMG_BY_CATEGORY["music & nightlife"],
      matchTags: ["music", "nightlife", "local"],
    },
  ],
  Tokyo: [
    {
      id: "tok-tsukiji",
      title: "Tsukiji outer market food walk",
      category: "food & drink",
      city: "Tokyo",
      blurb: "Tamago, uni, and the standing-only place locals queue for.",
      durationLabel: "3 hours",
      priceTier: 2,
      searchQuery: "Tsukiji outer market food tour",
      image: IMG_BY_CATEGORY["food & drink"],
      matchTags: ["food", "local"],
    },
    {
      id: "tok-shibuya",
      title: "Shibuya & Harajuku night walk",
      category: "music & nightlife",
      city: "Tokyo",
      blurb: "Crossing, side streets, vinyl bars, ramen at midnight.",
      durationLabel: "3 hours",
      priceTier: 2,
      searchQuery: "Shibuya Harajuku night tour Tokyo",
      image: IMG_BY_CATEGORY["music & nightlife"],
      matchTags: ["music", "nightlife", "iconic"],
    },
    {
      id: "tok-tea",
      title: "Tea ceremony in a private home",
      category: "hidden gem",
      city: "Tokyo",
      blurb: "Forty quiet minutes, no shoes, very good matcha.",
      durationLabel: "1 hour",
      priceTier: 2,
      searchQuery: "Tokyo tea ceremony private home",
      image: IMG_BY_CATEGORY["hidden gem"],
      matchTags: ["quiet", "local"],
    },
    {
      id: "tok-teamlab",
      title: "teamLab Planets immersive art",
      category: "museum & art",
      city: "Tokyo",
      blurb: "Wade through water and light; barefoot, phone in pocket.",
      durationLabel: "90 min",
      priceTier: 2,
      searchQuery: "teamLab Planets Tokyo tickets",
      image: IMG_BY_CATEGORY["museum & art"],
      matchTags: ["art", "iconic"],
    },
  ],
};

const SUPPORTED_CITIES = Object.keys(CITY_CATALOG);

export function supportedCities(): string[] {
  return SUPPORTED_CITIES;
}

/**
 * Build a public Viator search URL. Adds a `pid` param when an affiliate ID
 * env var is provided, so bookings can be attributed later without a code change.
 */
export function viatorSearchUrl(query: string, city?: string): string {
  const text = city ? `${query} ${city}`.trim() : query;
  const url = new URL("https://www.viator.com/searchResults/all");
  url.searchParams.set("text", text);
  const pid = (import.meta as ImportMeta & { env?: Record<string, string> }).env
    ?.VITE_VIATOR_AFFILIATE_PID;
  if (pid) url.searchParams.set("pid", pid);
  return url.toString();
}

export interface RankedCategory {
  category: ExperienceCategory;
  reason: string;
  experiences: ViatorExperience[];
}

interface RankResult {
  city: string;
  rationale: string;
  categories: RankedCategory[];
  all: ViatorExperience[];
}

const INTEREST_TO_TAGS: Record<Interest, string[]> = {
  coffee: ["food", "local", "quiet"],
  bookstores: ["quiet", "local", "art"],
  museums: ["museums", "art"],
  food: ["food", "social", "local"],
  parks: ["parks", "scenic"],
  music: ["music", "nightlife", "social"],
  shopping: ["local", "social"],
  nightlife: ["nightlife", "music", "social"],
  architecture: ["architecture", "iconic"],
  art: ["art", "museums", "local"],
};

function scoreExperience(exp: ViatorExperience, profile: Profile): number {
  let score = 0;
  for (const interest of profile.interests) {
    const tags = INTEREST_TO_TAGS[interest] ?? [];
    for (const t of tags) {
      if (exp.matchTags.includes(t as never)) score += 2;
    }
    if (exp.matchTags.includes(interest as never)) score += 3;
  }
  if (exp.matchTags.includes(profile.vibe as never)) score += 2;
  // Budget alignment.
  const budgetCap: Record<Budget, number> = { low: 1, medium: 2, flexible: 3 };
  if (exp.priceTier <= budgetCap[profile.budget]) score += 1;
  if (exp.priceTier > budgetCap[profile.budget]) score -= 2;
  // Mobility nudges.
  if (
    (profile.mobility === "walk" || profile.mobility === "bike") &&
    (exp.category === "walking tour" || exp.category === "outdoors & water")
  ) {
    score += 1;
  }
  return score;
}

function rationaleFor(profile: Profile, city: string): string {
  const interestSlice = profile.interests.slice(0, 2);
  const interestText =
    interestSlice.length === 0
      ? "your travel style"
      : interestSlice.length === 1
        ? interestSlice[0]
        : `${interestSlice[0]} and ${interestSlice[1]}`;
  return `Based on your passport — you lean ${profile.vibe} and into ${interestText} — here's what's bookable in ${city}.`;
}

function reasonForCategory(
  category: ExperienceCategory,
  profile: Profile,
): string {
  switch (category) {
    case "food & drink":
      return profile.interests.includes("food")
        ? "You said food matters — these put you at the table."
        : "Eating with a guide is the fastest way into a city.";
    case "walking tour":
      return profile.mobility === "walk" || profile.mobility === "bike"
        ? "You move on foot — these are paced for it."
        : "Two hours, low effort, lots of context.";
    case "museum & art":
      return profile.interests.includes("museums") ||
        profile.interests.includes("art")
        ? "Curated for the museum/art lean in your profile."
        : "Skip-the-line picks if you want a quieter afternoon.";
    case "outdoors & water":
      return profile.vibe === "scenic"
        ? "You wanted scenic — these deliver views without effort."
        : "Outdoor picks for clear-weather windows.";
    case "music & nightlife":
      return profile.interests.includes("music") ||
        profile.interests.includes("nightlife")
        ? "For your music & nightlife lean."
        : "Evenings with a built-in itinerary.";
    case "architecture":
      return "Slow walks through the city's bones.";
    case "day trip":
      return "Half-day escapes that snap back by dinner.";
    case "hidden gem":
      return profile.vibe === "hidden gem" || profile.vibe === "local"
        ? "Local-led, small-group — your kind of room."
        : "Off the obvious path.";
    default:
      return "Picked for you.";
  }
}

export function rankExperiencesForProfile(
  profile: Profile,
  city: string,
): RankResult {
  const catalog = CITY_CATALOG[city] ?? CITY_CATALOG.Boston;
  const scored = catalog
    .map((exp) => ({ exp, score: scoreExperience(exp, profile) }))
    .sort((a, b) => b.score - a.score);

  // Group by category, ordering categories by their best-scoring member.
  const byCat = new Map<ExperienceCategory, ViatorExperience[]>();
  for (const { exp } of scored) {
    const arr = byCat.get(exp.category) ?? [];
    arr.push(exp);
    byCat.set(exp.category, arr);
  }
  const categories: RankedCategory[] = Array.from(byCat.entries()).map(
    ([category, experiences]) => ({
      category,
      reason: reasonForCategory(category, profile),
      experiences,
    }),
  );

  return {
    city,
    rationale: rationaleFor(profile, city),
    categories,
    all: scored.map((s) => s.exp),
  };
}
