import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, TIER_DISCOUNT } from "@/data/taxonomy";
import { getCatalogue } from "@/data/catalogue";
import { formatZar } from "@/lib/format";

export const Route = createFileRoute("/desk/pricing")({ component: Pricing });

function Pricing() {
  const cat = getCatalogue();
  const rows = CATEGORIES.map((c) => {
    const items = cat.filter((p) => p.categorySlug === c.slug);
    const avg = items.reduce((n, p) => n + p.retailPrice, 0) / (items.length || 1);
    return { ...c, count: items.length, avg };
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Pricing engine</h1>
      <p className="mt-1 text-sm text-dim">
        Retail 0% · Trade {TIER_DISCOUNT.trade * 100}% · Volume {TIER_DISCOUNT.volume * 100}% · MTO +15%. Server-authoritative at checkout.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th>SKUs</th>
              <th>Avg retail</th>
              <th>Standard</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-t border-bisque/10">
                <td className="px-4 py-2">{r.name}</td>
                <td>{r.count}</td>
                <td className="tabular-nums">{formatZar(r.avg, true)}</td>
                <td>{r.standard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
