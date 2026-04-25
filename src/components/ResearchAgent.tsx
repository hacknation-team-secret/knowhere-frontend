import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Bot, BookmarkPlus, Loader2, MessageSquare, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type ResearchMessage = {
  role: "user" | "assistant";
  content: string;
};

interface ResearchAgentState {
  open: boolean;
  threadId?: number;
  messages: ResearchMessage[];
  thinking: boolean;
  error: string | null;
  setOpen: (open: boolean) => void;
  sendMessage: (message: string) => Promise<void>;
  captureThread: () => Promise<void>;
  clearThread: () => void;
}

const STORAGE_KEY = "knowhere.research-agent.v1";
const SUGGESTIONS = [
  "Plan an itinerary for my group using everyone's passports.",
  "What should I do this weekend based on my passport?",
  "Analyze my travel style from my detours.",
  "Recommend a new neighborhood for me to explore.",
];

const ResearchAgentContext = createContext<ResearchAgentState | null>(null);

function loadState(): Pick<ResearchAgentState, "threadId" | "messages" | "open"> {
  if (typeof window === "undefined") {
    return { threadId: undefined, messages: [], open: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { threadId: undefined, messages: [], open: false };
    const parsed = JSON.parse(raw) as Partial<Pick<ResearchAgentState, "threadId" | "messages" | "open">>;
    return {
      threadId: typeof parsed.threadId === "number" ? parsed.threadId : undefined,
      messages: Array.isArray(parsed.messages) ? (parsed.messages as ResearchMessage[]) : [],
      open: typeof parsed.open === "boolean" ? parsed.open : false,
    };
  } catch {
    return { threadId: undefined, messages: [], open: false };
  }
}

export function ResearchAgentProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState(() => loadState());
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setOpen = (open: boolean) => setState((prev) => ({ ...prev, open }));

  const sendMessage = async (message: string) => {
    const query = message.trim();
    if (!query) return;

    if (!auth.user) {
      setError("Sign in to use the research agent.");
      return;
    }

    setError(null);
    setState((prev) => ({
      ...prev,
      open: true,
      messages: [...prev.messages, { role: "user", content: query }],
    }));
    setThinking(true);

    try {
      const res = await api.research(query, state.threadId);
      setState((prev) => ({
        ...prev,
        threadId: res.thread_id,
        messages: [...prev.messages, { role: "assistant", content: res.answer }],
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  };

  const captureThread = async () => {
    if (!state.threadId) return;
    try {
      await api.captureResearch(state.threadId);
      toast({
        title: "Captured to Passport",
        description: "This research session has been saved to your passport.",
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const clearThread = () => setState((prev) => ({ ...prev, threadId: undefined, messages: [] }));

  const value: ResearchAgentState = {
    ...state,
    thinking,
    error,
    setOpen,
    sendMessage,
    captureThread,
    clearThread,
  };

  return <ResearchAgentContext.Provider value={value}>{children}</ResearchAgentContext.Provider>;
}

export function useResearchAgent() {
  const ctx = useContext(ResearchAgentContext);
  if (!ctx) throw new Error("useResearchAgent must be used within ResearchAgentProvider");
  return ctx;
}

export function ResearchConversation({ className }: { className?: string }) {
  const [text, setText] = useState("");
  const { threadId, messages, thinking, error, sendMessage, captureThread, clearThread } = useResearchAgent();

  return (
    <section className={cn("rounded-3xl border border-border/60 bg-gradient-to-br from-card to-secondary/40 p-5 shadow-soft", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-stamp" strokeWidth={2} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">Research Agent</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {threadId ? <span>Thread {threadId}</span> : <span>New thread</span>}
          <button type="button" onClick={clearThread} className="rounded-full border border-border px-2 py-1 hover:bg-secondary">
            Reset
          </button>
        </div>
      </div>

      <p className="mt-1.5 font-serif text-[18px] italic leading-snug text-foreground/85">
        Keep this separate from group setup. Ask for research, context, and next steps.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void sendMessage(s)}
            disabled={thinking}
            className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-foreground/70 hover:border-foreground/30"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-[52vh] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-4 py-6 text-center">
            <Bot className="mx-auto h-5 w-5 text-stamp" />
            <p className="mt-2 text-sm text-muted-foreground">Ask a question to start the thread.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn("flex gap-3 max-w-[90%]", message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", message.role === "user" ? "bg-ocean/10 text-ocean-deep" : "bg-stamp/10 text-stamp") }>
                {message.role === "user" ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn("rounded-2xl p-4 text-[15px] leading-relaxed", message.role === "user" ? "bg-ocean-deep text-white rounded-tr-none" : "bg-card border border-line rounded-tl-none font-serif italic whitespace-pre-line") }>
                {message.content}
              </div>
            </div>
          ))
        )}

        {thinking && (
          <div className="flex gap-3 mr-auto">
            <div className="h-8 w-8 rounded-full bg-stamp/10 text-stamp flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-card border border-line rounded-2xl rounded-tl-none p-4">
              <Loader2 className="h-4 w-4 animate-spin text-stamp" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(text);
          setText("");
        }}
        className="relative mt-4"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about your research context…"
          className="h-14 w-full rounded-2xl border border-line bg-card pl-5 pr-14 text-[15px] placeholder:text-ink-soft/50 focus:border-stamp focus:outline-none focus:ring-4 focus:ring-stamp/5 shadow-sm"
        />
        <button
          type="submit"
          disabled={!text.trim() || thinking}
          className={cn(
            "absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-xl transition-all",
            text.trim() && !thinking ? "bg-stamp text-white hover:opacity-90 scale-100" : "bg-line text-ink-soft/30 scale-95",
          )}
        >
          <Send className="h-5 w-5" strokeWidth={2} />
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void captureThread()}
          disabled={!threadId}
          className="inline-flex items-center gap-2 rounded-full border border-stamp/30 bg-stamp/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp disabled:opacity-40"
        >
          <BookmarkPlus className="h-3.5 w-3.5" />
          Capture
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </section>
  );
}

export function ResearchAgentLauncher() {
  const { open, setOpen } = useResearchAgent();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg">
          <MessageSquare className="h-4 w-4" />
          Research Agent
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-stamp" />
            Research Agent
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ResearchConversation className="border-0 bg-transparent p-0 shadow-none" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
