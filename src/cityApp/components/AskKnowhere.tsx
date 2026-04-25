// "Ask Knowhere" — when signed in, calls POST /research on the Knowhere
// backend and shows the answer. Also offers a one-tap "regenerate route"
// that locally re-runs the deterministic generator with the same prompt.

import { useState } from "react";
import { Loader2, Send, Sparkles, MessageSquare, BookmarkPlus, Check } from "lucide-react";
import { useApp } from "@/cityApp/CityShell";
import { api } from "@/cityApp/lib/apiAdapter";
import { refineDetour } from "@/cityApp/lib/detours";
import type { Detour } from "@/cityApp/lib/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<number | undefined>();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  const submit = async (raw: string) => {
    const refinement = raw.trim();
    if (!refinement || !profile) return;

    setError(null);
    setAnswer(null);
    setThinking(true);
    setIsCaptured(false);
    try {
      // Always regenerate the route locally so the map updates instantly.
      const refined = refineDetour(baseDetour, profile, refinement);
      onResult(refined);

      // If signed in, also ask the backend for a written answer.
      if (auth.user) {
        const res = await api.research(refinement, threadId);
        setAnswer(res.answer);
        if (res.thread_id) {
          setThreadId(res.thread_id);
        }
      }
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  };

  const handleCapture = async () => {
    if (!threadId) return;
    setIsCapturing(true);
    try {
      await api.captureResearch(threadId);
      setIsCaptured(true);
      toast({
        title: "Captured to Passport",
        description: "This research session has been saved to your passport.",
      });
    } catch (e) {
      toast({
        title: "Capture failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
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
        <div className="mt-4 rounded-2xl border border-stamp/30 bg-stamp/5 p-3 relative group">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stamp">
              Knowhere says
            </p>
            {threadId && (
              <button
                onClick={handleCapture}
                disabled={isCapturing || isCaptured}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all",
                  isCaptured 
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-stamp/10 text-stamp hover:bg-stamp/20 border border-stamp/20"
                )}
              >
                {isCapturing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isCaptured ? (
                  <>
                    <Check className="h-3 w-3" />
                    Captured
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-3 w-3" />
                    Capture
                  </>
                )}
              </button>
            )}
          </div>
          <p className="mt-1 whitespace-pre-line font-serif text-[15px] leading-relaxed text-foreground/85">
            {answer}
          </p>
          <button
            onClick={() => navigate("/app/research", { state: { threadId } })}
            className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stamp hover:opacity-80 transition-opacity"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Continue in Research Chat
          </button>
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
