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
    <figure className={`relative overflow-visible ${className}`}>
      <div className="absolute inset-0">
        {art}
      </div>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 px-1 py-1 text-[10.5px] tracking-[0.16em] uppercase text-ink-soft/80">
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
        <linearGradient id="cafe-window" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(36 100% 98%)" />
          <stop offset="100%" stopColor="hsl(37 80% 91%)" />
        </linearGradient>
        <linearGradient id="cafe-wall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(36 85% 95%)" />
          <stop offset="100%" stopColor="hsl(31 78% 90%)" />
        </linearGradient>
        <filter id="cafe-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <g filter="url(#cafe-shadow)" opacity="0.5">
        <ellipse cx="222" cy="340" rx="96" ry="22" fill="hsl(28 54% 62% / 0.22)" />
        <ellipse cx="294" cy="315" rx="28" ry="18" fill="hsl(86 32% 58% / 0.2)" />
      </g>
      <g stroke="hsl(21 16% 21%)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M172 54c25-10 61-10 92 0" fill="none" />
        <path d="M169 56c-5 42-5 92 0 148" fill="url(#cafe-wall)" />
        <path d="M266 55c6 44 5 94 0 149" fill="none" />
        <rect x="188" y="73" width="61" height="112" rx="8" fill="url(#cafe-window)" />
        <path d="M219 74v109M188 110h61M188 147h61" fill="none" />
        <path d="M150 196c40-18 89-18 126 0" fill="none" />
        <path d="M146 212c43-9 88-10 133-2" fill="none" />
        <ellipse cx="226" cy="238" rx="35" ry="16" fill="hsl(33 92% 88%)" />
        <path d="M194 238c3 12 17 22 32 22 17 0 31-8 35-22" fill="none" />
        <path d="M225 260v57M225 285l-20 34M225 285l22 34M225 285v35" fill="none" />
        <rect x="92" y="250" width="45" height="53" rx="5" fill="hsl(33 10% 96%)" />
        <path d="M92 255l-23 44M137 255l24 43M86 302c17 6 36 7 55 2" fill="none" />
        <rect x="143" y="246" width="42" height="55" rx="8" fill="hsl(30 15% 97%)" />
        <path d="M146 301c14 5 28 5 36 0" fill="none" />
        <circle cx="294" cy="168" r="20" fill="hsl(89 22% 69%)" />
        <path d="M290 188c-7 40-8 80-4 121M311 187c4 40 6 79 5 120" fill="none" />
        <path d="M287 308c9 5 18 5 28 0" fill="none" />
      </g>
      <g fill="hsl(89 39% 67%)" stroke="hsl(21 16% 21%)" strokeWidth="1.3">
        <path d="M288 149c12-12 23-19 35-24-6 15-17 26-31 32" />
        <path d="M302 171c15-7 31-10 44-8-10 10-25 15-42 16" />
        <path d="M286 181c-10-11-18-22-24-36 14 7 23 18 31 30" />
        <path d="M303 201c15 0 28 4 40 11-13 3-27 3-39-2" />
        <path d="M285 216c-12 3-22 9-31 18 12 2 23-1 36-8" />
      </g>
      <g fill="hsl(30 90% 82%)" stroke="hsl(21 16% 21%)" strokeWidth="1.2">
        <path d="M247 214c8-3 15-3 22 0 0 9-4 15-11 18-7-3-11-9-11-18z" />
        <path d="M214 217c8-3 15-3 22 0 0 8-4 14-11 17-7-3-11-8-11-17z" />
      </g>
    </svg>
  );
}

