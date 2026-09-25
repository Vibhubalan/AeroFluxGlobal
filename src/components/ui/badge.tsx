import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-red text-white shadow-xs",
        secondary:
          "border border-transparent bg-navy text-white",
        outline:
          "border border-white/15 text-ink glass-panel",
        amber:
          "border border-amber/30 bg-amber/10 text-amber",
        redMuted:
          "border border-red/25 bg-red/10 text-red",
        mono:
          "border border-white/12 glass-panel font-mono text-[10px] tracking-wider uppercase text-steel",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
