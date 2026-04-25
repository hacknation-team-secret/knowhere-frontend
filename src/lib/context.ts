// Live editable City Pulse context.
// These values are the *inputs* to the Detour generator. Every chip in
// CityPulse maps to one of these fields — tapping a chip cycles its value
// and triggers a regeneration.

import type { Mobility, Neighborhood, Vibe } from "./types";

export type Weather = "clear" | "cloudy" | "rain soon" | "cold";
export type TimeOfDay = "morning" | "midday" | "afternoon" | "evening";

export interface PulseContext {
  neighborhood: Neighborhood;
  minutes: number;
  weather: Weather;
  vibe: Vibe;
  mobility: Mobility;
  timeOfDay: TimeOfDay;
}

export const MINUTE_OPTIONS = [30, 60, 90, 120, 180] as const;
export const WEATHER_OPTIONS: Weather[] = ["clear", "cloudy", "rain soon", "cold"];
export const TIME_OPTIONS: TimeOfDay[] = ["morning", "midday", "afternoon", "evening"];
export const VIBE_OPTIONS: Vibe[] = [
  "local",
  "iconic",
  "quiet",
  "social",
  "scenic",
  "family",
  "hidden gem",
];
export const MOBILITY_OPTIONS: Mobility[] = ["walk", "bike", "transit", "mixed"];

export function nextIn<T>(arr: readonly T[], current: T): T {
  const i = arr.indexOf(current);
  return arr[(i + 1) % arr.length];
}

export function defaultPulseContext(
  neighborhood: Neighborhood,
  vibe: Vibe,
  mobility: Mobility,
): PulseContext {
  return {
    neighborhood,
    minutes: 90,
    weather: "clear",
    vibe,
    mobility,
    timeOfDay: currentTimeOfDay(),
  };
}

export function currentTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 14) return "midday";
  if (h < 18) return "afternoon";
  return "evening";
}
