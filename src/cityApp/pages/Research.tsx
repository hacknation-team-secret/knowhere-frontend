import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Sparkles, User, Bot, BookmarkPlus, Check } from "lucide-react";
import { useApp } from "@/cityApp/CityShell";
import { api } from "@/cityApp/lib/apiAdapter";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What should I do this weekend based on my passport?",
  "Analyze my travel style from my detours.",
  "Recommend a new neighborhood for me to explore.",
  "How many stamps have I collected so far?",
];

export default function Research() {
  const { auth, requireAuth, passport } = useApp();
  const { toast } = useToast();
  const location = useLocation();
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<number | undefined>(
    location.state?.threadId
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  // If we have a threadId but no messages, we could fetch history.
  // For now, let's at least maintain the ID for continuity.
  useEffect(() => {
    if (threadId && messages.length === 0) {
      // In a real app, we'd fetch the thread history here.
      // api.getThread(threadId).then(t => setMessages(t.messages.map(m => ({role: m.role, content: m.content}))))
    }
  }, [threadId]);

  const submit = async (raw: string) => {
    const query = raw.trim();
    if (!query) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setText("");
    setThinking(true);
    setIsCaptured(false);

    try {
      if (!auth.user) {
        const ok = await requireAuth("Sign in to chat with the research agent.");
        if (!ok) {
          setThinking(false);
          return;
        }
      }

      const res = await api.chat(query, threadId);
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
      if (res.thread_id) {
        setThreadId(res.thread_id);
      }
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

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-3xl mx-auto">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-stamp" strokeWidth={2} />
            <h1 className="font-serif text-3xl text-ink">Research Agent</h1>
          </div>
          <p className="mt-2 text-ink-soft italic font-serif">
            Insights based on your passport and collected detours.
          </p>
        </div>

        {threadId && messages.length > 0 && (
          <button
            onClick={handleCapture}
            disabled={isCapturing || isCaptured}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all",
              isCaptured 
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-stamp/10 text-stamp hover:bg-stamp/20 border border-stamp/20"
            )}
          >
            {isCapturing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isCaptured ? (
              <>
                <Check className="h-4 w-4" />
                Captured to Passport
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" />
                Capture Session
              </>
            )}
          </button>
        )}
      </header>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-line"
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stamp/10 text-stamp mb-4">
              <Bot className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl text-ink">How can I help you explore?</h2>
            <p className="text-ink-soft text-sm mt-1 max-w-sm mx-auto">
              I can analyze your {passport.length} collected detours and suggest what's next for your journey.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left p-3 rounded-xl border border-line bg-card hover:border-stamp/50 hover:bg-stamp/5 transition-colors text-[13px] text-ink-soft leading-snug"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              m.role === "user" ? "bg-ocean/10 text-ocean-deep" : "bg-stamp/10 text-stamp"
            )}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn(
              "rounded-2xl p-4 text-[15px] leading-relaxed",
              m.role === "user" 
                ? "bg-ocean-deep text-white rounded-tr-none" 
                : "bg-card border border-line rounded-tl-none font-serif italic whitespace-pre-line"
            )}>
              {m.content}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex gap-3 mr-auto">
            <div className="h-8 w-8 rounded-full bg-stamp/10 text-stamp flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-card border border-line rounded-2xl rounded-tl-none p-4">
              <Loader2 className="h-4 w-4 animate-spin text-stamp" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="relative"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about your travel style or next adventure…"
          className="h-14 w-full rounded-2xl border border-line bg-card pl-5 pr-14 text-[15px] placeholder:text-ink-soft/50 focus:border-stamp focus:outline-none focus:ring-4 focus:ring-stamp/5 shadow-sm"
        />
        <button
          type="submit"
          disabled={!text.trim() || thinking}
          className={cn(
            "absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-xl transition-all",
            text.trim() && !thinking
              ? "bg-stamp text-white hover:opacity-90 scale-100"
              : "bg-line text-ink-soft/30 scale-95"
          )}
        >
          <Send className="h-5 w-5" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
