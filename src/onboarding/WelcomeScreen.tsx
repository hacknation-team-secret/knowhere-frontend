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
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g filter="url(#cafe-wash)" opacity="0.88">
        <path d="M182 82c20-14 58-17 84-6 8 30 7 63 1 102-26 7-53 9-80 4-7-28-10-66-5-100z" fill="hsl(37 62% 92% / 0.9)" />
        <path d="M155 170c20-13 56-18 86-10 11 13 18 28 21 46-31 7-62 10-95 6-6-13-8-26-12-42z" fill="hsl(32 92% 85% / 0.82)" />
        <path d="M273 130c18 11 34 29 42 56-8 11-18 18-33 24-14-20-20-42-19-69z" fill="hsl(78 34% 76% / 0.48)" />
        <ellipse cx="223" cy="258" rx="40" ry="16" fill="hsl(32 84% 79% / 0.5)" />
        <ellipse cx="124" cy="302" rx="24" ry="11" fill="hsl(32 70% 79% / 0.42)" />
        <ellipse cx="282" cy="348" rx="30" ry="12" fill="hsl(30 78% 80% / 0.45)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M182 81c24-9 58-10 86-1" />
        <path d="M185 83c-5 34-6 72-2 105" />
        <path d="M268 82c4 34 4 69-1 105" />
        <path d="M199 95c18-3 41-3 58 0" />
        <path d="M220 83v108M254 84v107" />
        <path d="M182 190c18 4 60 4 85 0" />
        <path d="M153 168c29-16 76-18 105-2" />
        <path d="M164 182c27-4 59-3 90 3" />
        <path d="M197 224c17-6 38-6 53 0" />
        <path d="M198 227c2 12 18 20 28 20 14 0 29-6 31-18" />
        <path d="M225 246v50" />
        <path d="M225 296l-17 24M225 296l16 24M225 296v29" />
        <path d="M108 267c8-10 23-13 35-5 10 7 13 22 8 35" />
        <path d="M118 271l-23 34M145 271l19 31" />
        <path d="M104 302c13 5 27 5 40 0" />
        <path d="M253 277c-10-10-27-11-38-3-8 7-11 20-7 32" />
        <path d="M220 278l-15 25M248 278l20 25" />
        <path d="M214 305c12 5 25 5 38 0" />
        <path d="M290 150c14 7 24 20 31 39" />
        <path d="M281 141c16 1 29 7 40 18" />
        <path d="M286 167c13 4 24 14 31 28" />
        <path d="M300 150c1 48 0 92-6 136" />
        <path d="M292 286c8 6 18 6 29 0" />
        <path d="M293 286c-5 17-6 34-3 51" />
        <path d="M320 286c5 16 6 34 4 51" />
      </g>
      <g fill="hsl(87 36% 63% / 0.88)" stroke="hsl(18 14% 20%)" strokeWidth="1.15">
        <path d="M294 146c10-13 20-21 33-27-5 14-14 24-26 33" />
        <path d="M306 161c14-10 28-15 42-17-9 12-22 19-36 24" />
        <path d="M294 176c-12-12-22-23-28-36 14 7 23 18 31 31" />
        <path d="M313 190c14-2 28 1 41 8-14 5-25 4-39-1" />
        <path d="M295 202c-11 2-22 7-32 16 12 3 23 1 34-6" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="1.45" fill="hsl(31 97% 84% / 0.72)">
        <path d="M233 198c7-2 13-1 18 0 1 8-2 13-8 16-7-3-11-7-10-16z" />
      </g>
    </svg>
  );
}

