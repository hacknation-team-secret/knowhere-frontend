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
  const [preview, setPreview] = useState<ParsedProfile | null>(null);
  const [instagram, setInstagram] = useState(initialInstagram ?? "");
  const [tiktok, setTiktok] = useState(initialTiktok ?? "");

  const handlePreview = () => {
    if (!pasted.trim()) return;
    setPreview(parseProfile(pasted));
  };

  const canPreview = pasted.trim().length > 30 && !preview;

  return (
    <section>
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4">
        Step two
      </p>
      <div className="paper-card p-6 md:p-7 space-y-5 mb-8">
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
      <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-4">
        What did it find?
      </h1>
      <p className="text-[15.5px] leading-[1.6] text-ink-soft max-w-[44ch]">
        Paste what your chatbot returned.
      </p>

      <div className="paper-card mt-8">
        <textarea
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value);
            if (preview) setPreview(null);
          }}
          placeholder="KNOWHERE PASSPORT PROFILE…"
          rows={10}
          className="w-full bg-transparent text-[14px] leading-[1.6] text-ink placeholder:text-ink-soft/45 resize-none focus:outline-none p-5"
        />
        <div className="px-4 pb-3 pt-2 border-t border-line/70">
          <span className="text-[11.5px] text-ink-soft">
            {pasted.trim().length} characters
          </span>
        </div>
      </div>

      {preview && <ProfilePreview profile={preview} />}

      {preview ? (
        <Actions
          primary={{
            label: "Use this profile",
            onClick: () =>
              onUseProfile(preview, {
                instagram: normalize(instagram, "https://instagram.com/"),
                tiktok: normalize(tiktok, "https://tiktok.com/@"),
              }),
          }}
        />
      ) : (
        <Actions
          primary={{
            label: "Preview profile",
            onClick: handlePreview,
            disabled: !canPreview,
          }}
          helper={
            !canPreview
              ? "Paste your profile above to preview it."
              : undefined
          }
        />
      )}
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

function ProfilePreview({ profile }: { profile: ParsedProfile }) {
  const rows: Array<[string, string | string[] | undefined]> = [
    ["Travel style", profile.travelStyle],
    ["Pulls", profile.pulls],
    ["Pushes", profile.pushes],
    ["Pace", profile.pace],
    ["Best detour", profile.bestDetour],
    ["Confidence", profile.confidence],
  ];
  const filled = rows.filter(([, v]) => (Array.isArray(v) ? v.length : !!v));
  const isEmpty = filled.length === 0;

  return (
    <div className="paper-card-lift mt-6 p-6 md:p-7 animate-fade-up">
      <div className="text-[10.5px] tracking-[0.2em] uppercase text-coral mb-4">
        Parsed
      </div>
      {isEmpty ? (
        <p className="text-[14px] text-ink-soft leading-relaxed">
          We couldn't find the section headers — paste the full profile starting with{" "}
          <span className="font-mono text-[12.5px] text-ink">KNOWHERE PASSPORT PROFILE</span>.
        </p>
      ) : (
        <dl className="grid md:grid-cols-2 gap-x-8 gap-y-5">
          {filled.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10.5px] tracking-[0.18em] uppercase text-ink-soft mb-1.5">
                {label}
              </dt>
              <dd className="text-[14px] text-ink leading-[1.55]">
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-1.5">
                    {value.slice(0, 6).map((v, i) => (
                      <span key={i} className="chip">{v}</span>
                    ))}
                  </div>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
