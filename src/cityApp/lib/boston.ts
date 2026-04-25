// Static Boston dataset — places, perks, mocked Bluebikes stations.
// Coordinates are 0–100 on a stylized map (not real lat/lng).
// Designed so swapping in a real API only changes the loader, not consumers.

import type {
  BluebikeStation,
  Neighborhood,
  Perk,
  Place,
} from "./types";

export const NEIGHBORHOODS: { name: Neighborhood; x: number; y: number }[] = [
  { name: "Kendall Square", x: 38, y: 32 },
  { name: "Harvard Square", x: 18, y: 22 },
  { name: "Back Bay", x: 48, y: 56 },
  { name: "Seaport", x: 72, y: 64 },
  { name: "North End", x: 62, y: 36 },
  { name: "Beacon Hill", x: 52, y: 44 },
  { name: "Fenway", x: 36, y: 60 },
];

export const PLACES: Place[] = [
  // Kendall Square
  {
    id: "p_voltage",
    name: "Voltage Coffee",
    category: "café",
    neighborhood: "Kendall Square",
    x: 40,
    y: 30,
    blurb: "MIT crowd, serious espresso, sunlit corner.",
    tags: ["coffee", "local", "quiet"],
    priceLevel: 1,
    hours: "7am–6pm",
    walkMin: 4,
  },
  {
    id: "p_mit_press",
    name: "MIT Press Bookstore",
    category: "bookstore",
    neighborhood: "Kendall Square",
    x: 36,
    y: 34,
    blurb: "Design, science, and architecture you didn't know you needed.",
    tags: ["bookstores", "quiet", "architecture"],
    priceLevel: 2,
    hours: "10am–7pm",
    walkMin: 6,
  },
  {
    id: "p_charles_path",
    name: "Charles River Path",
    category: "park",
    neighborhood: "Kendall Square",
    x: 42,
    y: 38,
    blurb: "Sailboats, skyline, the city's prettiest bike route.",
    tags: ["parks", "scenic", "local"],
    priceLevel: 1,
    hours: "Always",
    walkMin: 3,
  },
  {
    id: "p_state_park",
    name: "State Park Bar",
    category: "bar",
    neighborhood: "Kendall Square",
    x: 39,
    y: 28,
    blurb: "Wood-paneled, no-pretense, perfect after-work pint.",
    tags: ["food", "local", "social"],
    priceLevel: 2,
    hours: "5pm–1am",
    walkMin: 5,
  },

  // Harvard Square
  {
    id: "p_tatte_harvard",
    name: "Tatte — Harvard",
    category: "café",
    neighborhood: "Harvard Square",
    x: 16,
    y: 20,
    blurb: "Marble counters, almond croissants, golden light all afternoon.",
    tags: ["coffee", "scenic", "iconic"],
    priceLevel: 2,
    hours: "7am–8pm",
    walkMin: 3,
  },
  {
    id: "p_harvard_book",
    name: "Harvard Book Store",
    category: "bookstore",
    neighborhood: "Harvard Square",
    x: 20,
    y: 24,
    blurb: "Independent, beloved, with a basement of used finds.",
    tags: ["bookstores", "iconic", "quiet"],
    priceLevel: 2,
    hours: "9am–10pm",
    walkMin: 2,
  },
  {
    id: "p_carpenter",
    name: "Carpenter Center",
    category: "museum",
    neighborhood: "Harvard Square",
    x: 22,
    y: 22,
    blurb: "Le Corbusier's only North American building. Quietly radical.",
    tags: ["museums", "architecture", "art"],
    priceLevel: 1,
    hours: "10am–6pm",
    walkMin: 6,
  },

  // Back Bay
  {
    id: "p_trident",
    name: "Trident Booksellers",
    category: "bookstore",
    neighborhood: "Back Bay",
    x: 46,
    y: 54,
    blurb: "Books and brunch under one roof. A Newbury Street institution.",
    tags: ["bookstores", "food", "iconic"],
    priceLevel: 2,
    hours: "8am–11pm",
    walkMin: 4,
  },
  {
    id: "p_isabella",
    name: "Isabella Stewart Gardner",
    category: "museum",
    neighborhood: "Back Bay",
    x: 38,
    y: 62,
    blurb: "A Venetian palazzo hidden in the city. The courtyard alone is worth it.",
    tags: ["museums", "art", "iconic", "quiet"],
    priceLevel: 2,
    hours: "11am–5pm",
    walkMin: 12,
  },
  {
    id: "p_commonwealth",
    name: "Commonwealth Mall",
    category: "park",
    neighborhood: "Back Bay",
    x: 48,
    y: 52,
    blurb: "A green ribbon down the middle of the prettiest avenue in town.",
    tags: ["parks", "scenic", "quiet"],
    priceLevel: 1,
    hours: "Always",
    walkMin: 2,
  },

  // Seaport
  {
    id: "p_trillium",
    name: "Trillium Fort Point",
    category: "bar",
    neighborhood: "Seaport",
    x: 72,
    y: 62,
    blurb: "Garage doors open to the harbor, neighborhood beer, no pretense.",
    tags: ["food", "local", "scenic"],
    priceLevel: 2,
    hours: "12pm–11pm",
    walkMin: 5,
  },
  {
    id: "p_ica",
    name: "ICA Boston",
    category: "museum",
    neighborhood: "Seaport",
    x: 76,
    y: 66,
    blurb: "Cantilevered over the harbor. Contemporary art and a killer view.",
    tags: ["museums", "art", "architecture", "iconic"],
    priceLevel: 2,
    hours: "10am–5pm",
    walkMin: 8,
  },
  {
    id: "p_row34",
    name: "Row 34",
    category: "restaurant",
    neighborhood: "Seaport",
    x: 70,
    y: 60,
    blurb: "Oysters, lobster rolls, no fuss. The seafood Boston is named for.",
    tags: ["food", "iconic"],
    priceLevel: 3,
    hours: "11am–10pm",
    walkMin: 6,
  },

  // North End
  {
    id: "p_caffe_vittoria",
    name: "Caffè Vittoria",
    category: "café",
    neighborhood: "North End",
    x: 60,
    y: 36,
    blurb: "Boston's first Italian café. Espresso the way it should be.",
    tags: ["coffee", "iconic", "local"],
    priceLevel: 1,
    hours: "8am–12am",
    walkMin: 3,
  },
  {
    id: "p_modern_pastry",
    name: "Modern Pastry",
    category: "shop",
    neighborhood: "North End",
    x: 62,
    y: 38,
    blurb: "Cannoli filled to order. Get there before the line forms.",
    tags: ["food", "local", "iconic"],
    priceLevel: 1,
    hours: "8am–11pm",
    walkMin: 2,
  },
  {
    id: "p_paul_revere",
    name: "Paul Revere House",
    category: "landmark",
    neighborhood: "North End",
    x: 64,
    y: 34,
    blurb: "1680s wood frame still standing. The oldest house downtown.",
    tags: ["museums", "iconic"],
    priceLevel: 1,
    hours: "9:30am–5pm",
    walkMin: 4,
  },

  // Beacon Hill
  {
    id: "p_acorn_st",
    name: "Acorn Street",
    category: "landmark",
    neighborhood: "Beacon Hill",
    x: 52,
    y: 42,
    blurb: "The most photographed street in America, for a reason.",
    tags: ["scenic", "iconic", "architecture"],
    priceLevel: 1,
    hours: "Always",
    walkMin: 2,
  },
  {
    id: "p_paramount",
    name: "The Paramount",
    category: "restaurant",
    neighborhood: "Beacon Hill",
    x: 50,
    y: 46,
    blurb: "Cafeteria-style breakfast, locals lined up around the block.",
    tags: ["food", "local"],
    priceLevel: 1,
    hours: "7am–10pm",
    walkMin: 3,
  },

  // Fenway
  {
    id: "p_time_out",
    name: "Time Out Market",
    category: "restaurant",
    neighborhood: "Fenway",
    x: 34,
    y: 60,
    blurb: "Fifteen kitchens, one room. Order from three, share everything.",
    tags: ["food", "social", "iconic"],
    priceLevel: 2,
    hours: "11am–10pm",
    walkMin: 5,
  },
  {
    id: "p_mfa",
    name: "Museum of Fine Arts",
    category: "museum",
    neighborhood: "Fenway",
    x: 36,
    y: 64,
    blurb: "Egyptian wing, impressionists, and a courtyard built for slow afternoons.",
    tags: ["museums", "art", "iconic"],
    priceLevel: 2,
    hours: "10am–5pm",
    walkMin: 7,
  },
];

