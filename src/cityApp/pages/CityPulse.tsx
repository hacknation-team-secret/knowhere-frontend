// City Pulse — primary surface.
// Every context chip is editable: tapping any chip opens a picker, and any
// change re-runs the deterministic Detour generator + re-renders the map.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Cloud, CloudRain, Compass, Heart, MapPin, Snowflake, Sparkles, Sun, Timer } from "lucide-react";
import { useApp } from "@/cityApp/CityShell";
import { InteractiveBostonMap } from "@/cityApp/components/InteractiveBostonMap";
import { EditableChip } from "@/cityApp/components/EditableChip";
import { AskKnowhere } from "@/cityApp/components/AskKnowhere";
import { CityPicker } from "@/cityApp/components/CityPicker";
import { CityExplorer } from "@/cityApp/components/CityExplorer";
import { NEIGHBORHOODS, placeById } from "@/cityApp/lib/boston";
import { generateDetour } from "@/cityApp/lib/detours";
import {
  MINUTE_OPTIONS,
  MOBILITY_OPTIONS,
  TIME_OPTIONS,
  VIBE_OPTIONS,
  WEATHER_OPTIONS,
  defaultPulseContext,
  type PulseContext,
  type Weather,
} from "@/cityApp/lib/context";
import type { Detour, Neighborhood } from "@/cityApp/lib/types";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const NEIGHBORHOOD_NAMES = NEIGHBORHOODS.map((n) => n.name) as Neighborhood[];

const WEATHER_ICON: Record<Weather, JSX.Element> = {
  clear: <Sun className="h-3.5 w-3.5" strokeWidth={2} />,
  cloudy: <Cloud className="h-3.5 w-3.5" strokeWidth={2} />,
  "rain soon": <CloudRain className="h-3.5 w-3.5" strokeWidth={2} />,
  cold: <Snowflake className="h-3.5 w-3.5" strokeWidth={2} />,
};

