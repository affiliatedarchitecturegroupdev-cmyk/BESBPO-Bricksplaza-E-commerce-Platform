import { createFileRoute } from "@tanstack/react-router";
import { loadDeskSummary } from "@/lib/products";
import { formatZar } from "@/lib/format";

export const Route = createFileRoute("/desk/pricing")({
  loader: () => loadDeskSummary(),
  component: Pricing,
});

function Pricing() {
  const { categories } = Route.useLoaderData();
  return (
    <div>
      <h1 className="font-display text-3xl">Pricing engine</h1>
      <p className="mt-1 text-sm text-dim">
        Retail, trade and volume are the stored official prices, excluding VAT. Checkout does not add a further percentage.
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
            {categories.map((r) => (
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
