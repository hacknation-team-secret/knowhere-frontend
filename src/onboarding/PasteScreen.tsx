import { useState } from "react";
import { Instagram } from "lucide-react";
import { Actions } from "./Actions";
import { parseProfile } from "./prompt";
import type { ParsedProfile } from "./types";

interface Props {
  initialInstagram?: string;
  initialTiktok?: string;
  onUseProfile: (
    profile: ParsedProfile,
    socials: { instagram?: string; tiktok?: string },
  ) => void;
}

function normalize(value: string, base: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@+/, "");
  return handle ? `${base}${handle}` : undefined;
}

export function PasteScreen({
  initialInstagram,
  initialTiktok,
  onUseProfile,
}: Props) {
  const [pasted, setPasted] = useState("");
  const [instagram, setInstagram] = useState(initialInstagram ?? "");
  const [tiktok, setTiktok] = useState(initialTiktok ?? "");

  const handleContinue = () => {
    if (!pasted.trim()) return;
    onUseProfile(parseProfile(pasted), {
      instagram: normalize(instagram, "https://instagram.com/"),
      tiktok: normalize(tiktok, "https://tiktok.com/@"),
    });
  };

  const canContinue = pasted.trim().length > 30;

  return (
    <section>
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4">
        Step two
      </p>
      <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-4">
        What did it find?
      </h1>
      <p className="text-[15.5px] leading-[1.6] text-ink-soft max-w-[44ch]">
        Paste what your chatbot returned from the user's chat history.
      </p>

      <div className="paper-card mt-8">
        <textarea
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value);
          }}
          placeholder="Paste the passport profile generated from the user's chat history…"
          rows={10}
          className="w-full bg-transparent text-[14px] leading-[1.6] text-ink placeholder:text-ink-soft/45 resize-none focus:outline-none p-5"
        />
        <div className="px-4 pb-3 pt-2 border-t border-line/70">
          <span className="text-[11.5px] text-ink-soft">
            {pasted.trim().length} characters
          </span>
        </div>
      </div>

      <div className="paper-card p-6 md:p-7 space-y-5 mt-6">
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
          Optional. We only use these as a soft signal. Nothing is posted, followed, or shared.
        </p>
      </div>

      <Actions
        primary={{
          label: "Create my passport",
          onClick: handleContinue,
          disabled: !canContinue,
        }}
        helper={
          !canContinue
            ? "Paste your profile above to continue."
            : "We’ll turn this into a visual passport next."
        }
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
