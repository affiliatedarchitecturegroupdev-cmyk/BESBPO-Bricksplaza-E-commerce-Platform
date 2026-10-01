import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { loadProductView } from "@/lib/products";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/spec/$sku")({
  loader: async ({ params }) => {
    const view = await loadProductView({ data: { sku: params.sku } });
    if (!view?.product) throw notFound();
    return view.product;
  },
  component: SpecSheet,
});

function SpecSheet() {
  const product = Route.useLoaderData();
  const rows: [string, string][] = [
    ["SKU", product.sku],
    ["Category", product.category],
    ["Family", product.family],
    ["Type", product.productType],
    ["Name", product.productName],
    ["Colour / finish", String(product.colourFinish)],
    ["Size", product.sizeMm === "—" ? "—" : `${product.sizeMm} mm`],
    ["Thickness", product.thicknessMm === "—" ? "—" : `${product.thicknessMm} mm`],
    ["Unit of sale", product.unitOfSale],
    ["Applicable standard", product.applicableStandard],
    ["Duty / load class", product.dutyLoadClass],
    ["Sectors", product.sectorsServed.join(", ")],
    ["Fulfilment", product.fulfilmentType],
    ["Units per pallet", String(product.unitsPerPallet)],
    ["Mass per unit", `${product.weightKg} kg`],
    ["Coverage", product.coveragePerM2 ? `${product.coveragePerM2} units / m²` : "—"],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Bricksplaza · catalogue sheet</p>
      <h1 className="mt-2 font-display text-4xl">{product.productName}</h1>
      <p className="mt-1 font-mono text-sm text-muted">{product.sku}</p>
      <table className="mt-8 w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-line">
              <th className="w-48 py-2 pr-4 text-left font-medium text-mortar">{k}</th>
              <td className="py-2">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6 text-sm text-mortar">{product.description}</p>
      <p className="mt-4 text-xs text-muted">
        Taken from the Bricksplaza catalogue. Clay colour and size vary between batches. This sheet is not a manufacturer certificate and it is not a price.
      </p>
      <div className="mt-6 flex gap-3 print:hidden">
        <Button type="button" onClick={() => window.print()}>
          Print or save as PDF
        </Button>
        <Link to="/product/$sku" params={{ sku: product.sku }} className="inline-flex items-center text-sm text-clay">
          Back to the product
        </Link>
      </div>
    </div>
  );
}
