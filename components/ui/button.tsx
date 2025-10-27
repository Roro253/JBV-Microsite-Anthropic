import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-[var(--button-min-height)] items-center justify-center gap-[var(--gap-2)] whitespace-nowrap rounded-[var(--radius-lg)] border border-transparent px-[var(--pad-x-3)] py-[var(--pad-y-2)] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60 [&>svg]:h-[var(--icon-size)] [&>svg]:w-[var(--icon-size)] [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 text-white shadow-[0_20px_40px_-24px_rgba(32,118,199,0.6)] hover:from-sky-500 hover:via-sky-500 hover:to-sky-400",
        subtle:
          "border-sky-200 bg-white/80 text-sky-700 hover:bg-white",
        outline:
          "border-sky-300 bg-transparent text-sky-600 hover:bg-sky-100/40",
        ghost:
          "text-slate-600 hover:bg-sky-100/60 hover:text-sky-700",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-400",
        link:
          "border-transparent bg-transparent text-sky-600 hover:text-sky-700 hover:underline"
      },
      size: {
        default: "text-sm",
        sm: "min-h-[2.5rem] px-4 text-xs",
        lg: "min-h-[3rem] px-6 text-base",
        icon: "min-h-[var(--button-min-height)] px-0 [&>svg]:mx-auto"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
