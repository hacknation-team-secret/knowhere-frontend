// Cross-city explorer body.
// Receives a city from the parent header switcher; lets the user filter by
// category and lists all matching single-stop picks.

import { useEffect, useMemo, useRef, useState } from "react";
import { Globe2, Sparkles } from "lucide-react";
import {
  CROSS_CITY_CATEGORIES,
  picksFor,
  type CrossCityCategory,
} from "@/cityApp/lib/crossCity";
import { CityMap } from "@/cityApp/components/CityMap";
import { cn } from "@/lib/utils";

type CategoryFilter = CrossCityCategory | "all";

interface Props {
  city: string;
}

export function CityExplorer({ city }: Props) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [activePickId, setActivePickId] = useState<string | undefined>();
  const picks = useMemo(() => picksFor(city, category), [city, category]);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  // Reset selection when filters change.
  useEffect(() => {
    setActivePickId(undefined);
  }, [city, category]);

  // Scroll the active pick's card into view when a pin is tapped.
  useEffect(() => {
    if (!activePickId) return;
    const el = cardRefs.current[activePickId];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activePickId]);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">
          Curated for you
        </p>
        <h2 className="mt-0.5 font-serif text-2xl leading-tight">
          One place, somewhere else.
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Single-stop picks in {city}, tied to places you love in Boston.
        </p>
      </div>

      {/* Category filter */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Type
        </p>
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryChip
            label="All"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {CROSS_CITY_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </div>

      {/* Map */}
      <CityMap
        city={city}
        picks={picks}
        activePickId={activePickId}
        onPickTap={(id) => setActivePickId(id)}
      />

      {/* Results */}
      {picks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-5 py-8 text-center">
          <p className="font-serif text-lg">Nothing here yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No {category === "all" ? "picks" : category} in {city} — try another type.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {picks.map((pick) => (
            <article
              key={pick.id}
              ref={(el) => (cardRefs.current[pick.id] = el)}
              onClick={() => setActivePickId(pick.id)}
              className={cn(
                "cursor-pointer rounded-2xl border bg-card p-4 shadow-soft transition-all hover:shadow-lift",
                activePickId === pick.id
                  ? "border-stamp ring-2 ring-stamp/30"
                  : "border-border/60",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Globe2 className="h-3 w-3" strokeWidth={2} />
                  {pick.city} · {pick.neighborhood}
                </p>
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {pick.category}
                </span>
              </div>
              <h3 className="mt-1.5 font-serif text-[20px] leading-tight">{pick.name}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
                {pick.blurb}
              </p>
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] italic text-muted-foreground">
                <Sparkles className="h-3 w-3 text-stamp" strokeWidth={2} />
                You liked{" "}
                <span className="font-serif not-italic text-foreground/85">
                  {pick.inspiredByName}
                </span>{" "}
                in Boston.
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground/70 hover:border-foreground/30",
      )}
    >
      {label}
    </button>
  );
}