export function placeById(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export function placesIn(neighborhood: Neighborhood): Place[] {
  return PLACES.filter((p) => p.neighborhood === neighborhood);
}

// Mocked Bluebikes stations. Availability is deterministic per session
// so the demo is repeatable.
export const BLUEBIKE_STATIONS: BluebikeStation[] = [
  { id: "bb_kendall", name: "Kendall T", x: 38, y: 30, bikesAvailable: 9, docksAvailable: 6, capacity: 19 },
  { id: "bb_main_st", name: "Main St @ Broadway", x: 42, y: 28, bikesAvailable: 4, docksAvailable: 12, capacity: 17 },
  { id: "bb_charles", name: "Charles Circle", x: 50, y: 42, bikesAvailable: 11, docksAvailable: 4, capacity: 18 },
  { id: "bb_harvard", name: "Harvard Square", x: 18, y: 22, bikesAvailable: 7, docksAvailable: 9, capacity: 19 },
  { id: "bb_newbury", name: "Newbury & Mass Ave", x: 46, y: 54, bikesAvailable: 6, docksAvailable: 8, capacity: 16 },
  { id: "bb_copley", name: "Copley Square", x: 50, y: 52, bikesAvailable: 3, docksAvailable: 13, capacity: 18 },
  { id: "bb_seaport", name: "Seaport Blvd", x: 72, y: 62, bikesAvailable: 12, docksAvailable: 4, capacity: 17 },
  { id: "bb_north_end", name: "Hanover & Battery", x: 62, y: 36, bikesAvailable: 5, docksAvailable: 10, capacity: 16 },
  { id: "bb_fenway", name: "Fenway Park", x: 34, y: 60, bikesAvailable: 8, docksAvailable: 7, capacity: 17 },
  { id: "bb_mfa", name: "MFA / Ruggles", x: 36, y: 64, bikesAvailable: 6, docksAvailable: 9, capacity: 16 },
];

export function stationById(id: string): BluebikeStation | undefined {
  return BLUEBIKE_STATIONS.find((s) => s.id === id);
}

// Find the nearest station to a coordinate (Manhattan-ish on the stylized map).
export function nearestStation(
  x: number,
  y: number,
  needBike = true,
): BluebikeStation {
  const candidates = BLUEBIKE_STATIONS.filter((s) =>
    needBike ? s.bikesAvailable > 0 : s.docksAvailable > 0,
  );
  return [...candidates].sort(
    (a, b) =>
      Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
  )[0];
}

export const PERKS: Perk[] = [
  {
    id: "perk_voltage",
    merchantId: "m_voltage",
    merchantName: "Voltage Coffee",
    placeId: "p_voltage",
    title: "$2 off any cold brew",
    description: "Show this pass at the counter. Good through closing today.",
    targeting: ["Bluebike riders ending nearby", "Kendall lunch crowd"],
    windowLabel: "Today, until 6pm",
    redemption: "qr",
  },
  {
    id: "perk_trident",
    merchantId: "m_trident",
    merchantName: "Trident Booksellers",
    placeId: "p_trident",
    title: "Free pastry with any coffee",
    description: "Mention Knowhere at the register. One per visit.",
    targeting: ["Back Bay walkers", "Bookstore lovers"],
    windowLabel: "Today, until 4pm",
    redemption: "show-screen",
  },
  {
    id: "perk_modern",
    merchantId: "m_modern",
    merchantName: "Modern Pastry",
    placeId: "p_modern_pastry",
    title: "Buy one cannoli, get one half off",
    description: "Filled to order. Good for two cannoli today.",
    targeting: ["North End first-timers", "Tourists"],
    windowLabel: "Today, 2–8pm",
    redemption: "qr",
  },
  {
    id: "perk_trillium",
    merchantId: "m_trillium",
    merchantName: "Trillium Fort Point",
    placeId: "p_trillium",
    title: "First pour on us",
    description: "Dock a Bluebike within 0.3 mi and your first beer is free.",
    targeting: ["Bluebike riders", "Seaport arrivals"],
    windowLabel: "Today, 4–7pm",
    redemption: "qr",
  },
  {
    id: "perk_tatte",
    merchantId: "m_tatte",
    merchantName: "Tatte — Harvard",
    placeId: "p_tatte_harvard",
    title: "Half-off morning bun",
    description: "Available before 11am. Show pass at the counter.",
    targeting: ["Harvard Square mornings", "Coffee lovers"],
    windowLabel: "Daily, 7–11am",
    redemption: "show-screen",
  },
];

export function perkById(id: string): Perk | undefined {
  return PERKS.find((p) => p.id === id);
}

export function perksForPlace(placeId: string): Perk[] {
  return PERKS.filter((p) => p.placeId === placeId);
}

// Cities the product hints at but doesn't yet support.
export const COMING_SOON_CITIES = [
  "New York",
  "San Francisco",
  "Brooklyn",
  "Chicago",
  "Austin",
  "Lisbon",
  "Tokyo",
];
