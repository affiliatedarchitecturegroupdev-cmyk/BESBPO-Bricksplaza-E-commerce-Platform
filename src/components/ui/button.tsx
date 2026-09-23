import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
  {
    variants: {
      variant: {
        primary: "bg-clay text-paper hover:bg-clay-light",
        kiln: "bg-kiln text-bisque hover:bg-kiln-2",
        gold: "bg-gold text-kiln hover:bg-gold/90",
        outline: "border border-line bg-paper text-kiln hover:bg-card",
        ghost: "text-kiln hover:bg-card",
        inverse: "bg-bisque text-kiln hover:bg-paper",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
