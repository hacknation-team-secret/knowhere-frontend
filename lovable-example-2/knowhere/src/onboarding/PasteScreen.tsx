import { useState } from "react";
import { Actions } from "./Actions";
import { parseProfile } from "./prompt";
import type { ParsedProfile } from "./types";

interface Props {
  onUseProfile: (profile: ParsedProfile) => void;
}

export function PasteScreen({ onUseProfile }: Props) {
  const [pasted, setPasted] = useState("");
  const [preview, setPreview] = useState<ParsedProfile | null>(null);

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
            onClick: () => onUseProfile(preview),
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
