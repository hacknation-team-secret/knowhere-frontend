import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stamp } from "./Stamp";
import { Star } from "./decor";
import type { PassportState } from "./types";

interface Props {
  state: PassportState;
  onContinue: () => void;
}

export function PassportRevealScreen({ state, onContinue }: Props) {
  const ownerName = displayName(state);
  const city = state.trip.city || "Somewhere";

  return (
    <section className="text-center">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-3">
          Your passport
        </p>
        <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink">
          Pressed & issued.
        </h1>
        <p className="text-[14.5px] text-ink-soft mt-3 max-w-[42ch] mx-auto">
          A one-of-one cover for {ownerName}.
        </p>
      </div>

      <div className="mx-auto max-w-[560px]">
        <div className="paper-card-lift relative overflow-hidden p-8 text-left aspect-[4/5] flex flex-col justify-between animate-fade-up">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(hsl(var(--ink)) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.24em] uppercase text-ink-soft">
                Knowhere passport
              </p>
              <h2 className="mt-5 font-serif text-[46px] leading-none text-ink">
                {ownerName}
              </h2>
            </div>
            <Stamp tone="coral">
              {city}<br />· issued ·
            </Stamp>
          </div>

          <div className="relative grid grid-cols-2 gap-4 border-t border-line pt-5">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Base city</p>
              <p className="mt-1 font-serif text-[20px] text-ink">{city}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Serial</p>
              <p className="mt-1 font-serif text-[20px] text-ink">KH-{String(state.auth?.userId ?? 104729).padStart(6, "0")}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={onContinue} className="group">
            <Sparkles className="size-4" strokeWidth={1.8} />
            <span className="font-serif italic text-[16px]">Where to next?</span>
          </Button>
        </div>

        <p className="text-[11px] tracking-[0.18em] uppercase text-ink-soft/80 mt-5 inline-flex items-center gap-1.5">
          <Star className="size-3 text-gold" />
          one of one
        </p>
      </div>
    </section>
  );
}

function displayName(state: PassportState): string {
  return (
    state.name?.trim() ||
    state.auth?.username?.trim() ||
    state.auth?.email?.split("@")[0] ||
    "wanderer"
  );
}
