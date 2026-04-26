import { Button } from "@/components/ui/button";
import { Star } from "./decor";
import { ArrowRight } from "lucide-react";
import cafe from "@/assets/illo-cafe.png";
import park from "@/assets/illo-park.png";
import bookstore from "@/assets/illo-bookstore.png";

export function WelcomeScreen({ onNext, onSignIn }: { onNext: () => void; onSignIn: () => void }) {
  return (
    <section className="grid min-h-[60vh] items-center gap-10 md:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div className="relative">
        <h1 className="mb-6 font-serif text-[52px] leading-[0.98] text-ink md:text-[68px]">
          Know where
          <br />
          <span className="relative inline-block">
            to go.
            <Star className="absolute -right-7 -top-3 size-4 text-gold" />
          </span>
        </h1>

        <p className="max-w-[42ch] text-[16px] leading-[1.55] text-ink-soft">
          A passport for the cities you haven&apos;t met yet, with a copilot for the friends you bring along.
        </p>

        <div className="mt-10 flex flex-col items-start gap-3">
          <Button
            size="xl"
            onClick={onNext}
            className="group relative pr-8 shadow-[0_8px_24px_-8px_hsl(var(--ocean)/0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-10px_hsl(var(--ocean)/0.55)]"
          >
            <Star className="-ml-1 mr-1 size-3.5 text-gold transition-transform group-hover:rotate-12" />
            <span className="font-serif text-[17px] italic">Start wandering</span>
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
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

      <div className="relative hidden h-[480px] grid-cols-6 grid-rows-6 gap-3 md:grid">
        <Illo
          src={cafe}
          alt="A sunlit cafe table"
          caption="a slow morning"
          className="col-span-4 row-span-4 col-start-3 row-start-1"
        />
        <Illo
          src={park}
          alt="A tree with a bench beneath"
          caption="a side-loop home"
          className="col-span-3 row-span-3 col-start-1 row-start-4"
        />
        <Illo
          src={bookstore}
          alt="A cozy bookstore corner"
          caption="lamp-lit corners"
          className="col-span-3 row-span-2 col-start-4 row-start-5"
        />
      </div>

      <div className="md:hidden">
        <Illo
          src={cafe}
          alt="A sunlit cafe table"
          caption="a slow morning"
          className="w-full aspect-[4/5]"
        />
      </div>
    </section>
  );
}

function Illo({
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
    <figure className={`relative overflow-visible ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="eager"
        className="absolute inset-0 h-full w-full object-contain"
      />
      {caption ? (
        <figcaption className="absolute inset-x-0 bottom-0 px-1 py-1 text-[10.5px] uppercase tracking-[0.16em] text-ink-soft/80">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
