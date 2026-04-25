import { Button } from "@/components/ui/button";
import { Star } from "./decor";
import { ArrowRight } from "lucide-react";
import cafe from "@/assets/illo-cafe.png";
import park from "@/assets/illo-park.png";
import bookstore from "@/assets/illo-bookstore.png";

export function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <section className="grid md:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center min-h-[60vh]">
      {/* Left — text */}
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
          A passport for the cities you haven't met yet.
        </p>

        <div className="mt-10">
          <Button
            size="xl"
            onClick={onNext}
            className="group relative pr-8 shadow-[0_8px_24px_-8px_hsl(var(--ocean)/0.45)] hover:shadow-[0_12px_32px_-10px_hsl(var(--ocean)/0.55)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Star className="size-3.5 text-gold mr-1 -ml-1 transition-transform group-hover:rotate-12" />
            <span className="font-serif italic text-[17px]">Start wandering</span>
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
          </Button>
        </div>
      </div>

      {/* Right — calm 3-illustration collage, transparent on paper */}
      <div className="relative hidden md:grid grid-cols-6 grid-rows-6 gap-3 h-[480px]">
        <Illo
          src={cafe}
          alt="A sunlit cafe table"
          className="col-span-4 row-span-4 col-start-3 row-start-1"
        />
        <Illo
          src={park}
          alt="A tree with a bench beneath"
          className="col-span-3 row-span-3 col-start-1 row-start-4"
        />
        <Illo
          src={bookstore}
          alt="A cozy bookstore corner"
          className="col-span-3 row-span-2 col-start-4 row-start-5"
        />
      </div>

      {/* Mobile — single illustration */}
      <div className="md:hidden">
        <Illo src={cafe} alt="A sunlit cafe table" className="w-full aspect-[4/5]" />
      </div>
    </section>
  );
}

function Illo({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="eager"
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
}
