import { useState } from "react";
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

  const canPreview = pasted.trim().length > 0 && !preview;

  const socials = {
    instagram: instagram.trim() || undefined,
    tiktok: tiktok.trim() || undefined,
  };

  return (
    <section>
      <div className="mb-2 max-w-[60ch]">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4">
          Step two
        </p>
        <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-4">
          What did it discover?
        </h1>
        <p className="text-[15.5px] leading-[1.6] text-ink-soft max-w-[44ch]">
          Paste what your chatbot returned.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">
            Instagram <span className="normal-case tracking-normal text-ink-soft/60">(optional)</span>
          </span>
          <input
            type="url"
            inputMode="url"
            autoComplete="off"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="instagram.com/yourhandle"
            className="mt-1.5 w-full bg-transparent border border-line rounded-md px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-soft/45 focus:outline-none focus:border-ocean/60"
          />
        </label>
        <label className="block">
          <span className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">
            TikTok <span className="normal-case tracking-normal text-ink-soft/60">(optional)</span>
          </span>
          <input
            type="url"
            inputMode="url"
            autoComplete="off"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="tiktok.com/@yourhandle"
            className="mt-1.5 w-full bg-transparent border border-line rounded-md px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-soft/45 focus:outline-none focus:border-ocean/60"
          />
        </label>
      </div>

      <div className="paper-card mt-4">
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
      </div>

      {preview && <ProfilePreview profile={preview} />}

      {preview ? (
        <Actions
          primary={{
            label: "See my passport",
            onClick: () => onUseProfile(preview, socials),
          }}
        />
      ) : (
        <Actions
          primary={{
            label: "Preview profile",
            onClick: handlePreview,
            disabled: !canPreview,
          }}
        />
      )}
    </section>
  );
}

// Light cleanup — keep full text, just trim trailing punctuation noise.
function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

type ChipRow = {
  emoji: string;
  label: string;
  items: string[];
  tone: "pull" | "push" | "neutral";
};

function ProfilePreview({ profile }: { profile: ParsedProfile }) {
  const summary = profile.travelStyle ? clean(profile.travelStyle) : null;

  const chipRows: ChipRow[] = (
    [
      {
        emoji: "🧲",
        label: "Pulls",
        items: (profile.pulls ?? []).map(clean).filter(Boolean),
        tone: "pull",
      },
      {
        emoji: "🚫",
        label: "Pushes",
        items: (profile.pushes ?? []).map(clean).filter(Boolean),
        tone: "push",
      },
    ] as ChipRow[]
  ).filter((r) => r.items.length > 0);

  const meta: Array<{ emoji: string; label: string; value: string }> = [];
  if (profile.pace) meta.push({ emoji: "⏱", label: "Pace", value: clean(profile.pace) });
  if (profile.bestDetour)
    meta.push({ emoji: "🗺", label: "Detour", value: clean(profile.bestDetour) });
  if (profile.confidence)
    meta.push({ emoji: "✨", label: "Confidence", value: clean(profile.confidence) });

  const isEmpty = !summary && chipRows.length === 0 && meta.length === 0;

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
        <div className="space-y-5">
          {summary && (
            <p className="font-serif text-[20px] md:text-[22px] leading-[1.3] text-ink">
              {summary}
            </p>
          )}

          {chipRows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[14px]" aria-hidden>
                  {row.emoji}
                </span>
                <span className="text-[10.5px] tracking-[0.18em] uppercase text-ink-soft">
                  {row.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {row.items.map((v, i) => (
                  <span
                    key={i}
                    className={
                      (row.tone === "pull"
                        ? "chip border-ocean/30 text-ink"
                        : row.tone === "push"
                          ? "chip border-coral/40 text-ink-soft"
                          : "chip") + " max-w-full whitespace-normal text-left leading-snug"
                    }
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {meta.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-3 border-t border-line/60">
              {meta.map((m) => (
                <div key={m.label} className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                  <span aria-hidden>{m.emoji}</span>
                  <span className="text-ink">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
