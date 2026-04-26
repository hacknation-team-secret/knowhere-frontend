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
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g filter="url(#cafe-wash)" opacity="0.92">
        <rect x="182" y="54" width="92" height="116" rx="28" fill="hsl(36 76% 91% / 0.84)" />
        <ellipse cx="228" cy="190" rx="64" ry="22" fill="hsl(35 88% 82% / 0.34)" />
        <ellipse cx="130" cy="220" rx="40" ry="18" fill="hsl(28 82% 84% / 0.26)" />
        <ellipse cx="292" cy="232" rx="46" ry="20" fill="hsl(88 34% 78% / 0.28)" />
        <ellipse cx="290" cy="150" rx="40" ry="40" fill="hsl(90 40% 76% / 0.3)" />
        <ellipse cx="164" cy="278" rx="88" ry="32" fill="hsl(28 72% 84% / 0.16)" />
      </g>
      <g stroke="hsl(19 16% 20%)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M193 62c18-8 48-10 70-4" />
        <path d="M189 64c-4 30-4 66 0 102" />
        <path d="M271 62c5 35 4 70-1 103" />
        <path d="M208 80h43M210 118h40" />
        <path d="M228 62v103M250 62v103" />
        <path d="M189 165c22 4 57 4 82 0" />
        <path d="M111 242c16-11 34-14 53-8" />
        <path d="M117 248c-5 20-4 41 4 63" />
        <path d="M162 242c10 17 15 38 14 61" />
        <path d="M126 278c11 5 23 6 36 2" />
        <path d="M211 204c17-6 36-6 54-1" />
        <path d="M213 206c2 14 15 24 31 24 14 0 27-7 31-18" />
        <path d="M241 230v56" />
        <path d="M241 286l-19 29M241 286l18 29M241 286v32" />
        <path d="M200 186c11-10 25-16 41-18" />
        <path d="M264 187c8 4 14 10 18 18" />
        <path d="M278 133c11 8 21 20 28 35" />
        <path d="M270 125c13 2 26 8 38 19" />
        <path d="M278 157c10 5 19 13 28 25" />
        <path d="M286 124c0 40-1 81-5 122" />
        <path d="M279 246c11 6 23 7 34 2" />
        <path d="M283 247c-6 18-8 36-6 54" />
        <path d="M312 247c2 18 3 36 1 53" />
        <path d="M242 316h33" />
        <path d="M135 184c17 0 32 8 46 22" />
        <path d="M148 184c-8 19-10 37-7 55" />
        <path d="M172 206c7 9 10 20 9 33" />
      </g>
      <g fill="hsl(88 36% 69% / 0.95)" stroke="hsl(19 16% 20%)" strokeWidth="1.15">
        <path d="M283 134c10-14 23-23 37-28-6 15-18 28-31 35" />
        <path d="M299 155c16-8 32-11 48-10-12 11-26 18-42 20" />
        <path d="M286 170c-11-12-20-23-27-36 14 7 25 18 33 31" />
        <path d="M304 189c15-1 29 2 42 9-13 4-27 4-40-1" />
        <path d="M286 204c-12 3-22 9-31 18 12 2 23-1 35-8" />
      </g>
      <g fill="hsl(31 90% 82% / 0.8)" stroke="hsl(19 16% 20%)" strokeWidth="1.2">
        <path d="M249 178c8-2 15-1 20 1 0 7-4 13-10 16-7-2-10-8-10-17z" />
        <path d="M211 196c7-2 15-2 21 0 0 7-3 12-11 15-7-2-10-7-10-15z" />
      </g>
    </svg>
  );
}

