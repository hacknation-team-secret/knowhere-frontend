// Knowhere — core domain types.
// Designed so a real API can replace the in-memory layer 1:1.

export type UserType = "visitor" | "local" | "student" | "commuter";
export type Mobility = "walk" | "bike" | "transit" | "mixed";
export type Budget = "low" | "medium" | "flexible";
export type Vibe =
  | "local"
  | "iconic"
  | "quiet"
  | "social"
  | "scenic"
  | "family"
  | "hidden gem";

export type Interest =
  | "coffee"
  | "bookstores"
  | "museums"
  | "food"
  | "parks"
  | "music"
  | "shopping"
  | "nightlife"
  | "architecture"
  | "art";

export interface Profile {
  userType: UserType;
  interests: Interest[];
  mobility: Mobility;
  budget: Budget;
  vibe: Vibe;
  startingLocation: string; // neighborhood name
  onboardedAt: number;
}

export type PlaceCategory =
  | "café"
  | "restaurant"
  | "bar"
  | "museum"
  | "bookstore"
  | "park"
  | "shop"
  | "venue"
  | "landmark";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  neighborhood: Neighborhood;
  // Position on the stylized Boston map, 0-100 in both axes.
  x: number;
  y: number;
  blurb: string; // one-line "why locals like it"
  tags: string[]; // matched against interests/vibe
  priceLevel: 1 | 2 | 3;
  hours: string;
  walkMin: number; // typical walk from a central neighborhood point
}

export type Neighborhood =
  | "Kendall Square"
  | "Harvard Square"
  | "Back Bay"
  | "Seaport"
  | "North End"
  | "Beacon Hill"
  | "Fenway";

export interface BluebikeStation {
  id: string;
  name: string;
  x: number;
  y: number;
  bikesAvailable: number;
  docksAvailable: number;
  capacity: number;
}

export interface Perk {
  id: string;
  merchantId: string;
  merchantName: string;
  placeId: string;
  title: string;
  description: string;
  // Mocked targeting; surfaced as small chips in merchant dashboard.
  targeting: string[];
  windowLabel: string; // e.g. "today, 2–5 PM"
  redemption: "qr" | "show-screen";
}

export interface DetourStop {
  placeId: string;
  why: string; // one-line rationale tying to user profile
  perkId?: string;
}

export type DetourMode = "walk" | "bike" | "mixed";

export interface Detour {
  id: string;
  title: string;
  rationale: string;
  stops: DetourStop[];
  durationMin: number;
  mode: DetourMode;
  // Set when mode includes "bike".
  pickupStationId?: string;
  dropoffStationId?: string;
  perkIds: string[];
  stampLabel: string;
  generatedAt: number;
  contextChips: string[];
}

export interface PassportEntry {
  detour: Detour;
  addedAt: number;
  completedAt?: number;
  redeemedPerkIds: string[];
}

export interface MerchantCampaign {
  id: string;
  businessName: string;
  goal: string;
  offerType: string;
  target: string;
  windowLabel: string;
  generatedTitle: string;
  generatedCopy: string;
  createdAt: number;
}
