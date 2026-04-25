// Detour generator — deterministic, structured, mocked.
// Returns the same shape a real LLM-backed endpoint would: a Detour object
// with stops, perks, route mode, Bluebikes pickup/dropoff, and a stamp.

import {
  BLUEBIKE_STATIONS,
  NEIGHBORHOODS,
  PERKS,
  PLACES,
  nearestStation,
  perksForPlace,
  placeById,
} from "./boston";
import type {
  Detour,
  DetourMode,
  DetourStop,
  Mobility,
  Neighborhood,
  Place,
  Profile,
  Vibe,
} from "./types";
import type { TimeOfDay, Weather } from "./context";

interface GenerateInput {
  profile: Profile;
  neighborhood?: Neighborhood;
  minutesAvailable?: number; // soft cap, defaults to 90
  vibeOverride?: Vibe;
  mobilityOverride?: Mobility;
  weather?: Weather;
  timeOfDay?: TimeOfDay;
  // Free-form refinement, parsed loosely (e.g. "make it cheaper", "more outdoors").
  refinement?: string;
}

const STAMP_LABELS = [
  "River Loop",
  "Bookstore Crawl",
  "Coffee & Quiet",
  "Local Hours",
  "Harbor Light",
  "Hidden Boston",
  "Slow Saturday",
  "Bike & Brew",
];

function scorePlaceForProfile(place: Place, profile: Profile): number {
  let score = 0;
  // Interest matches.
  for (const interest of profile.interests) {
    if (place.tags.includes(interest)) score += 3;
    if ((place.category as string) === (interest as string)) score += 2;
  }
  // Vibe match.
  if (place.tags.includes(profile.vibe)) score += 2;
  // Budget filter.
  if (profile.budget === "low" && place.priceLevel <= 1) score += 1;
  if (profile.budget === "medium" && place.priceLevel <= 2) score += 1;
  // Slight diversity nudge.
  return score;
}