export default function CityPulse() {
  const { profile, savedPlaceIds, togglePlaceSaved, addDetourToPassport, auth, requireAuth } = useApp();
  const navigate = useNavigate();

  const [ctx, setCtx] = useState<PulseContext>(() =>
    defaultPulseContext(
      (profile?.startingLocation as Neighborhood) ?? "Kendall Square",
      profile?.vibe ?? "local",
      profile?.mobility ?? "bike",
    ),
  );
  const [city, setCity] = useState("Boston");

  // Suppress unused warnings — requireAuth wired for future event-attend flow.
  void requireAuth;
  const update = <K extends keyof PulseContext>(key: K, value: PulseContext[K]) =>
    setCtx((prev) => ({ ...prev, [key]: value }));

  // Generate the primary Detour from the live context.
  const primaryDetour: Detour = useMemo(
    () =>
      generateDetour({
        profile: profile!,
        neighborhood: ctx.neighborhood,
        minutesAvailable: ctx.minutes,
        vibeOverride: ctx.vibe,
        mobilityOverride: ctx.mobility,
        weather: ctx.weather,
        timeOfDay: ctx.timeOfDay,
      }),
    [profile, ctx],
  );

  const stops = primaryDetour.stops
    .map((s) => placeById(s.placeId))
    .filter(Boolean);

  // Cross-city mode: show curated picks instead of the live Boston Pulse.
  if (city !== "Boston") {
    return (
      <div className="space-y-6">
        <header className="pt-1">
          <CityPicker city={city} onChange={setCity} />
        </header>
        <CityExplorer city={city} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* City header with switcher */}
      <header className="pt-1">
        <CityPicker city={city} onChange={setCity} />
      </header>

      {/* Editable context */}
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Tap to change context
        </p>
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <EditableChip
            label={`Near ${ctx.neighborhood}`}
            icon={<MapPin className="h-3.5 w-3.5" strokeWidth={2} />}
            value={ctx.neighborhood}
            options={NEIGHBORHOOD_NAMES}
            onChange={(v) => update("neighborhood", v)}
          />
          <EditableChip
            label={`${ctx.minutes} min free`}
            icon={<Timer className="h-3.5 w-3.5" strokeWidth={2} />}
            value={ctx.minutes}
            options={MINUTE_OPTIONS}
            formatOption={(v) => `${v} minutes`}
            onChange={(v) => update("minutes", v)}
            tone="accent"
          />
          <EditableChip
            label={ctx.weather === "rain soon" ? "Rain in ~1 hr" : ctx.weather}
            icon={WEATHER_ICON[ctx.weather]}
            value={ctx.weather}
            options={WEATHER_OPTIONS}
            onChange={(v) => update("weather", v)}
            tone="accent"
          />
          <EditableChip
            label={`${ctx.timeOfDay[0].toUpperCase()}${ctx.timeOfDay.slice(1)}`}
            value={ctx.timeOfDay}
            options={TIME_OPTIONS}
            onChange={(v) => update("timeOfDay", v)}
            tone="moss"
          />
          <EditableChip
            label={`Wants ${ctx.vibe}`}
            value={ctx.vibe}
            options={VIBE_OPTIONS}
            onChange={(v) => update("vibe", v)}
          />
          <EditableChip
            label={`By ${ctx.mobility}`}
            icon={<Compass className="h-3.5 w-3.5" strokeWidth={2} />}
            value={ctx.mobility}
            options={MOBILITY_OPTIONS}
            onChange={(v) => update("mobility", v)}
            tone="moss"
          />
        </div>
      </section>

      {/* Map */}
      <InteractiveBostonMap
        highlight={ctx.neighborhood}
        detour={primaryDetour}
        savedPlaceIds={savedPlaceIds}
        onNeighborhoodTap={(n) => update("neighborhood", n)}
        onPlaceTap={(id) => togglePlaceSaved(id)}
      />

      {/* Primary Detour */}
      <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">
            Recommended for you
          </p>
          <span className="font-serif text-sm italic text-muted-foreground">
            {primaryDetour.durationMin} min · {primaryDetour.mode}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-2xl leading-tight">{primaryDetour.title}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">
          {primaryDetour.rationale}
        </p>

        <ul className="mt-4 space-y-2.5">
          {stops.map((p, i) => (
            <li key={p!.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stamp/40 bg-stamp/10 font-serif text-[13px] text-stamp">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-serif text-[17px]">{p!.name}</p>
                  <button
                    onClick={() => togglePlaceSaved(p!.id)}
                    className="shrink-0"
                    aria-label="Save place"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        savedPlaceIds.includes(p!.id)
                          ? "fill-stamp text-stamp"
                          : "text-muted-foreground/60",
                      )}
                      strokeWidth={1.75}
                    />
                  </button>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  <MapPin className="mr-0.5 inline h-3 w-3" strokeWidth={2} />
                  {p!.neighborhood} · {p!.hours}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => navigate(`/detour/${primaryDetour.id}`, { state: { detour: primaryDetour } })}
            className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold tracking-wide hover:bg-secondary"
          >
            View route
          </button>
          <button
            onClick={async () => {
              addDetourToPassport(primaryDetour);
              // Best-effort backend persistence when signed in.
              if (auth.user) {
                try {
                  const { api } = await import("@/cityApp/lib/apiAdapter");
                  // No real event_ids yet — backend persists name/description only.
                  await api.createDetour(primaryDetour.title, [], primaryDetour.rationale);
                } catch {
                  /* surface later via toast if needed */
                }
              }
              navigate(`/detour/${primaryDetour.id}`, { state: { detour: primaryDetour } });
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-stamp py-3 text-sm font-semibold tracking-wide text-stamp-foreground hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            Add to Passport
          </button>
        </div>
      </section>

      {/* Cross-city picks moved into the header city switcher. */}


      {/* Ask Knowhere */}
      <AskKnowhere
        baseDetour={primaryDetour}
        onResult={(d) => navigate(`/detour/${d.id}`, { state: { detour: d } })}
      />

      {/* Research Agent CTA */}
      <Link
        to="/app/research"
        className="flex items-center justify-between rounded-3xl border border-line bg-paper-soft p-6 shadow-sm hover:border-stamp/40 transition-colors group"
      >
        <div className="flex gap-4 items-center">
          <div className="h-12 w-12 rounded-full bg-stamp/10 text-stamp flex items-center justify-center shrink-0">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-ink">Chat with the Research Agent</h3>
            <p className="text-sm text-ink-soft">Get deep insights based on your passport history.</p>
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}
