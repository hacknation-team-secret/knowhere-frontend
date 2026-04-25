import { ExternalLink, Clock, Tag } from "lucide-react";
import type { ViatorExperience } from "@/cityApp/lib/viator";
import { viatorSearchUrl } from "@/cityApp/lib/viator";

interface Props {
  experience: ViatorExperience;
}

export function ExperienceCard({ experience: e }: Props) {
  const href = viatorSearchUrl(e.searchQuery, e.city);
  const priceLabel = "$".repeat(e.priceTier);
  return (
    <article className="paper-card overflow-hidden flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={e.image}
          alt=""
          loading="lazy"
          width={800}
          height={500}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
        />
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-paper-soft/95 px-2.5 py-1 text-[10.5px] tracking-[0.18em] uppercase text-ink shadow-soft">
            {e.category}
          </span>
        </div>
      </div>
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <h3 className="font-serif text-[19px] leading-tight text-ink mb-1.5">
          {e.title}
        </h3>
        <p className="text-[13px] leading-snug text-ink-soft mb-3 flex-1">
          {e.blurb}
        </p>
        <div className="flex items-center gap-3 text-[12px] text-ink-soft mb-4">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" strokeWidth={1.6} /> {e.durationLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Tag className="size-3" strokeWidth={1.6} /> {priceLabel}
          </span>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ocean text-paper-soft text-[13px] font-medium px-4 py-2.5 hover:bg-ocean/92 transition-colors"
        >
          Open on Viator
          <ExternalLink className="size-3.5" strokeWidth={1.8} />
        </a>
      </div>
    </article>
  );
}
