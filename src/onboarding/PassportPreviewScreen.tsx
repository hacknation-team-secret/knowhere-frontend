import { useEffect, useMemo, useState } from "react";
import { Camera, MapPin, Sparkles, Stars } from "lucide-react";
import { Stamp } from "./Stamp";
import { Actions } from "./Actions";
import { Compass, Spark, Wave } from "./decor";
import type { PassportState } from "./types";

interface Props {
  state: PassportState;
  onEnter: () => void;
}

export function PassportPreviewScreen({ state, onEnter }: Props) {
  const [stampIn, setStampIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStampIn(true), 250);
    return () => clearTimeout(t);
  }, []);

  const styleSummary =
    state.profile?.travelStyle ||
    quickPicksSummary(state) ||
    "Still finding your shape.";

  const chips = buildContextChips(state);
  const visualWords = buildVisualWords(state);
  const editorialWords = buildEditorialWords(state);
  const displayName = state.name || state.auth?.username || "Traveler";
  const palette = useMemo(() => paletteFromState(state), [state]);
  const heroEmoji = heroEmojiFromState(state);
  const heroImage = heroImageFromState(state);

  return (
    <section>
      <div className="mb-10 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-soft">
          Your Passport
        </p>
        <h1 className="font-serif text-[40px] leading-[1.02] text-ink md:text-[52px]">
          Stamped & ready.
        </h1>
        <Wave className="mx-auto mt-4 w-20 text-coral/60" />
      </div>

      <article className="paper-card-lift mb-12 overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden border-b border-line/70 lg:border-b-0 lg:border-r">
            <div
              className="absolute inset-0 opacity-95"
              style={{
                background: `radial-gradient(circle at 18% 20%, ${palette[0]} 0%, transparent 28%), radial-gradient(circle at 82% 16%, ${palette[1]} 0%, transparent 26%), linear-gradient(145deg, ${palette[2]} 0%, rgba(255,251,243,0.97) 48%, ${palette[3]} 100%)`,
              }}
            />
            <div className="absolute -left-8 top-10 h-28 w-28 rounded-full border border-white/40 bg-white/10 blur-[1px]" />
            <div className="absolute right-8 top-12 text-white/60">
              <Compass className="size-16" />
            </div>
            <div className="absolute left-[18%] top-[34%] text-white/70">
              <Spark className="size-5 rotate-12" />
            </div>
            <div className="absolute right-[20%] bottom-[26%] text-white/75">
              <Spark className="size-4 -rotate-6" />
            </div>

            <div className="relative flex min-h-[340px] flex-col justify-between p-7 md:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="mb-2 text-[10.5px] uppercase tracking-[0.22em] text-white/78">
                    Knowhere · Passport
                  </div>
                  <div className="max-w-[10ch] font-serif text-[34px] leading-[0.98] text-white md:text-[42px]">
                    {displayName}
                  </div>
                  <div className="mt-3 text-[12px] uppercase tracking-[0.2em] text-white/74">
                    {state.trip.city} · {state.trip.timing || "right now"}
                  </div>
                </div>
                <div className={stampIn ? "animate-stamp-press" : "opacity-0"}>
                  <Stamp tone="gold" className="border-white/65 text-white">
                    {state.trip.city || "City"}
                    <br />
                    · issued ·
                  </Stamp>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div className="max-w-[18rem] rounded-[24px] border border-white/35 bg-white/16 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-white/80">
                    <Sparkles className="size-3.5" strokeWidth={1.8} />
                    Travel read
                  </div>
                  <p className="mt-2 font-serif text-[24px] leading-[1.02] text-white md:text-[28px]">
                    {truncate(styleSummary, 42)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {visualWords.map((word) => (
                      <span
                        key={word}
                        className="rounded-full border border-white/35 bg-white/16 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/88"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative ml-auto flex w-full max-w-[220px] items-end justify-end">
                  <div className="absolute inset-0 rounded-[28px] bg-white/10 blur-2xl" />
                  <div className="relative flex aspect-[4/5] w-full items-end overflow-hidden rounded-[28px] border border-white/35 bg-white/12 p-4 backdrop-blur-sm">
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{
                        background: `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.2) 100%), radial-gradient(circle at 50% 18%, ${palette[1]} 0%, transparent 26%), linear-gradient(145deg, ${palette[2]} 0%, ${palette[3]} 100%)`,
                      }}
                    />
                    <div className="relative flex h-full w-full flex-col justify-between">
                      <div className="flex items-center justify-between text-white/78">
                        <Stars className="size-4" strokeWidth={1.8} />
                        <span className="text-[10px] uppercase tracking-[0.18em]">Editorial Cut</span>
                      </div>
                      <div className="mt-6 flex-1 overflow-hidden rounded-[22px] border border-white/25 bg-white/10">
                        <img
                          src={heroImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-white">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-white/74">Mood</div>
                          <div className="font-serif text-[20px] leading-none">{heroEmoji} {editorialWords[0] || "Glow"}</div>
                        </div>
                        <Camera className="size-4 text-white/78" strokeWidth={1.8} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-paper-soft p-7 md:p-8">
            <div className="flex items-start justify-end">
              <PostcardMeta
                username={state.auth?.username}
                userId={state.auth?.userId}
                confidence={confidenceBadge(state.profile?.confidence)}
              />
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.2em] text-ink-soft">
                  Preference
                </div>
                <p className="max-w-[14ch] font-serif text-[30px] leading-[0.95] text-ink md:text-[38px]">
                  {truncate(styleSummary, 34)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {editorialWords.map((word) => (
                    <span key={word} className="chip">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-line/70 bg-paper p-4">
                <div className="mb-2 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-ink-soft">
                  <MapPin className="size-3.5" strokeWidth={1.8} />
                  Destination
                </div>
                <div className="font-serif text-[28px] leading-none text-ink">{state.trip.city}</div>
                <div className="mt-2 text-[13px] text-ink-soft">{state.trip.area || "City center"}</div>
                <div className="mt-3 text-[12px] uppercase tracking-[0.18em] text-ink-soft">
                  {state.trip.timing || "right now"}
                </div>
              </div>
            </div>

            {chips.length > 0 ? (
              <div className="mt-6">
                <div className="mb-3 text-[10.5px] uppercase tracking-[0.2em] text-ink-soft">
                  Signals
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip) => (
                    <span key={chip} className="chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-[22px] border border-line/70 bg-card p-4">
              <div className="mb-2 text-[10.5px] uppercase tracking-[0.2em] text-ink-soft">
                Big read
              </div>
              <p className="max-w-[18ch] font-serif text-[24px] leading-[1.03] text-ink">
                {truncate(styleSummary, 52)}
              </p>
            </div>
          </div>
        </div>
      </article>

      <Actions primary={{ label: "Go Knowhere →", onClick: onEnter }} align="center" />
    </section>
  );
}

function PostcardMeta({
  username,
  userId,
  confidence,
}: {
  username?: string;
  userId?: number;
  confidence?: string;
}) {
  return (
    <div className="min-w-[150px] rounded-[18px] border border-line/70 bg-paper p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">Issued</div>
      <div className="mt-1 font-serif text-[18px] text-ink">
        {username ? `@${username}` : `KH-${passportNo()}`}
      </div>
      {userId ? (
        <div className="mt-1 text-[12px] text-ink-soft">
          No. KH-{String(userId).padStart(6, "0")}
        </div>
      ) : null}
      {confidence ? (
        <div className="mt-3 text-[12px] text-ink-soft">{confidence}</div>
      ) : null}
    </div>
  );
}

function buildContextChips(state: PassportState): string[] {
  const chips: string[] = [];
  if (state.picks.userType) chips.push(`👤 ${state.picks.userType}`);
  state.picks.interests.slice(0, 2).forEach((interest) => chips.push(`✨ ${shortLabel(interest)}`));
  state.picks.vibes.slice(0, 2).forEach((vibe) => chips.push(`💫 ${shortLabel(vibe)}`));
  if (state.picks.mobility) chips.push(`🚶 ${shortLabel(state.picks.mobility)}`);
  if (state.picks.budget) chips.push(`💸 ${shortLabel(state.picks.budget)}`);
  state.profile?.pulls?.slice(0, 2).forEach((pull) => chips.push(`📍 ${shortLabel(pull)}`));
  return chips.slice(0, 6);
}

function buildVisualWords(state: PassportState): string[] {
  const words = [
    ...(state.profile?.pulls ?? []),
    ...(state.profile?.distinctive ?? []),
    ...(state.picks.vibes ?? []),
    ...(state.picks.interests ?? []),
  ]
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return Array.from(new Set(words)).map(shortLabel).slice(0, 3);
}

function buildEditorialWords(state: PassportState): string[] {
  return [
    state.picks.vibes[0],
    state.picks.interests[0],
    state.profile?.pulls?.[0],
    state.profile?.pace,
  ]
    .filter(Boolean)
    .map((item) => shortLabel(String(item)))
    .slice(0, 3);
}

function paletteFromState(state: PassportState): [string, string, string, string] {
  const source = JSON.stringify({
    style: state.profile?.travelStyle,
    pulls: state.profile?.pulls,
    pace: state.profile?.pace,
    city: state.trip.city,
    name: state.name,
  });
  const sum = Array.from(source).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes: Array<[string, string, string, string]> = [
    ["rgba(127,166,199,0.82)", "rgba(216,168,79,0.58)", "rgba(14,79,85,0.92)", "rgba(255,251,243,0.88)"],
    ["rgba(196,90,67,0.72)", "rgba(127,166,199,0.52)", "rgba(139,47,73,0.88)", "rgba(255,248,236,0.92)"],
    ["rgba(85,107,62,0.76)", "rgba(216,168,79,0.48)", "rgba(47,127,134,0.88)", "rgba(255,251,243,0.94)"],
    ["rgba(14,79,85,0.8)", "rgba(196,90,67,0.52)", "rgba(127,166,199,0.9)", "rgba(255,249,240,0.94)"],
  ];
  return palettes[sum % palettes.length];
}

function quickPicksSummary(state: PassportState): string | null {
  const { picks } = state;
  if (!picks.userType && picks.interests.length === 0 && picks.vibes.length === 0) return null;
  const parts: string[] = [];
  if (picks.userType) parts.push(`A ${picks.userType}`);
  if (picks.interests.length) parts.push(`drawn to ${picks.interests.slice(0, 2).join(", ")}`);
  if (picks.vibes.length) parts.push(`looking for ${picks.vibes.slice(0, 1).join(" and ")}`);
  return `${parts.join(" ")}.`;
}

function passportNo() {
  return Math.floor(100000 + Math.random() * 899999);
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
}

function shortLabel(value: string) {
  return value
    .replace(/^light signal$/i, "emerging")
    .replace(/\b(private villas?|luxury hotels?|residences?)\b/gi, "private stays")
    .replace(/\b(restaurants?)\b/gi, "dining")
    .replace(/\b(poolside settings?)\b/gi, "poolside")
    .replace(/\b(strong visual identity)\b/gi, "visuals")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function confidenceBadge(confidence?: string) {
  if (!confidence) return "Medium read.";
  if (/high/i.test(confidence)) return "High confidence.";
  if (/low/i.test(confidence)) return "Low confidence.";
  return "Medium confidence.";
}

function heroEmojiFromState(state: PassportState) {
  const source = `${state.profile?.travelStyle ?? ""} ${state.profile?.pulls?.join(" ") ?? ""}`.toLowerCase();
  if (source.includes("beach") || source.includes("pool")) return "🌴";
  if (source.includes("hotel") || source.includes("luxury") || source.includes("villa")) return "🥂";
  if (source.includes("restaurant") || source.includes("dining") || source.includes("food")) return "🍸";
  if (source.includes("museum") || source.includes("gallery") || source.includes("art")) return "🖼️";
  return "✨";
}

function heroImageFromState(state: PassportState) {
  const source = `${state.profile?.travelStyle ?? ""} ${state.profile?.pulls?.join(" ") ?? ""}`.toLowerCase();
  if (source.includes("beach") || source.includes("pool")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80";
  }
  if (source.includes("hotel") || source.includes("villa") || source.includes("luxury")) {
    return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80";
  }
  if (source.includes("restaurant") || source.includes("dining") || source.includes("food")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80";
  }
  if (source.includes("museum") || source.includes("gallery") || source.includes("art")) {
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";
  }
  return "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80";
}
