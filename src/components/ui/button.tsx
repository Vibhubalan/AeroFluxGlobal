import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#b54332] text-[#f4efe6] hover:bg-[#9a3829] rounded-md border border-transparent",
        destructive:
          "bg-red text-white hover:bg-red/90 rounded-md",
        outline:
          "border border-ink/15 bg-transparent text-ink hover:border-red hover:text-red rounded-md",
        outlineLight:
          "border border-white/30 bg-transparent text-white/90 hover:border-white hover:text-white rounded-md",
        secondary:
          "bg-navy text-white hover:bg-navy-2 rounded-md",
        ghost:
          "text-ink hover:bg-ink/5 hover:text-red rounded-md",
        link:
          "text-red underline-offset-4 hover:underline",
        pill:
          "bg-[#2c2928] text-[#f4efe6] hover:bg-[#3d3a38] rounded-full border border-transparent",
        pillOutline:
          "border border-ink/15 bg-transparent text-ink hover:border-red hover:text-red rounded-full",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-11 px-7 text-sm font-semibold tracking-wide",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>,
        {
          className: cn(
            buttonVariants({ variant, size, className }),
            (children.props as { className?: string })?.className
          ),
          ...props,
        }
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