function ParkIllustration() {
  return (
    <svg viewBox="0 0 300 380" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="park-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g filter="url(#park-wash)" opacity="0.92">
        <ellipse cx="128" cy="110" rx="88" ry="52" fill="hsl(88 52% 82% / 0.84)" />
        <ellipse cx="168" cy="126" rx="76" ry="44" fill="hsl(92 42% 80% / 0.72)" />
        <ellipse cx="118" cy="142" rx="66" ry="34" fill="hsl(95 50% 86% / 0.5)" />
        <ellipse cx="130" cy="315" rx="70" ry="20" fill="hsl(34 70% 80% / 0.2)" />
      </g>
      <g stroke="hsl(19 16% 20%)" strokeWidth="2.15" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M136 307c-5-51 0-98 15-144" />
        <path d="M151 163c18 33 30 81 34 144" />
        <path d="M150 164c-18-23-40-39-67-50" />
        <path d="M150 165c24-24 51-39 84-46" />
        <path d="M144 142c-10-24-22-43-42-62" />
        <path d="M151 142c18-24 42-41 72-52" />
        <path d="M63 151c31-23 63-35 98-36" />
        <path d="M76 118c31-19 63-28 96-27" />
        <path d="M99 95c23-11 46-14 70-11" />
        <path d="M182 95c24 3 47 10 66 22" />
        <path d="M205 126c19 6 35 16 47 30" />
        <path d="M214 159c14 8 26 18 36 31" />
        <path d="M82 296h82" />
        <path d="M74 308h96" />
        <path d="M84 296c-6 11-9 23-8 35" />
        <path d="M162 296c8 10 11 22 11 35" />
        <path d="M83 331c27 4 58 4 92 0" />
        <path d="M95 296l-10 16M155 296l11 16" />
      </g>
      <g fill="hsl(32 58% 72% / 0.9)" stroke="hsl(19 16% 20%)" strokeWidth="1.75" strokeLinejoin="round">
        <path d="M85 289h76l-5 13H91z" />
        <path d="M91 302h65v9H91z" />
        <path d="M93 311v24M153 311v24" />
      </g>
    </svg>
  );
}

function BookstoreIllustration() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="book-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <g filter="url(#book-wash)" opacity="0.92">
        <rect x="70" y="46" width="74" height="200" rx="20" fill="hsl(190 35% 84% / 0.82)" />
        <rect x="196" y="44" width="70" height="202" rx="20" fill="hsl(195 38% 86% / 0.7)" />
        <path d="M130 66c31-20 67-18 103 7 6 59 2 115-15 166-29-10-52-30-68-61-14-28-21-66-20-112z" fill="hsl(34 84% 82% / 0.34)" />
        <ellipse cx="180" cy="82" rx="38" ry="18" fill="hsl(35 88% 80% / 0.55)" />
      </g>
      <g stroke="hsl(19 16% 20%)" strokeWidth="2.05" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M71 51c21-9 47-12 73-8" />
        <path d="M72 52c-4 58-3 117 2 177" />
        <path d="M145 44c4 61 4 121-1 181" />
        <path d="M197 49c17-5 39-6 67-1" />
        <path d="M198 49c0 58 4 117 10 177" />
        <path d="M263 49c4 57 4 117 0 178" />
        <path d="M108 60v173M120 76h15M120 98h15M120 120h15M120 142h15M120 164h15M120 186h15" />
        <path d="M84 80h15M84 102h15M84 124h15M84 146h15M84 168h15M84 190h15" />
        <path d="M223 66v159M205 79h15M205 101h15M205 123h15M205 145h15M205 167h15M205 189h15" />
        <path d="M236 79h15M236 101h15M236 123h15M236 145h15M236 167h15M236 189h15" />
        <path d="M145 75c18-6 36-4 54 5" />
        <path d="M144 76c19 21 32 46 37 76" />
        <path d="M136 176c18-3 36-2 54 4" />
        <path d="M136 176c10 24 13 49 11 73" />
        <path d="M95 119l-11 82" />
        <path d="M84 134c8 9 18 13 30 14" />
        <path d="M179 178c10 9 19 21 25 37" />
        <path d="M158 246c14 2 28 1 42-5" />
        <path d="M181 241c4 9 8 19 10 30" />
        <path d="M150 271c14 2 30 2 45 0" />
      </g>
      <g fill="hsl(31 88% 79% / 0.72)" stroke="none">
        <ellipse cx="180" cy="82" rx="29" ry="13" />
        <ellipse cx="152" cy="245" rx="20" ry="8" />
      </g>
    </svg>
  );
}
