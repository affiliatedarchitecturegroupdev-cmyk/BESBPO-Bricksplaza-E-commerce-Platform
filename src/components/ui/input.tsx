import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-line bg-paper px-3 text-sm text-kiln placeholder:text-muted shadow-[var(--shadow-card)] focus:outline-none focus:ring-2 focus:ring-clay/30",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-kiln placeholder:text-muted shadow-[var(--shadow-card)] focus:outline-none focus:ring-2 focus:ring-clay/30",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-line bg-paper px-3 text-sm text-kiln shadow-[var(--shadow-card)] focus:outline-none focus:ring-2 focus:ring-clay/30",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-kiln", className)} {...props} />;
}
