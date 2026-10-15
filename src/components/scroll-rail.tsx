import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Four-up product card. On a phone the next card peeks so the row reads as a carousel. */
export const RAIL_CARD =
  "flex w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]";

/** Wider story card — about three across, with a peek of the next. */
export const RAIL_STORY =
  "flex w-[86%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3.15)]";

export function ScrollRail({
  label,
  tone = "light",
  header,
  action,
  children,
}: {
  label: string;
  tone?: "light" | "dark";
  header: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  function by(direction: number) {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * Math.max(el.clientWidth * 0.86, 220),
      behavior: reduced ? "auto" : "smooth",
    });
  }

  const fits = edges.start && edges.end;
  const btn =
    tone === "dark"
      ? "border-bisque/25 text-bisque hover:border-gold focus-visible:ring-gold"
      : "border-line bg-paper text-kiln hover:border-clay focus-visible:ring-clay";

  return (
    <div
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          by(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          by(-1);
        }
      }}
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">{header}</div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <div className={cn("flex items-center gap-1.5", fits && "hidden")}>
            <button
              type="button"
              aria-label={`Previous ${label}`}
              disabled={edges.start}
              onClick={() => by(-1)}
              className={cn(
                "grid size-9 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-30",
                btn,
              )}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Next ${label}`}
              disabled={edges.end}
              onClick={() => by(1)}
              className={cn(
                "grid size-9 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-30",
                btn,
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="flex items-stretch gap-4 overflow-x-auto py-1 snap-x snap-mandatory motion-safe:scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
