import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Actions } from "./Actions";
import { PASSPORT_PROMPT } from "./prompt";

interface Props {
  onNext: () => void;
}

export function PromptScreen({ onNext }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PASSPORT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section>
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4">
        Step one
      </p>
      <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-4">
        Bottle your travel style.
      </h1>
      <p className="text-[15.5px] leading-[1.6] text-ink-soft max-w-[44ch]">
        Hand this prompt to your favorite chatbot and paste in the user's chat history.
      </p>

      {/* Quietly tucked-away prompt: copy is the action, the text is just there if you peek. */}
      <div className="mt-8">
        <div className="relative paper-card overflow-hidden">
          <div
            className="max-h-[180px] overflow-hidden text-[12.5px] leading-[1.65] text-ink-soft/55 px-5 md:px-7 py-5 font-sans whitespace-pre-wrap select-text"
            aria-hidden={false}
          >
            {PASSPORT_PROMPT}
          </div>
          {/* Soft fade so the body text feels hidden, not loud */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(var(--paper-soft))] to-transparent" />
          <div className="absolute bottom-3 right-3">
            <Button
              size="sm"
              variant={copied ? "secondary" : "default"}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="size-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy prompt
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Actions
        primary={{
          label: copied ? "I pasted it — next" : "Next",
          onClick: onNext,
        }}
      />
    </section>
  );
}
