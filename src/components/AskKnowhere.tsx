// "Ask Knowhere" — when signed in, calls POST /research on the Knowhere
// backend and shows the answer. Also offers a one-tap "regenerate route"
// that locally re-runs the deterministic generator with the same prompt.

import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useApp } from "@/pages/AppShell";
import { api } from "@/lib/api";
import { refineDetour } from "@/lib/detours";
import type { Detour } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AskKnowhereProps {
  baseDetour: Detour;
  onResult: (refined: Detour) => void;
}

const SUGGESTIONS = [
  "make it cheaper",
  "more outdoors",
  "skip the museum",
  "add a coffee stop",
];

export function AskKnowhere({ baseDetour, onResult }: AskKnowhereProps) {
  const { profile, auth, requireAuth } = useApp();
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (raw: string) => {
    const refinement = raw.trim();
    if (!refinement || !profile) return;

    setError(null);
    setAnswer(null);
    setThinking(true);
    try {
      // Always regenerate the route locally so the map updates instantly.
      const refined = refineDetour(baseDetour, profile, refinement);
      onResult(refined);

      // If signed in, also ask the backend for a written answer.
      if (auth.user) {
        const res = await api.research(refinement);
        setAnswer(res.answer);
      }
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  };

  const handleSubmit = async (raw: string) => {
    if (!auth.user) {
      const ok = await requireAuth("Sign in to use Ask Knowhere with the live model.");
      if (!ok) return;
    }
    submit(raw);
  };

  return (
    <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-secondary/40 p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-stamp" strokeWidth={2} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">
          Ask Knowhere
        </p>
        {!auth.user && (
          <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            sign-in for AI
          </span>
        )}
      </div>
      <p className="mt-1.5 font-serif text-[18px] italic leading-snug text-foreground/85">
        Tell me what to change and I'll regenerate the route.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(text);
        }}
        className="relative mt-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. avoid hills, add a bookstore…"
          className="h-11 w-full rounded-full border border-border bg-card pl-4 pr-12 text-[14px] placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
        />
        <button
          type="submit"
          disabled={!text.trim() || thinking}
          aria-label="Send"
          className={cn(
            "absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors",
            text.trim() && !thinking
              ? "bg-stamp text-stamp-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground",
          )}
        >
          {thinking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSubmit(s)}
            disabled={thinking}
            className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-foreground/70 hover:border-foreground/30"
          >
            {s}
          </button>
        ))}
      </div>

      {answer && (
        <div className="mt-4 rounded-2xl border border-stamp/30 bg-stamp/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stamp">
            Knowhere says
          </p>
          <p className="mt-1 whitespace-pre-line font-serif text-[15px] leading-relaxed text-foreground/85">
            {answer}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
