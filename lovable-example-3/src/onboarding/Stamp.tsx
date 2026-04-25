import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "coral" | "ocean" | "moss" | "gold" | "ruby" | "ink";

const tones: Record<Tone, string> = {
  coral: "text-coral",
  ocean: "text-ocean-deep",
  moss: "text-moss",
  gold: "text-gold",
  ruby: "text-ruby",
  ink: "text-ink",
};

export function Stamp({
  children,
  tone = "coral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn("stamp-circle", tones[tone], className)}>{children}</span>;
}

export function StampPill({
  children,
  tone = "coral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn("stamp-pill", tones[tone], className)}>{children}</span>;
}
