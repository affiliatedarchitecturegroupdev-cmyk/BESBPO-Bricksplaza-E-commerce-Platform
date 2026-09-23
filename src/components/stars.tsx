import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-gold", className)} aria-label={`${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="size-3.5"
          fill={i < Math.round(value) ? "currentColor" : "none"}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}
