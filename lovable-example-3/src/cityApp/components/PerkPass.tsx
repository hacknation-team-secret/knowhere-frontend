// QR perk pass — full-screen overlay, "show this at the counter".

import { Check, X } from "lucide-react";
import type { Perk } from "@/cityApp/lib/types";

interface PerkPassProps {
  perk: Perk;
  alreadyRedeemed: boolean;
  onRedeem: () => void;
  onClose: () => void;
}

export function PerkPass({ perk, alreadyRedeemed, onRedeem, onClose }: PerkPassProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-[480px] flex-1 animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
        {/* Header */}
        <div className="flex items-center justify-between bg-stamp px-5 py-4 text-stamp-foreground">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em]">
            Knowhere Pass
          </p>
          <button onClick={onClose} aria-label="Close" className="opacity-80 hover:opacity-100">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {perk.merchantName}
            </p>
            <h2 className="mt-1 font-serif text-3xl leading-tight">{perk.title}</h2>
            <p className="mt-2 text-sm text-foreground/75">{perk.description}</p>
          </div>

          {/* Faux QR */}
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl border border-border bg-secondary/40 p-3">
            <FauxQR seed={perk.id} />
          </div>

          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {perk.windowLabel}
          </p>

          {alreadyRedeemed ? (
            <div className="flex items-center justify-center gap-1.5 rounded-full bg-moss/15 py-3 text-sm font-semibold text-moss">
              <Check className="h-4 w-4" strokeWidth={2.25} />
              Already redeemed
            </div>
          ) : (
            <button
              onClick={() => {
                onRedeem();
              }}
              className="w-full rounded-full bg-stamp py-3 text-sm font-semibold text-stamp-foreground hover:opacity-90"
            >
              Mark as redeemed
            </button>
          )}
        </div>

        {/* Ticket-stub edge */}
        <div className="flex border-t border-dashed border-border bg-secondary/40 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Stamp · Boston</span>
          <span className="ml-auto">No. {perk.id.slice(-5).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

// Deterministic fake QR — not scannable, but visually convincing for the demo.
function FauxQR({ seed }: { seed: string }) {
  const size = 21;
  // Simple xorshift-ish hash so the pattern is stable per perk.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) | 0;
    cells.push(((h >> 8) & 1) === 1);
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
      <rect width={size} height={size} fill="hsl(38 45% 96%)" />
      {cells.map((on, i) => {
        if (!on) return null;
        const x = i % size;
        const y = Math.floor(i / size);
        // Skip the area where finder squares go.
        const isFinderArea =
          (x < 7 && y < 7) ||
          (x > size - 8 && y < 7) ||
          (x < 7 && y > size - 8);
        if (isFinderArea) return null;
        return <rect key={i} x={x} y={y} width="1" height="1" fill="hsl(25 25% 11%)" />;
      })}
      {/* Three finder squares */}
      {[
        [0, 0],
        [size - 7, 0],
        [0, size - 7],
      ].map(([fx, fy], i) => (
        <g key={i}>
          <rect x={fx} y={fy} width="7" height="7" fill="hsl(25 25% 11%)" />
          <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="hsl(38 45% 96%)" />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" fill="hsl(25 25% 11%)" />
        </g>
      ))}
    </svg>
  );
}
