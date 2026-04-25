import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ocean text-paper-soft hover:bg-ocean/92 rounded-full font-medium",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full",
        outline:
          "bg-paper-soft border border-line text-ink hover:bg-card rounded-full font-medium",
        secondary:
          "bg-paper-soft text-ink border border-line hover:bg-card rounded-full font-medium",
        ghost:
          "hover:bg-card text-ink rounded-full",
        link:
          "text-ocean underline-offset-4 hover:underline",
        passport:
          "bg-ocean text-paper-soft hover:bg-ocean/92 rounded-full font-medium",
        coral:
          "bg-coral text-paper-soft hover:bg-coral/92 rounded-full font-medium",
        gold:
          "bg-gold text-ink hover:bg-gold/92 rounded-full font-medium",
        stamp:
          "bg-coral text-paper-soft hover:bg-coral/92 rounded-full font-medium",
        ghost_ink:
          "bg-transparent text-ink-soft hover:text-ink",
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