function pickStops(
  profile: Profile,
  neighborhood: Neighborhood,
  refinement?: string,
  weather?: Weather,
): Place[] {
  const local = PLACES.filter((p) => p.neighborhood === neighborhood);
  const adjacent = PLACES.filter((p) => p.neighborhood !== neighborhood);

  const ranked = [...local, ...adjacent.slice(0, 6)]
    .map((p) => ({ p, s: scorePlaceForProfile(p, profile) }))
    .sort((a, b) => b.s - a.s);

  const lower = (refinement ?? "").toLowerCase();
  const wantsCheaper = /cheap|budget|free/.test(lower);
  const wantsOutdoors = /outdoor|park|outside|sun|river|walk/.test(lower);
  const skipMuseum = /no museum|skip museum|no indoor/.test(lower);

  const indoorOnly = weather === "rain soon" || weather === "cold";
  const filtered = ranked.filter(({ p }) => {
    if (wantsCheaper && p.priceLevel > 2) return false;
    if (skipMuseum && p.category === "museum") return false;
    if (indoorOnly && (p.category === "park" || p.category === "landmark")) return false;
    return true;
  });

  // Enforce category variety in the picked 3.
  const picked: Place[] = [];
  const seenCategories = new Set<string>();
  for (const { p } of filtered) {
    if (picked.length >= 3) break;
    if (seenCategories.has(p.category) && picked.length < 2) continue;
    picked.push(p);
    seenCategories.add(p.category);
  }
  // Fill if we only got 2.
  for (const { p } of filtered) {
    if (picked.length >= 3) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked.slice(0, 3);
}

function whyForStop(place: Place, profile: Profile): string {
  const matchedInterest = profile.interests.find(
    (i) => place.tags.includes(i) || (place.category as string) === (i as string),
  );
  if (matchedInterest) {
    return `You said you love ${matchedInterest}. ${place.blurb}`;
  }
  if (place.tags.includes(profile.vibe)) {
    return `Matches the ${profile.vibe} vibe you set. ${place.blurb}`;
  }
  return place.blurb;
}

function decideMode(profile: Profile, places: Place[]): DetourMode {
  if (profile.mobility === "walk") return "walk";
  if (profile.mobility === "bike") return "bike";
  // Mixed/transit → bike if stops span more than one neighborhood.
  const neighborhoods = new Set(places.map((p) => p.neighborhood));
  return neighborhoods.size > 1 ? "bike" : "walk";
}

function contextChipsFor(
  profile: Profile,
  neighborhood: Neighborhood,
  minutes: number,
  weather: Weather,
  timeOfDay: TimeOfDay,
  mobility: Mobility,
  vibe: Vibe,
): string[] {
  const weatherLabel: Record<Weather, string> = {
    clear: "Weather clear · 2 hrs",
    cloudy: "Cloudy, mild",
    "rain soon": "Rain in ~1 hr",
    cold: "Brisk · layers",
  };
  const chips = [
    `Near ${neighborhood}`,
    `${minutes} min free`,
    weatherLabel[weather],
    `${timeOfDay[0].toUpperCase()}${timeOfDay.slice(1)}`,
    `Wants ${vibe}`,
    `By ${mobility}`,
  ];
  if (mobility === "bike" || mobility === "mixed") {
    const station = BLUEBIKE_STATIONS.find((s) => s.bikesAvailable > 0);
    if (station) chips.push(`${station.bikesAvailable} bikes · ${station.name}`);
  }
  if (profile.interests.length) {
    chips.push(`Likes ${profile.interests.slice(0, 2).join(" + ")}`);
  }
  return chips;
}

let detourCounter = 0;
function nextDetourId(): string {
  detourCounter += 1;
  return `d_${Date.now().toString(36)}_${detourCounter}`;
}

export function generateDetour(input: GenerateInput): Detour {
  const { profile, refinement } = input;
  const neighborhood =
    input.neighborhood ?? (profile.startingLocation as Neighborhood) ?? "Kendall Square";
  const minutes = input.minutesAvailable ?? 90;
  const weather: Weather = input.weather ?? "clear";
  const timeOfDay: TimeOfDay = input.timeOfDay ?? "afternoon";
  const vibe: Vibe = input.vibeOverride ?? profile.vibe;
  const mobility: Mobility = input.mobilityOverride ?? profile.mobility;

  // Apply context-driven adjustments before picking stops.
  const effectiveProfile: Profile = { ...profile, vibe, mobility };

  const places = pickStops(effectiveProfile, neighborhood, refinement, weather);
  const mode = decideMode(effectiveProfile, places);

  // Attach perks where available, prefer one per detour minimum.
  const stops: DetourStop[] = places.map((p) => {
    const perks = perksForPlace(p.id);
    return {
      placeId: p.id,
      why: whyForStop(p, effectiveProfile),
      perkId: perks[0]?.id,
    };
  });

  const perkIds = stops.map((s) => s.perkId).filter(Boolean) as string[];
  if (perkIds.length === 0 && PERKS.length > 0) {
    const fallback = PERKS[0];
    const idx = stops.findIndex((s) => s.placeId === fallback.placeId);
    if (idx >= 0) {
      stops[idx].perkId = fallback.id;
      perkIds.push(fallback.id);
    }
  }

  let pickupStationId: string | undefined;
  let dropoffStationId: string | undefined;
  if (mode === "bike" || mode === "mixed") {
    const first = placeById(stops[0].placeId);
    const last = placeById(stops[stops.length - 1].placeId);
    if (first) pickupStationId = nearestStation(first.x, first.y, true).id;
    if (last) dropoffStationId = nearestStation(last.x, last.y, false).id;
  }

  const titleSeed = stops[0] ? placeById(stops[0].placeId)?.neighborhood : neighborhood;
  const titleBase = titleSeed?.split(" ")[0] ?? neighborhood.split(" ")[0];
  const variant = mode === "bike" ? "Loop" : mode === "walk" ? "Walk" : "Detour";
  const title = `${titleBase} ${variant}`;

  const between = mode === "walk" ? 12 : 6;
  const durationMin = Math.min(
    minutes,
    stops.length * 25 + (stops.length - 1) * between,
  );

  const stamp = STAMP_LABELS[Math.floor(Math.random() * STAMP_LABELS.length)];

  const rationale = buildRationale(effectiveProfile, neighborhood, mode, weather, timeOfDay, refinement);

  return {
    id: nextDetourId(),
    title,
    rationale,
    stops,
    durationMin,
    mode,
    pickupStationId,
    dropoffStationId,
    perkIds,
    stampLabel: stamp,
    generatedAt: Date.now(),
    contextChips: contextChipsFor(profile, neighborhood, minutes, weather, timeOfDay, mobility, vibe),
  };
}

function buildRationale(
  profile: Profile,
  neighborhood: Neighborhood,
  mode: DetourMode,
  weather: Weather,
  timeOfDay: TimeOfDay,
  refinement?: string,
): string {
  const parts: string[] = [];
  if (refinement) parts.push(`Refined: "${refinement.trim()}".`);
  parts.push(`You're near ${neighborhood} this ${timeOfDay} with weather ${weather}.`);
  if (mode === "bike") {
    parts.push("Bluebikes are available nearby, so we're routing by bike.");
  } else {
    parts.push("Stops are walkable from each other.");
  }
  if (profile.interests.length) {
    parts.push(`Picked for someone who loves ${profile.interests.slice(0, 2).join(" and ")}.`);
  }
  return parts.join(" ");
}

export function refineDetour(detour: Detour, profile: Profile, refinement: string): Detour {
  const neighborhood =
    (placeById(detour.stops[0]?.placeId)?.neighborhood as Neighborhood) ??
    (profile.startingLocation as Neighborhood);
  return generateDetour({
    profile,
    neighborhood,
    refinement,
    minutesAvailable: detour.durationMin,
  });
}

// Re-export the neighborhood set for the City Pulse picker.
export const ALL_NEIGHBORHOODS = NEIGHBORHOODS.map((n) => n.name);
