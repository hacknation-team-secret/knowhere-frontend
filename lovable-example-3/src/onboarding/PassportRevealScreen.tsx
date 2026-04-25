import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Star } from "./decor";
import { supabase } from "@/integrations/supabase/client";
import type { PassportState } from "./types";

interface Props {
  state: PassportState;
  onContinue: () => void;
}

type Status = "loading" | "ready" | "error";

export function PassportRevealScreen({ state, onContinue }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const fired = useRef(false);

  const ownerName = displayName(state);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "generate-passport",
          { body: { name: ownerName } },
        );
        if (cancelled) return;
        if (error) throw error;
        if (!data?.imageUrl) throw new Error("No image returned");
        setImageUrl(data.imageUrl);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error ? e.message : "Couldn't render your passport.";
        setError(msg);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ownerName]);

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
        <div className="relative aspect-square">
          {status === "loading" && (
            <div className="absolute inset-0 paper-card-lift grid place-items-center overflow-hidden">
              <div className="text-center px-6">
                <Loader2
                  className="size-7 text-ocean mx-auto mb-3 animate-spin"
                  strokeWidth={1.5}
                />
                <p className="font-serif text-[18px] text-ink leading-tight">
                  Pressing your stamp…
                </p>
                <p className="text-[12.5px] text-ink-soft mt-1.5 max-w-[34ch] mx-auto">
                  Drying the ink, aligning the stars.
                </p>
              </div>
            </div>
          )}

          {status === "ready" && imageUrl && (
            <img
              src={imageUrl}
              alt={`Knowhere passport for ${ownerName}`}
              className="w-full h-full object-contain rounded-[18px] animate-fade-up"
            />
          )}

          {status === "error" && (
            <div className="absolute inset-0 paper-card grid place-items-center p-6">
              <div className="text-center">
                <p className="font-serif text-[20px] text-ink mb-2">
                  Couldn't print this one.
                </p>
                <p className="text-[13px] text-ink-soft mb-4 max-w-[36ch] mx-auto">
                  {error}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    fired.current = false;
                    setStatus("loading");
                  }}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={onContinue}
            disabled={status === "loading"}
            className="group"
          >
            <Sparkles className="size-4" strokeWidth={1.8} />
            <span className="font-serif italic text-[16px]">
              {status === "loading" ? "Stamping…" : "Where to next?"}
            </span>
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
