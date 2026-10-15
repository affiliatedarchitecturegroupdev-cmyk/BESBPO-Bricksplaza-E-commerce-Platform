import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarPicker({
  value,
  onChange,
  disabled,
  label = "Star this product",
}: {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span role="radiogroup" aria-label={label} className="inline-flex items-center gap-0.5 text-gold" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay disabled:opacity-40"
        >
          <Star className={cn("size-5", n <= shown ? "fill-current" : "")} strokeWidth={1.75} />
        </button>
      ))}
    </span>
  );
}
