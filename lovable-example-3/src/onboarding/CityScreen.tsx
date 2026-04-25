import { MapPin, Search } from "lucide-react";
import { Actions } from "./Actions";
import type { Trip } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  trip: Trip;
  onChange: (trip: Trip) => void;
  onContinue: () => void;
}

const POPULAR = ["Boston", "New York", "Lisbon", "Tokyo", "Mexico City", "Berlin"];
const TIMING = [
  { id: "today", label: "Today" },
  { id: "this weekend", label: "This weekend" },
  { id: "specific dates", label: "Specific dates" },
  { id: "just exploring", label: "Just exploring" },
];
const AREAS = ["Kendall / Cambridge", "South End", "Beacon Hill", "Allston", "Seaport"];

export function CityScreen({ trip, onChange, onContinue }: Props) {
  return (
    <section>
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4">
        Add a city
      </p>
      <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-3">
        Where to next?
      </h1>
      <p className="text-[15.5px] leading-[1.55] text-ink-soft max-w-[42ch] mb-10">
        Your Passport will wake up here.
      </p>

      <Field label="City">
        <div className="paper-card flex items-center gap-3 px-5 py-4">
          <Search className="size-4 text-ink-soft shrink-0" strokeWidth={1.6} />
          <input
            value={trip.city}
            onChange={(e) => onChange({ ...trip, city: e.target.value })}
            placeholder="Type a city"
            className="flex-1 bg-transparent font-serif text-[24px] text-ink placeholder:text-ink-soft/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {POPULAR.map((c) => (
            <button
              key={c}
              onClick={() =>
                onChange({ ...trip, city: c, area: c === "Boston" ? "Kendall / Cambridge" : undefined })
              }
              data-on={trip.city === c ? "true" : "false"}
              className="chip"
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="When">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TIMING.map((t) => {
            const on = trip.timing === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange({ ...trip, timing: t.id })}
                className={cn(
                  "paper-card py-3.5 px-4 text-left transition-all",
                  on && "border-ocean bg-[hsl(var(--ocean)/0.08)]",
                )}
              >
                <div className={cn("text-[14px] font-medium", on ? "text-ocean-deep" : "text-ink")}>
                  {t.label}
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Starting near" optional>
        <div className="paper-card flex items-center gap-3 px-5 py-3.5">
          <MapPin className="size-4 text-ink-soft shrink-0" strokeWidth={1.6} />
          <input
            value={trip.area ?? ""}
            onChange={(e) => onChange({ ...trip, area: e.target.value })}
            placeholder="Neighborhood, hotel, or address"
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-soft/45 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {AREAS.map((a) => (
            <button
              key={a}
              onClick={() => onChange({ ...trip, area: a })}
              data-on={trip.area === a ? "true" : "false"}
              className="chip"
            >
              {a}
            </button>
          ))}
        </div>
      </Field>

      <Actions
        primary={{
          label: trip.city ? "Add city" : "Add a city to continue",
          onClick: onContinue,
          disabled: !trip.city,
        }}
      />
    </section>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="py-5 border-t border-line/60 first-of-type:border-t-0 first-of-type:pt-0">
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">{label}</h2>
        {optional && (
          <span className="text-[11px] text-ink-soft/60">— optional</span>
        )}
      </div>
      {children}
    </div>
  );
}
