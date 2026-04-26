export const PASSPORT_PROMPT = `Create my Knowhere Passport Profile.

Knowhere uses this profile to recommend city routes, places, and experiences that fit how I actually like to spend time.

Analyze this user's travel taste by referring back to our previous interactions in this chat first, then use any pasted chat history below as additional context.

Rules:
- Do not ask follow-up questions.
- Use the existing conversation context from this thread even if no extra material is pasted below.
- If chat history is pasted below, combine it with the earlier conversation in this thread.
- Do not say "no material provided" if earlier messages in this conversation contain signals you can use.
- Do not force a specific aesthetic or travel personality.
- Do not make me sound more artsy, adventurous, luxurious, outdoorsy, social, minimalist, or "local" than the evidence supports.
- Avoid generic labels unless you explain what they specifically mean for me.
- Base claims on repeated signals, unusual details, clear preferences, or strong contrasts.
- If a claim is uncertain, mark it "light signal."
- Prioritize specificity over flattery.

OPTIONAL EXTRA CHAT HISTORY:
[Paste the user's chat history, messages, travel questions, saved ideas, links, restaurant names, neighborhoods, notes, or any other conversational clues if helpful.]

Return only this:

KNOWHERE PASSPORT PROFILE

TRAVEL STYLE:
A specific 1-2 sentence summary of how I seem to like spending time in cities.

REPEATED SIGNALS:
3-6 concrete patterns found across the conversation history.

PULLS:
Specific places, activities, settings, formats, or situations I seem drawn to.

PUSHES:
Specific places, activities, settings, formats, or situations I seem to avoid.

PACE:
How I seem to prefer time to feel: planned/unplanned, fast/slow, packed/open, short stops/long stays.

MOVEMENT:
How I seem to prefer getting around, if there is evidence. If not, say "light signal."

SPENDING:
How I seem to make tradeoffs around budget, if there is evidence. If not, say "light signal."

FOOD + DRINK:
Specific patterns, if present. If not, say "light signal."

SOCIAL CONTEXT:
How I seem to prefer spending time alone or with others, if there is evidence. If not, say "light signal."

BEST DETOUR SHAPE:
A concrete 45-90 minute route structure that would likely fit me.

AVOID WHEN RECOMMENDING:
Specific recommendation mistakes Knowhere should avoid.

DISTINCTIVE DETAILS:
5 details from the conversation history that make this profile feel specific to me.

CONFIDENCE:
High / Medium / Low, with one sentence explaining why.`;

import type { ParsedProfile } from "./types";

type ListProfileKey = "repeatedSignals" | "pulls" | "pushes" | "distinctive";
type StringProfileKey = Exclude<keyof ParsedProfile, ListProfileKey | "raw">;
type Section =
  | [StringProfileKey, RegExp, "string"]
  | [ListProfileKey, RegExp, "list"];

const sectionMap: Section[] = [
  ["travelStyle", /TRAVEL STYLE:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["repeatedSignals", /REPEATED SIGNALS:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "list"],
  ["pulls", /PULLS:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "list"],
  ["pushes", /PUSHES:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "list"],
  ["pace", /PACE:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["movement", /MOVEMENT:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["spending", /SPENDING:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["foodDrink", /FOOD \+ DRINK:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["socialContext", /SOCIAL CONTEXT:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["bestDetour", /BEST DETOUR SHAPE:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["avoid", /AVOID WHEN RECOMMENDING:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
  ["distinctive", /DISTINCTIVE DETAILS:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "list"],
  ["confidence", /CONFIDENCE:\s*([\s\S]*?)(?=\n[A-Z][A-Z +]+:|$)/i, "string"],
];

function toList(s: string): string[] {
  return s
    .split(/\n+/)
    .map((l) => l.replace(/^[-*•\d.)]+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function assignProfileField(
  profile: ParsedProfile,
  key: StringProfileKey | ListProfileKey,
  value: string | string[],
) {
  switch (key) {
    case "repeatedSignals":
    case "pulls":
    case "pushes":
    case "distinctive":
      profile[key] = Array.isArray(value) ? value : toList(value);
      break;
    default:
      profile[key] = Array.isArray(value) ? value.join(" ") : value;
  }
}

export function parseProfile(raw: string): ParsedProfile {
  const profile: ParsedProfile = { raw };
  for (const [key, re, kind] of sectionMap) {
    const m = raw.match(re);
    if (m && m[1]) {
      const cleaned = m[1].trim();
      assignProfileField(
        profile,
        key,
        kind === "list" ? toList(cleaned) : cleaned.replace(/\s+/g, " ").trim(),
      );
    }
  }
  return profile;
}

import type { PassportState } from "./types";

/**
 * Build a compact human-readable description to store on the user's
 * Knowhere account (PUT /users/me/description).
 */
export function buildDescriptionFromState(state: PassportState): string {
  const lines: string[] = [];
  lines.push("KNOWHERE PASSPORT");
  if (state.profile?.travelStyle) {
    lines.push("");
    lines.push("Travel style: " + state.profile.travelStyle);
  } else {
    const { picks } = state;
    const parts: string[] = [];
    if (picks.userType) parts.push(picks.userType);
    if (picks.interests.length)
      parts.push("into " + picks.interests.slice(0, 4).join(", "));
    if (picks.vibes.length)
      parts.push("vibes: " + picks.vibes.slice(0, 3).join(", "));
    if (parts.length) {
      lines.push("");
      lines.push("Travel style: " + parts.join("; "));
    }
  }
  if (state.profile?.pulls?.length) {
    lines.push("Pulls: " + state.profile.pulls.slice(0, 6).join(", "));
  }
  if (state.profile?.pushes?.length) {
    lines.push("Pushes: " + state.profile.pushes.slice(0, 6).join(", "));
  }
  if (state.profile?.pace) lines.push("Pace: " + state.profile.pace);
  if (state.picks.mobility) lines.push("Mobility: " + state.picks.mobility);
  if (state.picks.budget) lines.push("Budget: " + state.picks.budget);
  if (state.picks.avoids.length)
    lines.push("Avoid: " + state.picks.avoids.join(", "));
  if (state.trip.city) {
    const where = state.trip.area
      ? `${state.trip.city} (near ${state.trip.area})`
      : state.trip.city;
    const when = state.trip.timing ? ` — ${state.trip.timing}` : "";
    lines.push("Next city: " + where + when);
  }
  return lines.join("\n").trim();
}
