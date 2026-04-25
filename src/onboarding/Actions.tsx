import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ActionsProps {
  primary: { label: string; onClick: () => void; disabled?: boolean };
  secondary?: { label: string; onClick: () => void };
  helper?: ReactNode;
  /** Center actions horizontally instead of stretching */
  align?: "left" | "center";
}

export function Actions({ primary, secondary, helper, align = "left" }: ActionsProps) {
  return (
    <div
      className={`mt-10 flex flex-col gap-3 ${
        align === "center" ? "items-center" : "items-start"
      }`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <Button size="lg" onClick={primary.onClick} disabled={primary.disabled}>
          {primary.label}
        </Button>
        {secondary && (
          <button
            onClick={secondary.onClick}
            className="text-[13.5px] text-ink-soft hover:text-ink underline underline-offset-4 decoration-line hover:decoration-ink transition-colors px-2 py-2"
          >
            {secondary.label}
          </button>
        )}
      </div>
      {helper && <div className="text-[12px] text-ink-soft">{helper}</div>}
    </div>
  );
}
