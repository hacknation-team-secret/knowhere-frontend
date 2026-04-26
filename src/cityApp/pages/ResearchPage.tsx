import { Bot, DollarSign, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { ResearchConversation, useResearchAgent } from "@/components/ResearchAgent";

export default function ResearchPage() {
  const { setOpen, clearThread } = useResearchAgent();

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
              <span className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft">
                Group set
              </span>
              <span className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft">
                Budget set
              </span>
              <span className="rounded-full border border-ocean/30 bg-ocean/10 px-3 py-1.5 text-xs font-medium text-ocean-deep">
                Plan in motion
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-ocean-deep px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              <Bot className="h-3.5 w-3.5" />
              Open Group Guide
            </button>
            <Link
              to="/app/wallets/shared"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Group wallet
            </Link>
            <button
              type="button"
              onClick={clearThread}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Reset plan
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
        <ResearchConversation />
      </section>
    </div>
  );
}
