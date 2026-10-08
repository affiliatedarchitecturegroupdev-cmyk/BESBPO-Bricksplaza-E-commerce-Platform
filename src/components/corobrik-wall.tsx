import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { COROBRIK_WALL } from "@/data/corobrik-wall";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All 88" },
  { id: "face", label: "Face brick" },
  { id: "paving", label: "Clay paving" },
] as const;

export function CorobrikWall() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return COROBRIK_WALL.filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;
      if (!needle) return true;
      return `${item.name} ${item.code} ${item.finish} ${item.factory}`.toLowerCase().includes(needle);
    });
  }, [filter, q]);

  return (
    <div>
      <p className="max-w-3xl text-sm text-mortar">
        88 colours from the Brick Tile Shop Corobrik board. Five names already sit in the brochure ranges. The other 83 do not.
        These photographs are that shop’s, not a Corobrik factory swatch, and the prices on that site are not Bricksplaza prices.
        The size below is what their sheet prints. Strength and absorption figures on the same sheet are not repeated here.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              filter === item.id ? "border-clay bg-clay text-white" : "border-line bg-paper text-mortar",
            )}
          >
            {item.label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a colour"
          className="ml-auto h-9 w-full max-w-xs rounded-md border border-line bg-paper px-3 text-sm"
        />
      </div>
      <p className="mt-3 text-xs text-muted">{shown.length} shown</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-line bg-paper">
            <img src={item.image} alt={item.name} className="aspect-square w-full object-cover" />
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-clay">
                {item.code || "Sheet"} · {item.kind === "face" ? "Face brick" : "Clay paving"}
              </p>
              <h3 className="mt-1 font-display text-xl leading-tight">{item.name}</h3>
              <dl className="mt-3 space-y-1 text-sm">
                {item.finish && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Finish</dt>
                    <dd>{item.finish}</dd>
                  </div>
                )}
                {item.sheetSize && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Trade sheet</dt>
                    <dd className="text-right">{item.sheetSize}</dd>
                  </div>
                )}
                {item.factory && <p className="text-xs text-muted">{item.factory}</p>}
              </dl>
              {item.note && <p className="mt-2 text-xs text-muted">{item.note}.</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link to="/rfq" search={{ sku: item.name }}>
                  <Button>Request this colour</Button>
                </Link>
                <a href={item.href} target="_blank" rel="noreferrer" className="text-sm text-clay">
                  Trade sheet
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
