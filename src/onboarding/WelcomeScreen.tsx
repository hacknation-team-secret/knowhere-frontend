import { Actions } from "./Actions";
import { Compass, Spark, Star } from "./decor";
import cafe from "@/assets/detour-cafe.jpg";
import park from "@/assets/detour-park.jpg";
import bookstore from "@/assets/detour-bookstore.jpg";

export function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <section className="grid md:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center min-h-[60vh]">
      {/* Left — text */}
      <div className="relative">
        <div className="flex items-center gap-2 text-ink-soft mb-6">
          <Compass className="size-4" />
          <span className="text-[11px] tracking-[0.22em] uppercase">A city passport</span>
        </div>

        <h1 className="font-serif text-[52px] md:text-[68px] leading-[0.98] text-ink mb-6">
          Know where
          <br />
          <span className="relative inline-block">
            to go.
            <Star className="absolute -top-3 -right-7 size-4 text-gold" />
          </span>
        </h1>

        <p className="text-[16px] leading-[1.55] text-ink-soft max-w-[42ch]">
          A quiet companion that learns your taste, then opens a city one Detour at a time.
        </p>

        <Actions
          primary={{ label: "Start my Passport", onClick: onNext }}
          helper={
            <span className="inline-flex items-center gap-1.5">
              <Spark className="size-3 text-gold" /> Two minutes · No account
            </span>
          }
        />
      </div>

      {/* Right — collage of 3 photos, gentle offset (whimsical, not chaotic) */}
      <div className="relative h-[480px] hidden md:block">
        <PhotoFrame
          src={cafe}
          alt="Sunlit cafe"
          caption="a slow morning"
          className="absolute right-0 top-0 w-[62%] aspect-[4/5]"
        />
        <PhotoFrame
          src={park}
          alt="Tree-lined path"
          caption="a side-loop home"
          className="absolute left-0 top-24 w-[48%] aspect-[3/4]"
        />
        <PhotoFrame
          src={bookstore}
          alt="Bookstore"
          caption="lamp-lit corners"
          className="absolute right-8 bottom-0 w-[42%] aspect-square"
        />
      </div>

      {/* Mobile photo */}
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
    <figure className={`photo-card overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="eager"
        width={800}
        height={1024}
        className="w-full h-full object-cover"
      />
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 px-3 py-2 text-paper-soft/95 text-[11.5px] tracking-[0.16em] uppercase bg-gradient-to-t from-ink/55 via-ink/15 to-transparent">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
