import { Bot, Clock3, DollarSign, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { ResearchConversation, useResearchAgent } from "@/components/ResearchAgent";
import { Button } from "@/components/ui/button";

export default function ResearchPage() {
  const { setOpen, clearThread } = useResearchAgent();
  const pulse = ["📍 Kendall / Cambridge", "⏱️ 90 min free", "☀️ Clear skies", "🚲 Bluebikes nearby"];
  const demoStops = [
    { title: "Cafe reset", meta: "45 min · $28 pp", icon: "☕️" },
    { title: "Gallery drift", meta: "75 min · $42 pp", icon: "🖼️" },
    { title: "Harbor glow", meta: "60 min · $18 pp", icon: "🌅" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-soft">
              Plan
            </p>
            <h1 className="mt-1 font-serif text-3xl text-ink">Elegant detours, ready for the group.</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Group Guide is working from your shared passport, people, and budget to shape one clean plan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip">Group set</span>
              <span className="chip">Budget set</span>
              <span className="chip">Plan in motion</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pulse.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button type="button" variant="passport" onClick={() => setOpen(true)}>
              <Bot className="h-3.5 w-3.5" />
              Open Group Guide
            </Button>
            <Link
              to="/app/wallets/shared"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Group wallet
            </Link>
            <Button type="button" variant="outline" onClick={clearThread}>
              <Sparkles className="h-3.5 w-3.5" />
              Reset plan
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <MapPin className="h-4 w-4 text-stamp" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              City Pulse
            </p>
          </div>
          <h2 className="mt-3 font-serif text-2xl text-ink">Kendall Golden Hour Loop</h2>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink-soft">
            A polished route for coffee, culture, and one scenic exhale before dinner.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <PlanMiniMetric label="Stops" value="3" />
            <PlanMiniMetric label="Window" value="3 hrs" />
            <PlanMiniMetric label="Budget" value="$88 pp" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <Clock3 className="h-4 w-4 text-ocean-deep" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Suggested flow
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {demoStops.map((stop, index) => (
              <div key={stop.title} className="rounded-[1.25rem] border border-line/70 bg-paper p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stamp/10 text-lg">
                      {stop.icon}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Stop {index + 1}</p>
                      <p className="font-serif text-xl text-ink">{stop.title}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ocean-deep">
                    {stop.meta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
        <ResearchConversation />
      </section>
    </div>
  );
}

function PlanMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-line/70 bg-paper p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className="mt-2 font-serif text-[24px] leading-none text-ink">{value}</p>
    </div>
  );
}
