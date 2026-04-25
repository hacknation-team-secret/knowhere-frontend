import { useState } from "react";
import { Instagram } from "lucide-react";
import { Actions } from "./Actions";

interface Props {
  initialInstagram?: string;
  initialTiktok?: string;
  onContinue: (socials: { instagram?: string; tiktok?: string }) => void;
}

// Lightweight normalizer — accepts handles ("@name", "name") or full URLs.
function normalize(value: string, base: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@+/, "");
  if (!handle) return undefined;
  return `${base}${handle}`;
}

export function SocialsScreen({ initialInstagram, initialTiktok, onContinue }: Props) {
  const [instagram, setInstagram] = useState(initialInstagram ?? "");
  const [tiktok, setTiktok] = useState(initialTiktok ?? "");

  const submit = () => {
    onContinue({
      instagram: normalize(instagram, "https://instagram.com/"),
      tiktok: normalize(tiktok, "https://tiktok.com/@"),
    });
  };

  return (
    <section>
      <div className="text-center mb-8">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-3">
          Optional · helps us read the room
        </p>
        <h1 className="font-serif text-[32px] md:text-[38px] leading-[1.05] text-ink mb-3">
          A trace of your taste, if you'd like.
        </h1>
        <p className="text-[14.5px] text-ink-soft max-w-[52ch] mx-auto leading-relaxed">
          Drop your Instagram or TikTok and Knowhere can pick up on the places, moods,
          and corners you already gravitate to. Skip if you'd rather keep it private.
        </p>
      </div>

      <div className="paper-card p-6 md:p-7 max-w-[560px] mx-auto space-y-5">
        <Field
          icon={<Instagram className="size-4" strokeWidth={1.75} />}
          label="Instagram"
          placeholder="@yourhandle or full link"
          value={instagram}
          onChange={setInstagram}
        />
        <Field
          icon={<TiktokGlyph />}
          label="TikTok"
          placeholder="@yourhandle or full link"
          value={tiktok}
          onChange={setTiktok}
        />
        <p className="text-[12px] text-ink-soft/80 leading-relaxed">
          We only use these as a soft signal — nothing is posted, followed, or shared.
        </p>
      </div>

      <Actions
        primary={{ label: "Continue", onClick: submit }}
        secondary={{ label: "Skip for now", onClick: () => onContinue({}) }}
      />
    </section>
  );
}

function Field({
  icon,
  label,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-ink-soft mb-2">
        <span className="text-ocean-deep">{icon}</span>
        {label}
      </span>
      <input
        type="text"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-paper border border-ink/15 rounded-md px-3.5 py-2.5 text-[14.5px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20 transition"
      />
    </label>
  );
}

function TiktokGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
