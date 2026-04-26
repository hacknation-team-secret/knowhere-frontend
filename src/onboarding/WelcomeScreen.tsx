import { Button } from "@/components/ui/button";
import { Star } from "./decor";
import { ArrowRight } from "lucide-react";

export function WelcomeScreen({ onNext, onSignIn }: { onNext: () => void; onSignIn: () => void }) {
  return (
    <section className="grid md:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center min-h-[60vh]">
      <div className="relative">
        <h1 className="font-serif text-[52px] md:text-[68px] leading-[0.98] text-ink mb-6">
          Know where
          <br />
          <span className="relative inline-block">
            to go.
            <Star className="absolute -top-3 -right-7 size-4 text-gold" />
          </span>
        </h1>

        <p className="text-[16px] leading-[1.55] text-ink-soft max-w-[42ch]">
          A passport for the cities you haven't met yet, with a copilot for the friends you bring along.
        </p>

        <div className="mt-10 flex flex-col items-start gap-3">
          <Button
            size="xl"
            onClick={onNext}
            className="group relative pr-8 shadow-[0_8px_24px_-8px_hsl(var(--ocean)/0.45)] hover:shadow-[0_12px_32px_-10px_hsl(var(--ocean)/0.55)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Star className="size-3.5 text-gold mr-1 -ml-1 transition-transform group-hover:rotate-12" />
            <span className="font-serif italic text-[17px]">Start wandering</span>
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
          </Button>
          <p className="px-1 text-[13px] text-ink-soft/80">
            Already have an account?{" "}
            <span
              role="link"
              tabIndex={0}
              onClick={onSignIn}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSignIn();
                }
              }}
              className="group inline-flex cursor-pointer items-center gap-1 font-serif italic text-ink-soft transition-colors hover:text-ink focus:outline-none focus:text-ink"
            >
              Sign in
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
            </span>
          </p>
        </div>
      </div>

      <div className="relative hidden md:grid grid-cols-6 grid-rows-6 gap-3 h-[480px]">
        <IllustrationFrame
          art={<CafeIllustration />}
          caption="a slow morning"
          className="col-span-4 row-span-4 col-start-3 row-start-1"
        />
        <IllustrationFrame
          art={<ParkIllustration />}
          caption="a side-loop home"
          className="col-span-3 row-span-3 col-start-1 row-start-4"
        />
        <IllustrationFrame
          art={<BookstoreIllustration />}
          caption="lamp-lit corners"
          className="col-span-3 row-span-2 col-start-4 row-start-5"
        />
      </div>

      <div className="md:hidden">
        <IllustrationFrame
          art={<CafeIllustration />}
          caption="a slow morning"
          className="w-full aspect-[4/5]"
        />
      </div>
    </section>
  );
}

