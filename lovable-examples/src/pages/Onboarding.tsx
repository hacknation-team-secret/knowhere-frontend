// Onboarding — visual, fast, preference-led. Five short steps.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useApp } from "./AppShell";
import { NEIGHBORHOODS } from "@/lib/boston";
import type {
  Budget,
  Interest,
  Mobility,
  UserType,
  Vibe,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const USER_TYPES: { value: UserType; label: string; sub: string }[] = [
  { value: "visitor", label: "Visitor", sub: "Just here for a bit" },
  { value: "local", label: "Local", sub: "Boston is home" },
  { value: "student", label: "Student", sub: "Class, food, repeat" },
  { value: "commuter", label: "Commuter", sub: "In and out" },
];

const INTERESTS: Interest[] = [
  "coffee",
  "bookstores",
  "museums",
  "food",
  "parks",
  "music",
  "shopping",
  "nightlife",
  "architecture",
  "art",
];

const MOBILITY: { value: Mobility; label: string }[] = [
  { value: "walk", label: "Walk" },
  { value: "bike", label: "Bike" },
  { value: "transit", label: "Transit" },
  { value: "mixed", label: "Mix it up" },
];

const BUDGETS: { value: Budget; label: string; sub: string }[] = [
  { value: "low", label: "Low", sub: "Free to ~$15" },
  { value: "medium", label: "Medium", sub: "Up to ~$40" },
  { value: "flexible", label: "Flexible", sub: "Worth-it splurges" },
];

const VIBES: Vibe[] = ["local", "iconic", "quiet", "social", "scenic", "family", "hidden gem"];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [userType, setUserType] = useState<UserType | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [mobility, setMobility] = useState<Mobility | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [startingLocation, setStartingLocation] = useState<string>("Kendall Square");

  const steps = [
    { title: "Who's exploring?", canNext: () => userType !== null },
    { title: "What pulls you in?", canNext: () => interests.length >= 2 },
    { title: "How do you move?", canNext: () => mobility !== null },
    { title: "What's the budget?", canNext: () => budget !== null },
    { title: "Pick a vibe + a spot to start.", canNext: () => vibe !== null },
  ];

  const finish = () => {
    if (!userType || !mobility || !budget || !vibe) return;
    completeOnboarding({
      userType,
      interests,
      mobility,
      budget,
      vibe,
      startingLocation,
    });
    navigate("/");
  };

  const toggleInterest = (i: Interest) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  return (
    <div className="min-h-dvh bg-background paper-grain">
      <div className="mx-auto flex min-h-dvh max-w-[520px] flex-col px-5 py-8">
        {/* Top brand strip */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-stamp">
              Knowhere · Boston
            </p>
            <p className="mt-1 font-serif text-sm italic text-muted-foreground">
              Know where to go. <span className="opacity-70">More cities soon.</span>
            </p>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {step + 1} / {steps.length}
          </p>
        </header>

        {/* Step progress */}
        <div className="mt-6 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-stamp" : "bg-border",
              )}
            />
          ))}
        </div>

        {/* Step body */}
        <div key={step} className="mt-10 flex-1 animate-fade-up space-y-5">
          <h2 className="font-serif text-3xl leading-tight">{steps[step].title}</h2>

          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {USER_TYPES.map((t) => (
                <SelectCard
                  key={t.value}
                  active={userType === t.value}
                  onClick={() => setUserType(t.value)}
                >
                  <p className="font-serif text-xl">{t.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
                </SelectCard>
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">
                Pick at least two. We'll use these to shape every Detour.
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const active = interests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm capitalize transition-colors",
                        active
                          ? "border-stamp bg-stamp text-stamp-foreground"
                          : "border-border bg-card text-foreground/80 hover:border-foreground/30",
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {MOBILITY.map((m) => (
                <SelectCard
                  key={m.value}
                  active={mobility === m.value}
                  onClick={() => setMobility(m.value)}
                >
                  <p className="font-serif text-xl">{m.label}</p>
                </SelectCard>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2.5">
              {BUDGETS.map((b) => (
                <SelectCard
                  key={b.value}
                  active={budget === b.value}
                  onClick={() => setBudget(b.value)}
                  full
                >
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-xl">{b.label}</p>
                    <p className="text-xs text-muted-foreground">{b.sub}</p>
                  </div>
                </SelectCard>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Vibe
                </p>
                <div className="flex flex-wrap gap-2">
                  {VIBES.map((v) => (
                    <button
                      key={v}
                      onClick={() => setVibe(v)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm capitalize transition-colors",
                        vibe === v
                          ? "border-stamp bg-stamp text-stamp-foreground"
                          : "border-border bg-card text-foreground/80 hover:border-foreground/30",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Starting in
                </p>
                <div className="flex flex-wrap gap-2">
                  {NEIGHBORHOODS.map((n) => (
                    <button
                      key={n.name}
                      onClick={() => setStartingLocation(n.name)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                        startingLocation === n.name
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground/70 hover:border-foreground/30",
                      )}
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-secondary"
            >
              Back
            </button>
          )}
          <button
            disabled={!steps[step].canNext()}
            onClick={() => (step === steps.length - 1 ? finish() : setStep((s) => s + 1))}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold transition-colors",
              steps[step].canNext()
                ? "bg-stamp text-stamp-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {step === steps.length - 1 ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.25} />
                Open Knowhere
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectCard({
  children,
  active,
  onClick,
  full,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-card p-4 text-left shadow-soft transition-all",
        active
          ? "border-stamp ring-2 ring-stamp/30"
          : "border-border/60 hover:-translate-y-0.5 hover:shadow-lift",
        full && "w-full",
      )}
    >
      {children}
    </button>
  );
}
