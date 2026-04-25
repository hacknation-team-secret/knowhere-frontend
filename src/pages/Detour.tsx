// Detour tab — the user's active route and its discounts/perks.
// Stamps + saved places live further down for context.

import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Heart, MapPin, QrCode, Trophy } from "lucide-react";
import { useApp } from "./AppShell";
import { PerkPass } from "@/components/PerkPass";
import { perkById, placeById } from "@/lib/boston";
import type { PassportEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Detour() {
  const {
    profile,
    passport,
    savedPlaceIds,
    togglePlaceSaved,
    completeDetour,
    redeemPerk,
    resetProfile,
  } = useApp();
  const [openPerk, setOpenPerk] = useState<{ entry: PassportEntry; perkId: string } | null>(null);

  const active = passport.find((e) => !e.completedAt);
  const completed = passport.filter((e) => e.completedAt);
  const saved = savedPlaceIds.map((id) => placeById(id)).filter(Boolean);

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Your Detour
          </p>
          <span className="font-serif text-sm italic text-muted-foreground">Boston</span>
        </div>
        <h1 className="font-serif text-4xl leading-tight">The route, and what it unlocks.</h1>
        {profile && (
          <p className="text-sm text-muted-foreground">
            <span className="capitalize">{profile.userType}</span>
            <span className="mx-1.5">·</span>
            <span className="capitalize">{profile.vibe} vibe</span>
            <span className="mx-1.5">·</span>
            <span className="capitalize">{profile.mobility}</span>
          </p>
        )}
      </header>

      {/* Active Detour + its discounts */}
      {active ? (
        <section className="rounded-3xl border border-stamp/30 bg-card p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">
            Active route
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight">{active.detour.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {active.detour.durationMin} min · {active.detour.mode} · {active.detour.stops.length}{" "}
            stops
          </p>

          <ul className="mt-4 space-y-2">
            {active.detour.stops.map((s, i) => {
              const place = placeById(s.placeId);
              if (!place) return null;
              const perk = s.perkId ? perkById(s.perkId) : undefined;
              const redeemed = s.perkId ? active.redeemedPerkIds.includes(s.perkId) : false;
              return (
                <li
                  key={place.id}
                  className="rounded-2xl border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stamp/40 bg-stamp/10 font-serif text-[12px] text-stamp">
                      {i + 1}
                    </span>
                    <p className="flex-1 truncate font-serif text-[16px]">{place.name}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {place.neighborhood}
                    </span>
                  </div>
                  {perk && (
                    <button
                      onClick={() => setOpenPerk({ entry: active, perkId: perk.id })}
                      className={cn(
                        "mt-2 flex w-full items-center gap-3 rounded-xl border border-stamp/30 bg-stamp/5 p-3 text-left transition-colors hover:bg-stamp/10",
                        redeemed && "opacity-60",
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stamp/15 text-stamp">
                        {redeemed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <QrCode className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{perk.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {perk.windowLabel}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-[0.18em]",
                          redeemed ? "text-muted-foreground" : "text-stamp",
                        )}
                      >
                        {redeemed ? "Used" : "Tap"}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex gap-2">
            <Link
              to={`/detour/${active.detour.id}`}
              state={{ detour: active.detour }}
              className="flex-1 rounded-full border border-border bg-card py-2.5 text-center text-sm font-semibold hover:bg-secondary"
            >
              View on map
            </Link>
            <button
              onClick={() => completeDetour(active.detour.id)}
              className="flex-1 rounded-full bg-stamp py-2.5 text-sm font-semibold text-stamp-foreground hover:opacity-90"
            >
              Mark complete
            </button>
          </div>
        </section>
      ) : (
        <Empty
          title="No active Detour"
          sub="Generate one from City Pulse and add it here."
          cta="Open Pulse"
          to="/"
        />
      )}

      {/* Stamps */}
      <section>
        <SectionHeader title="Stamps" />
        {completed.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {completed.map((entry, i) => (
              <Stamp key={entry.detour.id} entry={entry} index={i} />
            ))}
          </div>
        ) : (
          <Empty title="No stamps yet" sub="Complete a Detour to collect your first." />
        )}
      </section>

      {/* Saved places */}
      <section>
        <SectionHeader title="Saved places" />
        {saved.length > 0 ? (
          <div className="mt-3 space-y-2">
            {saved.map((p) => (
              <div
                key={p!.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
              >
                <Heart className="h-4 w-4 fill-stamp text-stamp" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[16px]">{p!.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    <MapPin className="mr-0.5 inline h-3 w-3" strokeWidth={2} />
                    {p!.neighborhood}
                  </p>
                </div>
                <button
                  onClick={() => togglePlaceSaved(p!.id)}
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Nothing saved yet" sub="Tap the heart on any place." />
        )}
      </section>

      {/* Reset */}
      <div className="pt-4">
        <button
          onClick={() => {
            if (confirm("Clear your Knowhere profile and Detour history?")) resetProfile();
          }}
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
        >
          Reset demo data
        </button>
      </div>

      {openPerk && (
        <PerkPass
          perk={perkById(openPerk.perkId)!}
          alreadyRedeemed={openPerk.entry.redeemedPerkIds.includes(openPerk.perkId)}
          onClose={() => setOpenPerk(null)}
          onRedeem={() => redeemPerk(openPerk.entry.detour.id, openPerk.perkId)}
        />
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-serif text-2xl">{title}</h2>
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        — — —
      </span>
    </div>
  );
}

function Empty({
  title,
  sub,
  cta,
  to,
}: {
  title: string;
  sub: string;
  cta?: string;
  to?: string;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-border/70 bg-card/40 px-5 py-8 text-center">
      <p className="font-serif text-lg">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      {cta && to && (
        <Link
          to={to}
          className="mt-3 inline-block rounded-full bg-stamp px-4 py-2 text-xs font-semibold text-stamp-foreground"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

function Stamp({ entry, index }: { entry: PassportEntry; index: number }) {
  const rotation = ((index * 37) % 7) - 3;
  const palettes = [
    { ring: "hsl(var(--stamp))", text: "hsl(var(--stamp))" },
    { ring: "hsl(var(--accent))", text: "hsl(var(--accent))" },
    { ring: "hsl(var(--moss))", text: "hsl(var(--moss))" },
  ];
  const palette = palettes[index % palettes.length];
  const date = new Date(entry.completedAt ?? entry.addedAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div
        className="relative mx-auto flex h-28 w-28 items-center justify-center"
        style={{ ["--rot" as string]: `${rotation}deg` }}
      >
        <div
          className="animate-stamp relative flex h-full w-full items-center justify-center rounded-full border-[2.5px] text-center"
          style={{ borderColor: palette.ring, color: palette.text, opacity: 0.92 }}
        >
          <div
            className="absolute inset-1.5 rounded-full border"
            style={{ borderColor: palette.ring, opacity: 0.5 }}
          />
          <div className="px-2 leading-tight">
            <Trophy className="mx-auto h-4 w-4" strokeWidth={1.75} />
            <div className="mt-1 font-serif text-[13px] uppercase tracking-[0.06em]">
              {entry.detour.stampLabel}
            </div>
            <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.22em] opacity-70">
              Boston · {date}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 truncate text-center font-serif text-[14px] italic text-muted-foreground">
        {entry.detour.title}
      </p>
    </div>
  );
}
