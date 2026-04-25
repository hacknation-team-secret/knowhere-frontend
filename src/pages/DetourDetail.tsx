// Detour detail — full route view: stops, perks, bluebikes pickup/dropoff,
// add to passport, refine.

import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bike, Footprints, MapPin, Sparkles, Check, Gift } from "lucide-react";
import { useApp } from "./AppShell";
import { InteractiveBostonMap } from "@/components/InteractiveBostonMap";

import { AskKnowhere } from "@/components/AskKnowhere";
import { perkById, placeById, stationById } from "@/lib/boston";
import type { Detour } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DetourDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { passport, addDetourToPassport } = useApp();

  // Detour comes from navigation state OR from the passport history.
  const detour: Detour | undefined =
    (location.state as { detour?: Detour } | null)?.detour ??
    passport.find((e) => e.detour.id === id)?.detour;

  if (!detour) {
    return (
      <div className="space-y-4 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          This Detour isn't loaded. Generate a fresh one from City Pulse.
        </p>
      </div>
    );
  }

  const inPassport = passport.some((e) => e.detour.id === detour.id);
  const stops = detour.stops.map((s) => ({ stop: s, place: placeById(s.placeId) }));
  const perks = detour.perkIds.map((id) => perkById(id)).filter(Boolean);
  const pickup = detour.pickupStationId ? stationById(detour.pickupStationId) : undefined;
  const dropoff = detour.dropoffStationId ? stationById(detour.dropoffStationId) : undefined;

  const ModeIcon = detour.mode === "walk" ? Footprints : Bike;

  return (
    <div className="space-y-6">
      {/* Top */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stamp">
          Detour
        </p>
        <h1 className="font-serif text-4xl leading-tight">{detour.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ModeIcon className="h-4 w-4" strokeWidth={1.75} />
            {detour.mode}
          </span>
          <span>·</span>
          <span>{detour.durationMin} minutes</span>
          <span>·</span>
          <span>{detour.stops.length} stops</span>
        </div>
      </header>

      {/* Context chips */}
      <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {detour.contextChips.map((c) => (
          <span
            key={c}
            className="shrink-0 whitespace-nowrap rounded-full border border-stamp/30 bg-stamp/10 px-3 py-1.5 text-[12px] font-medium tracking-tight text-stamp"
          >
            {c}
          </span>
        ))}
      </div>

      {/* Map */}
      <InteractiveBostonMap detour={detour} height="lg" />

      {/* Rationale */}
      <p className="font-serif text-[18px] italic leading-snug text-foreground/85">
        {detour.rationale}
      </p>

      {/* Bluebikes strip */}
      {(pickup || dropoff) && (
        <section className="rounded-3xl border border-accent/30 bg-accent/5 p-5">
          <div className="flex items-center gap-2 text-accent">
            <Bike className="h-4 w-4" strokeWidth={2} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              Bluebikes
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {pickup && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Pickup
                </p>
                <p className="mt-1 font-serif text-lg">{pickup.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pickup.bikesAvailable} bikes available
                </p>
              </div>
            )}
            {dropoff && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Dropoff
                </p>
                <p className="mt-1 font-serif text-lg">{dropoff.name}</p>
                <p className="text-xs text-muted-foreground">
                  {dropoff.docksAvailable} docks open
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stops */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          The route
        </p>
        <ol className="space-y-3">
          {stops.map(({ stop, place }, i) => {
            if (!place) return null;
            const perk = stop.perkId ? perkById(stop.perkId) : undefined;
            return (
              <li
                key={place.id}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stamp/40 bg-stamp/10 font-serif text-[15px] text-stamp">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl leading-tight">{place.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <MapPin className="mr-0.5 inline h-3 w-3" strokeWidth={2} />
                      {place.neighborhood} · {place.hours} ·{" "}
                      {"$".repeat(place.priceLevel)}
                    </p>
                    <p className="mt-2 font-serif text-[15px] italic leading-snug text-foreground/75">
                      "{stop.why}"
                    </p>
                    {perk && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-stamp/30 bg-stamp/5 p-3">
                        <Gift className="mt-0.5 h-4 w-4 shrink-0 text-stamp" strokeWidth={2} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-stamp">
                            {perk.title}
                          </p>
                          <p className="text-[12px] text-foreground/70">
                            {perk.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Stamp preview */}
      <section className="rounded-3xl border border-dashed border-stamp/40 bg-stamp/5 p-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">
          Earn a stamp
        </p>
        <p className="mt-1.5 font-serif text-2xl">{detour.stampLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete the Detour to add it to your Passport.
        </p>
      </section>

      {/* Add to Passport */}
      {!inPassport ? (
        <button
          onClick={() => addDetourToPassport(detour)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-stamp py-3.5 text-sm font-semibold tracking-wide text-stamp-foreground hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          Add to Passport
        </button>
      ) : (
        <button
          onClick={() => navigate("/passport")}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full border border-stamp bg-card py-3.5 text-sm font-semibold tracking-wide text-stamp",
          )}
        >
          <Check className="h-4 w-4" strokeWidth={2} />
          In your Passport · View
        </button>
      )}

      {/* Refine */}
      <AskKnowhere
        baseDetour={detour}
        onResult={(d) => navigate(`/detour/${d.id}`, { state: { detour: d } })}
      />

      {/* Perks summary */}
      {perks.length > 0 && (
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Perks attached
          </p>
          <div className="space-y-2">
            {perks.map(
              (p) =>
                p && (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-[13px]"
                  >
                    <Gift className="h-4 w-4 text-stamp" strokeWidth={2} />
                    <span className="flex-1 truncate">
                      <span className="font-semibold">{p.merchantName}</span> ·{" "}
                      <span className="text-foreground/75">{p.title}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {p.windowLabel}
                    </span>
                  </div>
                ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
