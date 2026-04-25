import { Button } from "@/components/ui/button";
import { Star } from "./decor";
import { ArrowRight } from "lucide-react";
import cafe from "@/assets/detour-cafe.jpg";
import park from "@/assets/detour-park.jpg";
import bookstore from "@/assets/detour-bookstore.jpg";

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
          <button
            type="button"
            onClick={onSignIn}
            className="group px-1 py-1 text-left text-ink-soft transition-colors hover:text-ink"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft/80">
              Already have an account?
            </span>
            <span className="mt-1 flex items-center gap-1.5 font-serif text-[15px] italic text-ink-soft group-hover:text-ink">
              Sign in
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
            </span>
          </button>
        </div>
      </div>

      <div className="relative hidden md:grid grid-cols-6 grid-rows-6 gap-3 h-[480px]">
        <PhotoFrame
          src={cafe}
          alt="Sunlit cafe"
          caption="a slow morning"
          className="col-span-4 row-span-4 col-start-3 row-start-1"
        />
        <PhotoFrame
          src={park}
          alt="Tree-lined path"
          caption="a side-loop home"
          className="col-span-3 row-span-3 col-start-1 row-start-4"
        />
        <PhotoFrame
          src={bookstore}
          alt="Bookstore"
          caption="lamp-lit corners"
          className="col-span-3 row-span-2 col-start-4 row-start-5"
        />
      </div>

      <div className="md:hidden">
        <PhotoFrame
          src={cafe}
          alt="Sunlit cafe"
          caption="a slow morning"
          className="w-full aspect-[4/5]"
        />
      </div>
    </section>
  );
}

function PhotoFrame({
  src,
  alt,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`photo-card relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 px-3 py-2 text-paper-soft/95 text-[11.5px] tracking-[0.16em] uppercase bg-gradient-to-t from-ink/55 via-ink/15 to-transparent">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
