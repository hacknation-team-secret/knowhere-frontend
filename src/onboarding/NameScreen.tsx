import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Star } from "./decor";

interface Props {
  initialName?: string;
  onContinue: (name: string) => void;
}

export function NameScreen({ initialName = "", onContinue }: Props) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();
  const canContinue = trimmed.length > 0;

  const submit = () => {
    if (canContinue) onContinue(trimmed);
  };

  return (
    <section className="relative">
      <div className="max-w-[560px]">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4 inline-flex items-center gap-1.5">
          <Star className="size-3 text-gold" />
          a small introduction
        </p>

        <h1 className="font-serif text-[40px] md:text-[54px] leading-[1.02] text-ink mb-8">
          Who do we have the pleasure of meeting?
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="relative"
        >
          <label htmlFor="name" className="sr-only">
            Your name
          </label>
          <div className="relative border-b-2 border-line focus-within:border-ocean transition-colors pb-2">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoFocus
              maxLength={40}
              className="w-full bg-transparent font-serif text-[28px] md:text-[36px] text-ink placeholder:text-ink-soft/35 focus:outline-none"
            />
          </div>

          <div className="mt-10">
            <Button type="submit" size="xl" disabled={!canContinue} className="group disabled:opacity-40">
              <span className="font-serif italic text-[16px]">
                {canContinue ? `Hello, ${trimmed.split(" ")[0]}` : "Continue"}
              </span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