function ParkIllustration() {
  return (
    <svg viewBox="0 0 300 380" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="park-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <g filter="url(#park-shadow)" opacity="0.5">
        <ellipse cx="128" cy="316" rx="82" ry="22" fill="hsl(32 46% 62% / 0.18)" />
      </g>
      <g>
        <circle cx="125" cy="118" r="54" fill="hsl(90 50% 82%)" />
        <circle cx="165" cy="112" r="47" fill="hsl(95 42% 79%)" />
        <circle cx="99" cy="150" r="42" fill="hsl(92 55% 85%)" />
        <circle cx="172" cy="149" r="38" fill="hsl(88 38% 76%)" />
      </g>
      <g stroke="hsl(21 16% 21%)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M135 300c-4-54 1-102 15-147" />
        <path d="M149 156c20 33 32 81 36 144" />
        <path d="M149 157c-20-25-42-42-69-54" />
        <path d="M150 158c25-24 53-40 86-49" />
        <path d="M145 138c-12-28-24-47-43-63" />
        <path d="M151 138c20-24 44-41 73-52" />
        <path d="M71 149c33-23 65-33 100-34" />
        <path d="M80 118c31-17 64-25 98-23" />
        <path d="M101 93c20-11 46-14 72-11" />
        <path d="M184 94c24 4 47 10 65 21" />
        <path d="M206 126c19 7 34 17 45 32" />
        <path d="M215 161c13 8 24 19 34 33" />
        <path d="M83 293h82M75 305h96" />
        <path d="M84 294c-6 11-9 22-8 35M163 294c8 10 11 22 11 35" />
        <path d="M84 328c28 5 60 5 93 0" />
      </g>
      <g fill="hsl(32 60% 73%)" stroke="hsl(21 16% 21%)" strokeWidth="1.7" strokeLinejoin="round">
        <path d="M83 286h79l-6 13H90z" />
        <path d="M89 299h68v10H89z" />
        <path d="M92 309v25M154 309v25" />
      </g>
    </svg>
  );
}

function BookstoreIllustration() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="book-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <g filter="url(#book-shadow)" opacity="0.45">
        <ellipse cx="160" cy="258" rx="78" ry="18" fill="hsl(28 44% 65% / 0.18)" />
      </g>
      <g>
        <rect x="64" y="44" width="62" height="204" rx="14" fill="hsl(196 36% 83%)" />
        <rect x="195" y="41" width="69" height="206" rx="15" fill="hsl(197 34% 85%)" />
        <path d="M134 66c30-19 68-16 106 9 4 56-1 110-17 161-28-10-50-30-66-60-15-28-22-61-23-110z" fill="hsl(35 84% 84%)" />
        <path d="M137 66c15 18 26 43 33 74" fill="none" stroke="hsl(21 16% 21%)" strokeWidth="2.1" />
        <circle cx="198" cy="82" r="11" fill="hsl(36 94% 73%)" />
        <rect x="151" y="202" width="28" height="36" rx="2" fill="hsl(32 84% 71%)" />
        <rect x="179" y="196" width="24" height="42" rx="2" fill="hsl(28 60% 65%)" />
        <rect x="206" y="210" width="18" height="28" rx="2" fill="hsl(35 43% 78%)" />
      </g>
      <g stroke="hsl(21 16% 21%)" strokeWidth="2.05" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M65 49c21-10 43-11 62-8" />
        <path d="M67 50c-5 57-4 116 0 177" />
        <path d="M127 41c6 60 7 119 3 180" />
        <path d="M196 47c19-5 42-5 67 1" />
        <path d="M197 47c0 58 3 118 9 179" />
        <path d="M264 47c4 57 4 117 0 179" />
        <path d="M98 62v166M79 81h16M79 104h16M79 127h16M79 150h16M79 173h16" />
        <path d="M105 80h16M105 103h16M105 126h16M105 149h16M105 172h16" />
        <path d="M223 61v165M205 79h16M205 102h16M205 125h16M205 148h16M205 171h16" />
        <path d="M237 79h16M237 102h16M237 125h16M237 148h16M237 171h16" />
        <path d="M136 176c17-3 35-2 53 5" />
        <path d="M138 176c10 24 14 49 12 72" />
        <path d="M174 176c11 10 19 22 25 38" />
        <path d="M149 271c14 2 29 2 45 0" />
      </g>
    </svg>
  );
}
