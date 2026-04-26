import { useEffect, useMemo, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Stamp, StampPill } from "./Stamp";
import { Actions } from "./Actions";
import { Compass, Spark, Wave } from "./decor";
import { STARTER_DETOURS } from "./mockDetours";
import type { PassportState } from "./types";
import { api, type ApiEvent } from "@/lib/api";

interface Props {
  state: PassportState;
  onEnter: () => void;
}

const STAMP_TONES = ["coral", "ocean", "moss", "gold"] as const;

export function PassportPreviewScreen({ state, onEnter }: Props) {
  const [stampIn, setStampIn] = useState(false);
  const [attended, setAttended] = useState<ApiEvent[]>([]);
  useEffect(() => {
    const t = setTimeout(() => setStampIn(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Pull live passport data from the API once we have a signed-in user.
  useEffect(() => {
    if (!state.auth) return;
    let cancelled = false;
    api
      .passport(state.auth.username)
      .then((p) => {
        if (!cancelled) setAttended(p.attended_events ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [state.auth]);

  const styleSummary =
    state.profile?.travelStyle ||
    quickPicksSummary(state) ||
    "Still finding your shape — a fine place to start.";

  const chips = buildContextChips(state);
  const stampCount = attended.length;
  const visualWords = buildVisualWords(state);
  const displayName = state.name || state.auth?.username || "Traveler";
  const palette = useMemo(() => paletteFromState(state), [state]);

  return (
    <section>
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-3">
          Your Passport
        </p>
        <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink">
          Stamped & ready.
        </h1>
        <Wave className="mx-auto mt-4 w-20 text-coral/60" />
      </div>

      <article className="paper-card-lift overflow-hidden mb-12">
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

            <div className="relative min-h-[340px] p-7 md:p-8 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-[10.5px] tracking-[0.22em] uppercase text-white/78 mb-2">
                    Knowhere · Passport image
                  </div>
                  <div className="font-serif text-[34px] md:text-[42px] leading-[0.98] text-white max-w-[10ch]">
                    {displayName}
                  </div>
                  <div className="mt-3 text-[12px] uppercase tracking-[0.2em] text-white/74">
                    {state.trip.city} · {state.trip.timing || "right now"}
                  </div>
                </div>
                <div className={stampIn ? "animate-stamp-press" : "opacity-0"}>
                  <Stamp tone="gold" className="border-white/65 text-white">
                    {state.trip.city || "City"}<br />· issued ·
                  </Stamp>
                </div>
              </div>

              <div className="max-w-[18rem] rounded-[24px] border border-white/35 bg-white/16 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-white/80">
                  <Sparkles className="size-3.5" strokeWidth={1.8} />
                  Visual ingest
                </div>
                <p className="mt-2 font-serif text-[20px] leading-[1.18] text-white">
                  {truncate(styleSummary, 92)}
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
            </div>
          </div>

          <div className="bg-paper-soft p-7 md:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-1">
                  Passport holder
                </div>
                <div className="font-serif text-[24px] text-ink leading-tight">
                  {displayName}
                </div>
                <div className="text-[11.5px] text-ink-soft mt-1">
                  {state.auth?.username
                    ? `@${state.auth.username}`
                    : `No. KH-${passportNo()}`}
                </div>
                {state.auth && (
                  <div className="text-[11.5px] text-ink-soft mt-1">
                    Issued · No. KH-{String(state.auth.userId).padStart(6, "0")}
                  </div>
                )}
              </div>
              <PostcardMeta
                city={state.trip.city}
                area={state.trip.area}
                timing={state.trip.timing}
                confidence={state.profile?.confidence}
              />
            </div>

            <div className="mt-7">
              <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-2">
                Parsed into your passport
              </div>
              <p className="font-serif text-[22px] leading-[1.25] text-ink max-w-[24ch]">
                {truncate(styleSummary, 120)}
              </p>
            </div>

            {chips.length > 0 && (
              <div className="mt-6">
                <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-3">
                  Captured signals
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((c) => (
                    <span key={c} className="chip">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Stamp collection */}
      <section className="mb-12">
        <SectionHeader
          title="Stamp collection"
          right={`${stampCount} / 12`}
        />
        <div className="paper-card p-5 grid grid-cols-6 md:grid-cols-8 gap-4">
          {Array.from({ length: 12 }).map((_, i) => {
            const ev = attended[i];
            if (ev) {
              const tone = STAMP_TONES[i % STAMP_TONES.length];
              return (
                <div
                  key={ev.id}
                  className="aspect-square grid place-items-center"
                  title={ev.title}
                >
                  <Stamp tone={tone}>
                    {ev.title.split(" ").slice(0, 2).join(" ")}
                  </Stamp>
                </div>
              );
            }
            return (
              <div
                key={i}
                className="aspect-square rounded-full border border-dashed border-line grid place-items-center"
              >
                <span className="text-[10px] text-ink-soft/45 font-serif italic">
                  empty
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Starter Detours */}
      <section className="mb-6">
        <SectionHeader title="Starter Detours" right="picked for you" />
        <div className="grid md:grid-cols-2 gap-5">
          {STARTER_DETOURS.map((d, i) => (
            <article key={d.id} className="photo-card group">
              <div className="relative">
                <img
                  src={d.image}
                  alt={d.title}
                  loading="lazy"
                  width={800}
                  height={1024}
                  className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute top-3 left-3">
                  <StampPill tone={STAMP_TONES[i % STAMP_TONES.length]}>{d.stamp}</StampPill>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-[20px] text-ink leading-tight mb-1.5">
                  {d.title}
                </h3>
                <p className="text-[13px] text-ink-soft leading-snug mb-3">
                  {d.stops.join(" · ")}
                </p>
                <div className="flex items-center gap-1.5 text-[12px] text-ink-soft">
                  <Clock className="size-3" strokeWidth={1.6} /> {d.duration}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Actions primary={{ label: "Start the group plan", onClick: onEnter }} align="center" />
    </section>
  );
}

function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">{title}</h2>
      {right && <span className="text-[11.5px] text-ink-soft">{right}</span>}
    </div>
  );
}

function PostcardMeta({
  city,
  area,
  timing,
  confidence,
}: {
  city: string;
  area?: string;
  timing?: string;
  confidence?: string;
}) {
  return (
    <div className="rounded-[18px] border border-line/70 bg-paper p-4 min-w-[150px]">
      <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Destination</div>
      <div className="mt-1 font-serif text-[18px] text-ink">{city}</div>
      {area && <div className="mt-1 text-[12px] text-ink-soft">{area}</div>}
      {timing && <div className="mt-3 text-[12px] text-ink-soft capitalize">{timing}</div>}
      {confidence && <div className="mt-1 text-[12px] text-ink-soft">{confidence}</div>}
    </div>
  );
}

function buildContextChips(state: PassportState): string[] {
  const chips: string[] = [];
  if (state.picks.userType) chips.push(state.picks.userType);
  state.picks.interests.slice(0, 4).forEach((i) => chips.push(i));
  state.picks.vibes.slice(0, 3).forEach((v) => chips.push(v));
  if (state.picks.mobility) chips.push(state.picks.mobility);
  if (state.picks.budget) chips.push(state.picks.budget + " budget");
  state.picks.avoids.slice(0, 2).forEach((a) => chips.push("no " + a));
  state.profile?.pulls?.slice(0, 3).forEach((p) => chips.push(p));
  return chips.slice(0, 12);
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

  return Array.from(new Set(words)).slice(0, 5);
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
    ["rgba(127, 166, 199, 0.82)", "rgba(216, 168, 79, 0.58)", "rgba(14, 79, 85, 0.92)", "rgba(255, 251, 243, 0.88)"],
    ["rgba(196, 90, 67, 0.72)", "rgba(127, 166, 199, 0.52)", "rgba(139, 47, 73, 0.88)", "rgba(255, 248, 236, 0.92)"],
    ["rgba(85, 107, 62, 0.76)", "rgba(216, 168, 79, 0.48)", "rgba(47, 127, 134, 0.88)", "rgba(255, 251, 243, 0.94)"],
    ["rgba(14, 79, 85, 0.8)", "rgba(196, 90, 67, 0.52)", "rgba(127, 166, 199, 0.9)", "rgba(255, 249, 240, 0.94)"],
  ];

  return palettes[sum % palettes.length];
}

function quickPicksSummary(state: PassportState): string | null {
  const { picks } = state;
  if (!picks.userType && picks.interests.length === 0 && picks.vibes.length === 0) return null;
  const parts: string[] = [];
  if (picks.userType) parts.push(`A ${picks.userType}`);
  if (picks.interests.length) parts.push(`drawn to ${picks.interests.slice(0, 3).join(", ")}`);
  if (picks.vibes.length) parts.push(`looking for something ${picks.vibes.slice(0, 2).join(" and ")}`);
  return parts.join(" ") + ".";
}

function passportNo() {
  return Math.floor(100000 + Math.random() * 899999);
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}
