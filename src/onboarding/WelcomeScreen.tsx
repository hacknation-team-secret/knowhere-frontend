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
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <g filter="url(#cafe-wash)" opacity="0.82">
        <path d="M188 78c18-10 53-13 77-6 7 26 7 57 2 90-23 8-47 11-72 7-8-25-11-57-7-91z" fill="hsl(37 72% 92% / 0.78)" />
        <path d="M161 182c27-17 73-18 104-6 8 16 12 32 12 47-30 7-66 10-101 6-8-13-12-28-15-47z" fill="hsl(34 90% 82% / 0.52)" />
        <ellipse cx="235" cy="207" rx="28" ry="18" fill="hsl(29 92% 82% / 0.4)" />
        <ellipse cx="275" cy="162" rx="34" ry="25" fill="hsl(77 41% 78% / 0.34)" />
        <ellipse cx="219" cy="287" rx="56" ry="16" fill="hsl(35 91% 84% / 0.24)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.15" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M190 78c24-8 53-8 81 0" />
        <path d="M194 80c-4 29-5 62-2 96" />
        <path d="M270 80c3 28 3 61-1 95" />
        <path d="M209 93c15-2 34-2 49 0" />
        <path d="M226 81v98M255 82v97" />
        <path d="M189 178c19 4 59 5 80 1" />
        <path d="M160 178c24-13 67-14 99-4" />
        <path d="M176 194c27-4 57-3 83 2" />
        <path d="M207 229c12-6 31-6 43 0" />
        <path d="M209 232c5 12 16 18 24 18 10 0 20-4 25-15" />
        <path d="M230 250v42" />
        <path d="M230 292l-17 21M230 292l16 21M230 292v27" />
        <path d="M125 274c9-9 25-10 35-2 8 7 10 18 6 29" />
        <path d="M134 278l-19 27M159 278l17 24" />
        <path d="M124 304c12 4 26 4 38 0" />
        <path d="M289 145c13 11 21 27 24 47" />
        <path d="M278 139c16 2 27 9 35 18" />
        <path d="M286 166c11 7 20 16 27 30" />
        <path d="M297 145c0 41-2 80-7 120" />
        <path d="M290 266c8 5 17 5 27 0" />
        <path d="M291 266c-4 15-5 31-3 46" />
        <path d="M317 266c5 15 6 30 5 46" />
      </g>
      <g fill="hsl(87 36% 65% / 0.84)" stroke="hsl(18 14% 20%)" strokeWidth="1.05">
        <path d="M293 145c8-12 19-20 30-26-4 13-13 23-24 31" />
        <path d="M304 160c13-8 28-13 40-15-8 11-20 18-34 22" />
        <path d="M293 174c-10-10-18-20-25-32 12 6 21 15 29 27" />
        <path d="M312 189c13-2 26 0 37 6-12 5-23 4-35 0" />
        <path d="M295 201c-11 2-21 7-29 14 11 2 21 0 31-5" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="1.35" fill="hsl(31 97% 84% / 0.7)">
        <path d="M236 201c6-2 11-2 16 0 1 6-2 11-7 14-7-2-10-7-9-14z" />
      </g>
    </svg>
  );
}

function ParkIllustration() {
  return (
    <svg viewBox="0 0 300 380" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="park-wash" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g filter="url(#park-wash)" opacity="0.84">
        <path d="M52 126c18-30 46-47 82-49 39-3 78 10 112 38-14 24-42 44-81 57-43 13-87 7-126-18 3-11 6-18 13-28z" fill="hsl(83 71% 84% / 0.78)" />
        <ellipse cx="144" cy="297" rx="44" ry="13" fill="hsl(32 74% 79% / 0.28)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.15" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M144 313c-2-47 2-91 15-132" />
        <path d="M159 182c14 33 22 76 23 131" />
        <path d="M156 184c-16-23-36-40-63-52" />
        <path d="M159 186c21-24 47-40 78-48" />
        <path d="M151 154c-8-24-18-42-35-59" />
        <path d="M160 152c18-22 39-38 62-48" />
        <path d="M58 154c24-18 54-28 89-29" />
        <path d="M72 116c27-15 55-21 87-19" />
        <path d="M100 92c16-7 34-9 50-8" />
        <path d="M182 100c20 1 39 6 53 13" />
        <path d="M201 127c15 5 29 12 41 22" />
        <path d="M206 157c14 7 25 15 35 27" />
        <path d="M108 304h75" />
        <path d="M98 317h87" />
        <path d="M105 304c-6 11-8 23-8 35" />
        <path d="M187 304c5 12 7 24 7 35" />
        <path d="M103 339c25 4 59 4 90 0" />
        <path d="M108 321l-9 17M184 321l10 17" />
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
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g filter="url(#book-wash)" opacity="0.82">
        <path d="M84 66c26-12 56-14 90-7 8 21 10 47 6 74-28 7-58 9-89 4-7-23-10-47-7-71z" fill="hsl(191 44% 83% / 0.6)" />
        <path d="M191 72c18-3 37-2 53 5 6 47 7 95 3 144-15 8-29 9-43 6-8-29-13-94-13-155z" fill="hsl(193 45% 85% / 0.5)" />
        <path d="M120 172c21-6 45-5 67 0-7 27-23 48-45 69-15-15-23-39-22-69z" fill="hsl(34 92% 82% / 0.38)" />
        <ellipse cx="175" cy="81" rx="22" ry="12" fill="hsl(35 92% 78% / 0.58)" />
      </g>
      <g stroke="hsl(18 14% 20%)" strokeWidth="2.05" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M84 69c28-11 61-10 93-4" />
        <path d="M87 70c-6 44-6 89-1 133" />
        <path d="M178 68c6 41 7 85 2 130" />
        <path d="M197 75c14-3 30-4 46-2" />
        <path d="M197 75c1 53 5 104 12 153" />
        <path d="M244 74c6 44 7 93 2 150" />
        <path d="M120 75c7 60 7 119-1 179" />
        <path d="M131 90h25M131 111h25M131 133h25M131 156h25" />
        <path d="M96 92h17M96 113h17M96 135h17M96 157h17" />
        <path d="M210 90h18M210 114h18M210 138h18M210 162h18M210 186h18" />
        <path d="M224 77c0 45 1 89 3 132" />
        <path d="M174 84c13-3 25-3 36 0" />
        <path d="M173 82c14 14 23 31 27 50" />
        <path d="M148 179c8 31 10 59 5 85" />
        <path d="M101 129l-12 75" />
        <path d="M90 141c6 6 14 10 22 11" />
        <path d="M141 201c8-8 17-12 29-14" />
        <path d="M140 202c7 10 11 21 13 34" />
        <path d="M159 236c10 1 19-1 27-7" />
        <path d="M178 239c4 9 7 19 9 29" />
        <path d="M169 181h29" />
        <path d="M151 269c13 2 26 2 39 0" />
      </g>
      <g fill="hsl(31 90% 78% / 0.72)" stroke="none">
        <ellipse cx="176" cy="81" rx="20" ry="10" />
        <ellipse cx="146" cy="240" rx="16" ry="7" />
      </g>
    </svg>
  );
}
