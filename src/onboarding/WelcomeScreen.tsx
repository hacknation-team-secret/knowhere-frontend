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
        <filter id="cafe-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <g filter="url(#cafe-wash)" opacity="0.86">
        <rect x="153" y="52" width="112" height="142" rx="34" fill="hsl(39 78% 92% / 0.72)" />
        <ellipse cx="213" cy="221" rx="54" ry="24" fill="hsl(33 94% 84% / 0.38)" />
        <ellipse cx="122" cy="266" rx="30" ry="16" fill="hsl(32 77% 83% / 0.28)" />
        <ellipse cx="302" cy="285" rx="36" ry="14" fill="hsl(30 70% 80% / 0.26)" />
        <ellipse cx="298" cy="165" rx="36" ry="36" fill="hsl(85 38% 78% / 0.34)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M172 62c24-9 52-9 80 0" />
        <path d="M167 65c-6 39-6 81-1 125" />
        <path d="M257 64c5 41 5 82 0 125" />
        <path d="M187 83c15-3 32-3 47 0" />
        <path d="M211 66v121M237 66v121" />
        <path d="M166 187c24 5 64 5 91 0" />
        <path d="M144 169c29-16 78-16 109 0" />
        <path d="M156 184c28-4 59-3 89 0" />
        <path d="M209 216c16-4 33-4 46 0" />
        <path d="M209 219c2 12 18 20 33 20 13 0 25-6 28-17" />
        <path d="M233 239v58" />
        <path d="M233 297l-18 24M233 297l18 24M233 297v28" />
        <path d="M102 243c11-10 26-12 40-3 9 7 13 18 10 29" />
        <path d="M112 248l-25 39M142 247l24 36" />
        <path d="M100 287c15 5 32 5 47 0" />
        <path d="M111 244c6-4 15-6 25-5" />
        <path d="M271 143c17 8 29 22 38 44" />
        <path d="M262 134c17 1 31 8 43 20" />
        <path d="M271 166c14 4 26 14 36 30" />
        <path d="M287 133c1 48-2 96-10 145" />
        <path d="M277 278c10 6 21 6 33 0" />
        <path d="M280 278c-6 19-7 39-3 59" />
        <path d="M309 278c5 19 6 39 4 59" />
        <path d="M188 229c-4-13-2-27 6-37" />
        <path d="M252 229c4-11 4-23-1-34" />
        <path d="M215 316h36" />
      </g>
      <g fill="hsl(87 40% 66% / 0.9)" stroke="hsl(18 14% 20%)" strokeWidth="1.1">
        <path d="M284 142c10-13 22-22 36-28-6 15-16 25-29 35" />
        <path d="M299 160c16-9 31-13 46-14-10 12-24 18-40 22" />
        <path d="M286 176c-12-12-22-23-29-37 14 7 25 18 34 31" />
        <path d="M306 193c14-2 28 0 41 7-13 5-27 5-40 0" />
        <path d="M287 208c-11 3-22 9-32 17 12 2 24 0 36-7" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="1.3" fill="hsl(31 96% 84% / 0.8)">
        <path d="M241 189c7-2 14-1 19 0 1 8-2 14-9 18-6-2-10-8-10-18z" />
      </g>
    </svg>
  );
}

function ParkIllustration() {
  return (
    <svg viewBox="0 0 300 380" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="park-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <g filter="url(#park-wash)" opacity="0.88">
        <ellipse cx="130" cy="112" rx="82" ry="48" fill="hsl(87 64% 84% / 0.76)" />
        <ellipse cx="162" cy="126" rx="70" ry="40" fill="hsl(83 72% 82% / 0.56)" />
        <ellipse cx="132" cy="314" rx="64" ry="18" fill="hsl(33 72% 80% / 0.22)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M132 307c-4-55 2-104 18-150" />
        <path d="M149 159c18 34 30 84 35 148" />
        <path d="M149 159c-17-21-38-37-67-51" />
        <path d="M150 162c23-24 49-39 82-47" />
        <path d="M145 137c-10-24-22-43-43-59" />
        <path d="M152 136c19-23 42-38 69-47" />
        <path d="M63 148c28-22 59-33 95-34" />
        <path d="M79 112c26-18 56-27 92-24" />
        <path d="M105 88c20-9 39-12 60-10" />
        <path d="M182 95c24 2 45 8 62 18" />
        <path d="M204 124c18 5 34 14 48 28" />
        <path d="M214 156c14 7 27 17 37 31" />
        <path d="M85 292h75" />
        <path d="M78 305h88" />
        <path d="M87 292c-8 11-10 24-10 38" />
        <path d="M160 292c7 12 10 25 10 38" />
        <path d="M82 330c24 5 57 5 92 0" />
        <path d="M92 292l-9 17M154 292l11 17" />
        <path d="M86 294c17-6 39-6 58 0" />
      </g>
      <g fill="hsl(33 62% 72% / 0.85)" stroke="hsl(18 14% 20%)" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M84 286h75l-5 14H90z" />
        <path d="M90 300h63v9H90z" />
        <path d="M91 309v28M151 309v28" />
      </g>
    </svg>
  );
}

function BookstoreIllustration() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="book-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <g filter="url(#book-wash)" opacity="0.86">
        <rect x="84" y="56" width="72" height="184" rx="24" fill="hsl(192 44% 84% / 0.62)" />
        <rect x="194" y="56" width="63" height="184" rx="22" fill="hsl(191 42% 86% / 0.54)" />
        <path d="M132 72c25-9 53-7 76 8 7 58 5 112-6 165-28-10-50-32-66-67-13-28-16-67-4-106z" fill="hsl(34 92% 82% / 0.34)" />
        <ellipse cx="176" cy="86" rx="36" ry="18" fill="hsl(35 90% 79% / 0.56)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.05" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M84 63c20-10 44-13 72-8" />
        <path d="M86 64c-5 55-5 111-1 168" />
        <path d="M156 56c6 53 7 109 2 169" />
        <path d="M196 63c16-5 34-6 54-3" />
        <path d="M196 63c0 56 4 112 11 168" />
        <path d="M250 61c5 50 5 107 1 170" />
        <path d="M118 64c7 71 7 141-1 210" />
        <path d="M128 84h25M128 105h25M128 126h25M128 147h25M128 168h25" />
        <path d="M94 86h16M94 107h16M94 128h16M94 149h16M94 170h16" />
        <path d="M208 84h18M208 105h18M208 126h18M208 147h18M208 168h18M208 189h18" />
        <path d="M221 65v164" />
        <path d="M149 79c13-5 29-5 42 0" />
        <path d="M147 80c14 17 23 38 28 64" />
        <path d="M140 181c13-3 28-2 42 3" />
        <path d="M139 182c7 28 10 55 8 82" />
        <path d="M97 127l-12 81" />
        <path d="M87 140c7 8 16 12 27 13" />
        <path d="M173 184c11 9 19 20 24 35" />
        <path d="M155 254c13 2 26 1 38-4" />
        <path d="M179 248c4 10 8 19 10 30" />
        <path d="M148 277c14 2 29 2 44 0" />
      </g>
      <g fill="hsl(31 92% 80% / 0.72)" stroke="none">
        <ellipse cx="176" cy="84" rx="28" ry="13" />
        <ellipse cx="149" cy="248" rx="18" ry="8" />
      </g>
    </svg>
  );
}