function IllustrationFrame({
  art,
  caption,
  className = "",
}: {
  art: React.ReactNode;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`photo-card relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        {art}
      </div>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 px-3 py-2 text-paper-soft/95 text-[11.5px] tracking-[0.16em] uppercase bg-gradient-to-t from-ink/55 via-ink/15 to-transparent">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function CafeIllustration() {
  return (
    <svg viewBox="0 0 360 440" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="cafe-sky-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(42 100% 96%)" />
          <stop offset="55%" stopColor="hsl(38 72% 80%)" />
          <stop offset="100%" stopColor="hsl(24 64% 58%)" />
        </linearGradient>
      </defs>
      <rect width="360" height="440" fill="url(#cafe-sky-main)" rx="28" />
      <circle cx="62" cy="72" r="54" fill="hsl(45 100% 97% / 0.85)" />
      <path d="M188 46h124v250H188z" fill="hsl(28 52% 69%)" />
      <path d="M208 76h84v158h-84z" fill="hsl(24 43% 28%)" />
      <path d="M198 100h112v18H198z" fill="hsl(38 76% 84%)" />
      <path d="M154 140h74v102h-74z" fill="hsl(31 58% 84%)" />
      <path d="M144 136h92l-10 34h-92z" fill="hsl(36 86% 77%)" />
      <path d="M144 168h86l-10 74h-86z" fill="hsl(33 78% 61%)" />
      <circle cx="110" cy="318" r="36" fill="hsl(19 45% 47%)" />
      <circle cx="266" cy="330" r="32" fill="hsl(18 42% 43%)" />
      <path d="M0 334c54-18 109-14 161 10 45 20 101 25 199-2v98H0z" fill="hsl(31 53% 44%)" />
      <g stroke="hsl(29 33% 29%)" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M66 266h30l12 42H54z" />
        <path d="M268 278h28l10 34h-50z" />
      </g>
      <g fill="hsl(84 27% 41%)">
        <circle cx="84" cy="286" r="14" />
        <circle cx="104" cy="280" r="10" />
        <circle cx="250" cy="292" r="12" />
      </g>
    </svg>
  );
}

function ParkIllustration() {
  return (
    <svg viewBox="0 0 300 380" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="park-sky-main" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(46 100% 97%)" />
          <stop offset="100%" stopColor="hsl(89 37% 74%)" />
        </linearGradient>
      </defs>
      <rect width="300" height="380" fill="url(#park-sky-main)" rx="26" />
      <path d="M136 0h28v380h-28z" fill="hsl(35 36% 28%)" />
      <path d="M38 18h20v362H38zM240 22h18v358h-18z" fill="hsl(37 34% 30%)" />
      <g fill="hsl(103 34% 29%)">
        <circle cx="150" cy="72" r="84" />
        <circle cx="62" cy="92" r="56" />
        <circle cx="250" cy="104" r="58" />
        <circle cx="42" cy="162" r="44" />
        <circle cx="264" cy="172" r="44" />
      </g>
      <path d="M120 210c23 37 37 68 30 170h-10c-5-78-18-121-38-170z" fill="hsl(35 36% 28%)" />
      <path d="M180 210c-23 37-37 68-30 170h10c5-78 18-121 38-170z" fill="hsl(35 36% 28%)" />
      <path d="M110 210c20 32 54 56 80 64l-40 106h-2z" fill="hsl(44 100% 93% / 0.78)" />
      <path d="M126 380c8-98 16-140 24-170 8 28 16 72 24 170z" fill="hsl(48 90% 89% / 0.85)" />
      <circle cx="152" cy="318" r="8" fill="hsl(44 49% 57%)" />
    </svg>
  );
}

function BookstoreIllustration() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="books-glow-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(31 45% 24%)" />
          <stop offset="100%" stopColor="hsl(28 41% 16%)" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#books-glow-main)" rx="26" />
      <ellipse cx="150" cy="54" rx="52" ry="30" fill="hsl(44 94% 77%)" />
      <path d="M110 54h80l-18 66h-44z" fill="hsl(41 88% 69%)" />
      <path d="M24 70h70v210H24zM206 70h70v210H206z" fill="hsl(168 31% 23%)" />
      <path d="M110 118h80v162h-80z" fill="hsl(28 31% 37%)" />
      <g stroke="hsl(45 18% 78% / 0.45)" strokeWidth="2">
        <path d="M48 82v190M71 82v190M228 82v190M251 82v190" />
        <path d="M110 156h80M110 200h80M110 242h80" />
      </g>
      <g fill="hsl(37 59% 66%)">
        <rect x="36" y="92" width="12" height="42" rx="3" />
        <rect x="52" y="96" width="10" height="40" rx="3" />
        <rect x="66" y="88" width="14" height="48" rx="3" />
        <rect x="220" y="92" width="12" height="42" rx="3" />
        <rect x="236" y="96" width="10" height="40" rx="3" />
        <rect x="250" y="88" width="14" height="48" rx="3" />
      </g>
      <path d="M122 280c6-28 14-48 28-56 14 8 22 28 28 56z" fill="hsl(36 41% 22%)" />
    </svg>
  );
}
