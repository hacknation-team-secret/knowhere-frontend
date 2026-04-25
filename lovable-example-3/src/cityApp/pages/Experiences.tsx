// Experiences — third top-level surface in the city app.
// Recommends bookable Viator activities ranked against the user's passport.

import { useMemo, useState } from "react";
import { Ticket } from "lucide-react";
import { useApp } from "@/cityApp/CityShell";
import { ExperienceCard } from "@/cityApp/components/ExperienceCard";
import { CityPicker } from "@/cityApp/components/CityPicker";
import {
  rankExperiencesForProfile,
  supportedCities,
} from "@/cityApp/lib/viator";

export default function Experiences() {
  const { profile } = useApp();
  const cities = supportedCities();
  const [city, setCity] = useState<string>(cities[0] ?? "Boston");

  const result = useMemo(() => {
    if (!profile) return null;
    return rankExperiencesForProfile(profile, city);
  }, [profile, city]);

  if (!profile || !result) {
    return (
      <div className="paper-card p-6 text-center text-ink-soft">
        Finish onboarding to see matched experiences.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="pt-1">
        <CityPicker city={city} onChange={setCity} />
      </header>

      <section>
        <div className="flex items-center gap-2 text-coral mb-2">
          <Ticket className="size-4" strokeWidth={1.75} />
          <p className="text-[10.5px] tracking-[0.22em] uppercase">
            Experiences · powered by Viator
          </p>
        </div>
        <h1 className="font-serif text-[32px] md:text-[40px] leading-[1.05] text-ink mb-2">
          What's bookable, matched to you.
        </h1>
        <p className="text-[14.5px] leading-[1.6] text-ink-soft max-w-[58ch]">
          {result.rationale}
        </p>
      </section>

      {result.categories.map((cat) => (
        <section key={cat.category}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-serif text-[22px] text-ink capitalize">
              {cat.category}
            </h2>
            <span className="text-[11.5px] text-ink-soft italic max-w-[36ch] text-right">
              {cat.reason}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.experiences.map((e) => (
              <ExperienceCard key={e.id} experience={e} />
            ))}
          </div>
        </section>
      ))}

      <footer className="pt-2 text-center">
        <p className="text-[11.5px] text-ink-soft italic">
          Bookings open in a new tab on viator.com.
        </p>
      </footer>
    </div>
  );
}
