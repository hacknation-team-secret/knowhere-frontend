import { Actions } from "./Actions";
import type { QuickPicks } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  picks: QuickPicks;
  onChange: (picks: QuickPicks) => void;
  onContinue: () => void;
}

const USER_TYPES = ["visitor", "local", "student", "commuter"];
const INTERESTS = ["coffee", "bookstores", "museums", "food", "parks", "music", "shopping", "nightlife", "art", "markets", "architecture", "nature"];
const MOBILITY = ["walk", "bike", "transit", "rideshare", "mixed"];
const BUDGET = ["low", "medium", "flexible"];
const VIBES = ["quiet", "social", "scenic", "iconic", "spontaneous", "planned", "cozy", "high-energy", "family-friendly"];
const AVOIDS = ["crowds", "long lines", "chains", "loud bars", "expensive meals", "long walks", "hills", "tourist traps"];

export function QuickPicksScreen({ picks, onChange, onContinue }: Props) {
  const toggleArr = (key: "interests" | "vibes" | "avoids", value: string) => {
    const arr = picks[key];
    onChange({
      ...picks,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };
  const minOne = picks.interests.length > 0 || picks.vibes.length > 0 || !!picks.userType;

  return (
    <section>
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4">
        Quick picks
      </p>
      <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-3">
        What pulls you in?
      </h1>
      <p className="text-[15.5px] leading-[1.55] text-ink-soft max-w-[42ch] mb-10">
        Tap what feels like you. Skip the rest.
      </p>

      <Group title="I'm a">
        <ChipRow
          options={USER_TYPES}
          selected={picks.userType ? [picks.userType] : []}
          onToggle={(v) => onChange({ ...picks, userType: picks.userType === v ? undefined : v })}
        />
      </Group>

      <Group title="Interests">
        <ChipRow options={INTERESTS} selected={picks.interests} onToggle={(v) => toggleArr("interests", v)} />
      </Group>

      <Group title="Mobility">
        <ChipRow
          options={MOBILITY}
          selected={picks.mobility ? [picks.mobility] : []}
          onToggle={(v) => onChange({ ...picks, mobility: picks.mobility === v ? undefined : v })}
        />
      </Group>

      <Group title="Budget">
        <ChipRow
          options={BUDGET}
          selected={picks.budget ? [picks.budget] : []}
          onToggle={(v) => onChange({ ...picks, budget: picks.budget === v ? undefined : v })}
        />
      </Group>

      <Group title="Vibes">
        <ChipRow options={VIBES} selected={picks.vibes} onToggle={(v) => toggleArr("vibes", v)} />
      </Group>

      <Group title="Avoids" tone="coral">
        <ChipRow options={AVOIDS} selected={picks.avoids} onToggle={(v) => toggleArr("avoids", v)} tone="coral" />
      </Group>

      <Actions
        primary={{
          label: minOne ? "Continue" : "Pick at least one",
          onClick: onContinue,
          disabled: !minOne,
        }}
      />
    </section>
  );
}

function Group({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "coral" }) {
  return (
    <section className="py-5 border-t border-line/60 first-of-type:border-t-0 first-of-type:pt-0">
      <h2
        className={cn(
          "text-[10.5px] tracking-[0.2em] uppercase mb-3.5",
          tone === "coral" ? "text-coral" : "text-ink-soft",
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ChipRow({
  options,
  selected,
  onToggle,
  tone,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  tone?: "coral";
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            data-on={on ? "true" : "false"}
            className={cn(
              "chip",
              on && tone === "coral" && "!bg-[hsl(var(--coral)/0.10)] !text-coral !border-[hsl(var(--coral)/0.45)]",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
