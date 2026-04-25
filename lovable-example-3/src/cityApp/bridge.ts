// Lightweight bridge between the onboarding flow and the City app.
// Onboarding seeds a Profile + auth here, then navigates to /app where
// CityShellRoute reads from the bridge to populate state.
//
// Persisted to sessionStorage so navigation/refresh within the app
// doesn't bounce the user back to onboarding.

import type { Profile, Vibe, Mobility, Budget, Interest, UserType, Neighborhood } from "@/cityApp/lib/types";
import type { CityAuth } from "@/cityApp/CityShell";
import type { PassportState } from "@/onboarding/types";

interface Bridge {
  profile: Profile | null;
  auth: CityAuth | null;
}

const STORAGE_KEY = "knowhere.bridge.v1";

function loadFromStorage(): Bridge {
  if (typeof window === "undefined") return { profile: null, auth: null };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: null, auth: null };
    const parsed = JSON.parse(raw) as { profile: Profile | null; auth: Omit<CityAuth, "signOut"> | null };
    return {
      profile: parsed.profile,
      auth: parsed.auth ? { ...parsed.auth, signOut: () => {} } : null,
    };
  } catch {
    return { profile: null, auth: null };
  }
}

const bridge: Bridge = loadFromStorage();

function persist() {
  if (typeof window === "undefined") return;
  try {
    const { profile, auth } = bridge;
    const serializable = {
      profile,
      auth: auth ? { user: auth.user, token: auth.token } : null,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function setBridge(profile: Profile, auth: CityAuth | null) {
  bridge.profile = profile;
  bridge.auth = auth;
  persist();
}

export function clearBridge() {
  bridge.profile = null;
  bridge.auth = null;
  if (typeof window !== "undefined") {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }
}

export function hasBridge(): boolean {
  return !!bridge.profile;
}

export function readBridge(): Bridge {
  return bridge;
}

// ─── Mapping helpers ────────────────────────────────────────────────────────

const VIBE_VOCAB: Vibe[] = ["local", "iconic", "quiet", "social", "scenic", "family", "hidden gem"];
const MOBILITY_VOCAB: Mobility[] = ["walk", "bike", "transit", "mixed"];
const BUDGET_VOCAB: Budget[] = ["low", "medium", "flexible"];
const INTEREST_VOCAB: Interest[] = [
  "coffee",
  "bookstores",
  "museums",
  "food",
  "parks",
  "music",
  "shopping",
  "nightlife",
  "architecture",
  "art",
];
const NEIGHBORHOOD_VOCAB: Neighborhood[] = [
  "Kendall Square",
  "Harvard Square",
  "Back Bay",
  "Seaport",
  "North End",
  "Beacon Hill",
  "Fenway",
];

function pickFromVocab<T extends string>(text: string | undefined, vocab: readonly T[]): T | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  return vocab.find((v) => lower.includes(v.toLowerCase()));
}

function inferUserType(state: PassportState): UserType {
  const haystack = [
    state.profile?.travelStyle,
    state.profile?.socialContext,
    state.trip.timing,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/student|class|college|university/.test(haystack)) return "student";
  if (/local|home|live here|resident/.test(haystack)) return "local";
  if (/commut|work nearby|9 to 5/.test(haystack)) return "commuter";
  return "visitor";
}

function inferInterests(state: PassportState): Interest[] {
  const out = new Set<Interest>();
  const sources = [
    ...state.picks.interests,
    ...(state.profile?.pulls ?? []),
    ...(state.profile?.repeatedSignals ?? []),
    ...(state.profile?.distinctive ?? []),
    state.profile?.foodDrink,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const v of INTEREST_VOCAB) {
    if (sources.includes(v.replace("s", ""))) out.add(v);
  }
  // Quick-pick aliases
  const aliasMap: Record<string, Interest> = {
    cafe: "coffee",
    coffee: "coffee",
    espresso: "coffee",
    book: "bookstores",
    library: "bookstores",
    museum: "museums",
    gallery: "museums",
    art: "art",
    food: "food",
    eat: "food",
    restaurant: "food",
    park: "parks",
    nature: "parks",
    music: "music",
    shop: "shopping",
    boutique: "shopping",
    bar: "nightlife",
    cocktail: "nightlife",
    architecture: "architecture",
    design: "architecture",
  };
  for (const [needle, interest] of Object.entries(aliasMap)) {
    if (sources.includes(needle)) out.add(interest);
  }
  if (out.size < 2) {
    out.add("coffee");
    out.add("bookstores");
  }
  return Array.from(out).slice(0, 6);
}

function inferMobility(state: PassportState): Mobility {
  return (
    pickFromVocab(state.picks.mobility, MOBILITY_VOCAB) ??
    pickFromVocab(state.profile?.movement, MOBILITY_VOCAB) ??
    "mixed"
  );
}

function inferBudget(state: PassportState): Budget {
  return (
    pickFromVocab(state.picks.budget, BUDGET_VOCAB) ??
    pickFromVocab(state.profile?.spending, BUDGET_VOCAB) ??
    "medium"
  );
}

function inferVibe(state: PassportState): Vibe {
  const fromPicks = state.picks.vibes.join(" ");
  return (
    pickFromVocab(fromPicks, VIBE_VOCAB) ??
    pickFromVocab(state.profile?.travelStyle, VIBE_VOCAB) ??
    "local"
  );
}

function inferStartingLocation(state: PassportState): string {
  const trip = `${state.trip.city ?? ""} ${state.trip.area ?? ""}`;
  const matched = pickFromVocab(trip, NEIGHBORHOOD_VOCAB);
  if (matched) return matched;
  // Fallback: if user typed a city other than Boston, default to Kendall.
  return "Kendall Square";
}

export function buildProfileFromState(state: PassportState): Profile {
  return {
    userType: inferUserType(state),
    interests: inferInterests(state),
    mobility: inferMobility(state),
    budget: inferBudget(state),
    vibe: inferVibe(state),
    startingLocation: inferStartingLocation(state),
    onboardedAt: Date.now(),
  };
}
