import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Stamp, StampPill } from "./Stamp";
import { Actions } from "./Actions";
import { Wave } from "./decor";
import { STARTER_DETOURS } from "./mockDetours";
import type { PassportState } from "./types";
import { knowhereApi, type ApiEvent } from "@/lib/knowhereApi";

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
    knowhereApi
      .getPassport(state.auth.username)
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

      {/* Passport card */}
      <article className="paper-card-lift overflow-hidden mb-12">
        <div className="px-7 pt-6 pb-5 flex items-start justify-between gap-6">
          <div>
            <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-1">
              Knowhere · Passport
            </div>
            <div className="font-serif text-[22px] text-ink leading-tight">
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
          <div className={stampIn ? "animate-stamp-press" : "opacity-0"}>
            <Stamp tone="coral">
              {state.trip.city || "City"}<br />· issued ·
            </Stamp>
          </div>
        </div>

        <div className="px-7 pb-6">
          <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-2">
            Travel style
          </div>
          <p className="font-serif text-[20px] leading-[1.35] text-ink max-w-[58ch]">
            {styleSummary}
          </p>
          {state.profile?.confidence && (
            <p className="text-[12px] text-ink-soft mt-3">
              Confidence — <span className="text-ink">{state.profile.confidence}</span>
            </p>
          )}
        </div>

        <div className="perforation" />

        <div className="px-7 py-5 flex items-center justify-between bg-paper">
          <div>
            <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">
              Wakes up in
            </div>
            <div className="font-serif text-[18px] text-ink mt-0.5">{state.trip.city}</div>
            {state.trip.area && (
              <div className="text-[12.5px] text-ink-soft mt-0.5">{state.trip.area}</div>
            )}
          </div>
          {state.trip.timing && (
            <div className="text-right">
              <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">When</div>
              <div className="font-serif text-[16px] text-ink mt-0.5 capitalize">
                {state.trip.timing}
              </div>
            </div>
          )}
        </div>

        {chips.length > 0 && (
          <div className="px-7 py-5 border-t border-line/70">
            <div className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-3">
              Context
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
          </div>
        )}
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

      <Actions primary={{ label: "See my passport", onClick: onEnter }} align="center" />
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
