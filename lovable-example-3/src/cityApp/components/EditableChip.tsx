// A chip that can be tapped to cycle through options, OR opened as a popover
// for a fuller picker. Used by City Pulse to make the entire context bar
// directly editable — every tap regenerates the Detour.

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditableChipProps<T extends string | number> {
  label: string; // displayed text
  icon?: React.ReactNode;
  value: T;
  options: readonly T[];
  formatOption?: (v: T) => string;
  onChange: (next: T) => void;
  tone?: "stamp" | "accent" | "moss";
}

export function EditableChip<T extends string | number>({
  label,
  icon,
  value,
  options,
  formatOption,
  onChange,
  tone = "stamp",
}: EditableChipProps<T>) {
  const [open, setOpen] = useState(false);

  const toneClasses =
    tone === "accent"
      ? "border-accent/30 bg-accent/10 text-accent"
      : tone === "moss"
        ? "border-moss/30 bg-moss/10 text-moss"
        : "border-stamp/30 bg-stamp/10 text-stamp";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium tracking-tight transition-all hover:shadow-soft active:scale-[0.97]",
            toneClasses,
          )}
        >
          {icon}
          <span>{label}</span>
          <ChevronDown
            className="h-3 w-3 opacity-60 transition-transform group-data-[state=open]:rotate-180"
            strokeWidth={2.25}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-44 rounded-2xl border-border/70 bg-card p-1.5 shadow-lift"
      >
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {options.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={String(opt)}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] transition-colors",
                  active
                    ? "bg-stamp/10 font-medium text-stamp"
                    : "text-foreground/80 hover:bg-secondary/60",
                )}
              >
                <span>{formatOption ? formatOption(opt) : String(opt)}</span>
                {active && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
