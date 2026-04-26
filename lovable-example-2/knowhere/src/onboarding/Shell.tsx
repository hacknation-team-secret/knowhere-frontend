import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface ShellProps {
  children: ReactNode;
  step: number;
  total: number;
  onBack?: () => void;
  /** When true, content takes full width inside the page (used for hero screens) */
  wide?: boolean;
}

export function Shell({ children, step, total, onBack, wide = false }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              disabled={!onBack}
              aria-label="Back"
              className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="size-4" strokeWidth={1.6} />
              <span>Back</span>
            </button>
            <span className="font-serif text-[18px] tracking-wide text-ink lowercase">
              Knowhere
            </span>
            <span className="text-[11px] tracking-[0.18em] uppercase text-ink-soft tabular-nums">
              {step + 1} / {total}
            </span>
          </div>
          <Progress step={step} total={total} />
        </div>
      </header>

      <main className="flex-1 w-full">
        <div
          className={
            wide
              ? "max-w-[1180px] mx-auto px-6 md:px-10 py-10 md:py-14 animate-fade-up"
              : "max-w-[640px] mx-auto px-6 md:px-8 py-10 md:py-14 animate-fade-up"
          }
          key={step}
        >
          {children}
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-[11px] tracking-[0.18em] uppercase text-ink-soft/70">
          Know where to go.
        </p>
      </footer>
    </div>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[2px] flex-1 rounded-full transition-all duration-500 ${
            i <= step ? "bg-ink" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}