function ParkIllustration() {
  return (
    <svg viewBox="0 0 300 380" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="park-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g filter="url(#park-wash)">
        <path d="M40 136c15-33 43-52 84-55 47-4 89 14 123 49-17 31-55 55-104 63-44 7-87-7-121-35 2-10 7-16 18-22z" fill="hsl(83 72% 85% / 0.96)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M142 313c-4-56 1-101 17-143" />
        <path d="M160 171c16 33 27 80 29 142" />
        <path d="M157 174c-17-24-38-40-66-53" />
        <path d="M160 176c25-28 51-45 82-51" />
        <path d="M154 149c-9-25-20-44-40-62" />
        <path d="M161 148c18-23 40-39 67-50" />
        <path d="M49 148c24-23 58-35 98-34" />
        <path d="M69 108c25-18 55-26 90-22" />
        <path d="M98 87c17-9 36-12 56-10" />
        <path d="M181 96c24 0 45 5 61 15" />
        <path d="M199 127c19 2 37 8 50 18" />
        <path d="M202 161c15 5 28 13 40 25" />
        <path d="M107 302h78" />
        <path d="M97 315h89" />
        <path d="M104 302c-6 12-8 24-8 36" />
        <path d="M188 302c5 12 7 24 7 36" />
        <path d="M102 338c25 5 60 5 91 0" />
        <path d="M107 319l-9 18M184 319l10 18" />
        <path d="M77 210c21-3 39-2 56 4" />
        <path d="M171 218c18-9 37-13 56-12" />
      </g>
      <g fill="hsl(31 55% 73% / 0.82)" stroke="none">
        <path d="M103 303c23-5 57-5 84 0 0 8-29 13-42 13-23 0-42-4-42-13z" />
      </g>
    </svg>
  );
}

function BookstoreIllustration() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="book-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g filter="url(#book-wash)">
        <path d="M82 63c26-13 58-16 94-8 9 24 11 54 5 84-31 7-63 9-95 4-8-26-10-52-4-80z" fill="hsl(191 43% 82% / 0.66)" />
        <path d="M192 69c21-4 40-2 58 6 6 55 7 109 2 165-17 9-33 10-49 6-9-33-14-112-11-177z" fill="hsl(190 52% 86% / 0.58)" />
        <path d="M121 174c24-7 50-7 72-1-8 33-26 58-51 81-18-17-26-46-21-80z" fill="hsl(34 96% 83% / 0.5)" />
        <ellipse cx="179" cy="83" rx="27" ry="16" fill="hsl(36 94% 76% / 0.72)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.15" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M82 67c29-12 66-12 98-5" />
        <path d="M85 68c-7 52-7 104-1 157" />
        <path d="M181 66c6 48 7 99 1 153" />
        <path d="M200 74c15-4 32-5 49-2" />
        <path d="M200 74c0 62 4 121 12 179" />
        <path d="M250 73c6 52 7 109 1 171" />
        <path d="M121 74c8 71 8 142-1 212" />
        <path d="M132 90h26M132 113h26M132 136h26M132 160h26" />
        <path d="M95 92h18M95 114h18M95 137h18M95 161h18" />
        <path d="M213 92h19M213 117h19M213 142h19M213 166h19M213 191h19" />
        <path d="M227 76c-1 53-1 106 2 158" />
        <path d="M179 87c14-4 28-4 41 0" />
        <path d="M177 83c16 16 25 34 31 56" />
        <path d="M153 181c9 38 10 70 4 101" />
        <path d="M101 130l-13 95" />
        <path d="M89 143c7 7 15 11 24 12" />
        <path d="M142 204c9-8 18-13 30-15" />
        <path d="M140 205c8 11 13 23 15 38" />
        <path d="M160 242c11 1 21-1 30-8" />
        <path d="M181 246c4 10 7 20 9 32" />
        <path d="M171 183h31" />
        <path d="M153 279c14 2 28 2 42 0" />
      </g>
      <g fill="hsl(31 90% 78% / 0.72)" stroke="none">
        <ellipse cx="178" cy="82" rx="23" ry="12" />
        <ellipse cx="148" cy="247" rx="18" ry="8" />
      </g>
    </svg>
  );
}
