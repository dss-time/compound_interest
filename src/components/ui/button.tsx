import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/ui";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium motion-safe:transform-gpu transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_26px_hsl(var(--primary)/0.18)] hover:-translate-y-px hover:bg-primary/94 hover:shadow-[0_14px_30px_hsl(var(--primary)/0.22)]",
        secondary:
          "bg-secondary/88 text-secondary-foreground shadow-[0_8px_18px_rgba(15,23,42,0.06)] hover:-translate-y-px hover:bg-secondary/82 hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]",
        outline:
          "border border-input bg-background/82 shadow-[0_8px_18px_rgba(15,23,42,0.05)] hover:-translate-y-px hover:bg-accent/86 hover:text-accent-foreground hover:shadow-[0_10px_22px_rgba(15,23,42,0.07)]",
        ghost:
          "hover:bg-accent/70 hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_12px_26px_hsl(var(--destructive)/0.18)] hover:-translate-y-px hover:bg-destructive/94 hover:shadow-[0_14px_30px_hsl(var(--destructive)/0.22)]",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-10 rounded-xl px-3.5",
        lg: "h-12 rounded-xl px-6",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
