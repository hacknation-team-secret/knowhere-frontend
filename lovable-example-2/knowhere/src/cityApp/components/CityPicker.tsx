// City switcher — replaces the static "Boston" header.
// Boston has full Pulse data; other cities show curated single-stop picks.

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { CROSS_CITY_LIST } from "@/cityApp/lib/crossCity";
import { cn } from "@/lib/utils";

const FLAGS: Record<string, string> = {
  Boston: "🇺🇸",
  Paris: "🇫🇷",
  "New York": "🇺🇸",
  Tokyo: "🇯🇵",
  Lisbon: "🇵🇹",
  "San Francisco": "🇺🇸",
  London: "🇬🇧",
  Berlin: "🇩🇪",
};

export const ALL_CITIES = ["Boston", ...CROSS_CITY_LIST];

interface Props {
  city: string;
  onChange: (city: string) => void;
}

export function CityPicker({ city, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        City Pulse
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 flex items-baseline gap-2 text-left"
      >
        <span className="text-3xl leading-none">{FLAGS[city] ?? "🌍"}</span>
        <h1 className="font-serif text-4xl leading-none">{city}</h1>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stamp">
          {city === "Boston" ? "Live" : "Picks"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-lift">
          {ALL_CITIES.map((c) => {
            const active = c === city;
            const isLive = c === "Boston";
            return (
              <button
                key={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  active ? "bg-stamp/10" : "hover:bg-secondary",
                )}
              >
                <span className="text-xl">{FLAGS[c] ?? "🌍"}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[16px] leading-tight">{c}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {isLive ? "Full pulse · routes · perks" : "Curated single-stop picks"}
                  </p>
                </div>
                {active && <Check className="h-4 w-4 text-stamp" strokeWidth={2.25} />}
              </button>
            );
          })}
          <div className="mt-1.5 border-t border-border/60 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <Globe2 className="h-3 w-3" strokeWidth={2} />
              More cities coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
