import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 will-change-transform hover:-translate-y-0.5 active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-full border border-white/45 bg-[linear-gradient(135deg,hsl(var(--ocean))_0%,hsl(var(--harbor))_42%,hsl(var(--gold))_100%)] text-paper-soft font-medium shadow-[0_12px_30px_-14px_hsl(var(--ocean)/0.7)] hover:brightness-[1.04] hover:shadow-[0_18px_36px_-16px_hsl(var(--harbor)/0.72)]",
        destructive:
          "rounded-full border border-white/30 bg-[linear-gradient(135deg,hsl(var(--destructive))_0%,hsl(var(--coral))_100%)] text-destructive-foreground shadow-[0_12px_30px_-16px_hsl(var(--destructive)/0.65)] hover:brightness-[1.04]",
        outline:
          "rounded-full border border-white/60 bg-[linear-gradient(135deg,hsl(var(--paper-soft))_0%,hsl(var(--primary-soft)/0.72)_46%,hsl(var(--accent-soft)/0.92)_100%)] text-ink font-medium shadow-[0_10px_26px_-18px_hsl(var(--harbor)/0.55)] hover:border-white/75 hover:shadow-[0_16px_30px_-18px_hsl(var(--gold)/0.65)]",
        secondary:
          "rounded-full border border-white/55 bg-[linear-gradient(135deg,hsl(var(--paper-soft))_0%,hsl(var(--secondary-soft)/0.82)_46%,hsl(var(--accent-soft)/0.82)_100%)] text-ink font-medium shadow-[0_10px_26px_-18px_hsl(var(--moss)/0.42)] hover:brightness-[1.03]",
        ghost:
          "rounded-full border border-white/35 bg-[linear-gradient(135deg,hsl(var(--paper-soft)/0.7)_0%,hsl(var(--primary-soft)/0.42)_48%,hsl(var(--accent-soft)/0.58)_100%)] text-ink shadow-[0_10px_22px_-18px_hsl(var(--harbor)/0.45)] hover:brightness-[1.04]",
        link:
          "text-ocean underline-offset-4 hover:underline",
        passport:
          "rounded-full border border-white/45 bg-[linear-gradient(135deg,hsl(var(--ocean-deep))_0%,hsl(var(--ocean))_30%,hsl(var(--harbor))_68%,hsl(var(--gold))_100%)] text-paper-soft font-medium shadow-[0_14px_34px_-16px_hsl(var(--ocean)/0.72)] hover:brightness-[1.05]",
        coral:
          "rounded-full border border-white/40 bg-[linear-gradient(135deg,hsl(var(--coral))_0%,hsl(var(--ruby))_55%,hsl(var(--gold))_100%)] text-paper-soft font-medium shadow-[0_12px_30px_-16px_hsl(var(--coral)/0.72)] hover:brightness-[1.04]",
        gold:
          "rounded-full border border-white/50 bg-[linear-gradient(135deg,hsl(var(--gold))_0%,hsl(var(--paper-soft))_40%,hsl(var(--harbor))_100%)] text-ink font-medium shadow-[0_12px_28px_-16px_hsl(var(--gold)/0.66)] hover:brightness-[1.04]",
        stamp:
          "rounded-full border border-white/40 bg-[linear-gradient(135deg,hsl(var(--coral))_0%,hsl(var(--ruby))_52%,hsl(var(--gold))_100%)] text-paper-soft font-medium shadow-[0_12px_30px_-16px_hsl(var(--coral)/0.72)] hover:brightness-[1.04]",
        ghost_ink:
          "rounded-full border border-white/30 bg-[linear-gradient(135deg,hsl(var(--paper-soft)/0.35)_0%,hsl(var(--primary-soft)/0.22)_50%,hsl(var(--accent-soft)/0.32)_100%)] text-ink-soft hover:text-ink shadow-[0_8px_20px_-18px_hsl(var(--harbor)/0.38)]",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-6 text-[15px]",
        xl: "h-[52px] px-7 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
