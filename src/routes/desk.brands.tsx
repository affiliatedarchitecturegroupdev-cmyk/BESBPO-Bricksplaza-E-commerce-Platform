import { createFileRoute, Link } from "@tanstack/react-router";
import { listBrandShops, loadBrandShop } from "@/lib/brands";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/desk/brands")({
  loader: () => listBrandShops(),
  component: DeskBrands,
});

function DeskBrands() {
  const shops = Route.useLoaderData();
  const [slug, setSlug] = useState(shops[0]?.brand_slug ?? "");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof loadBrandShop>>>([]);

  useEffect(() => {
    if (!slug) return;
    loadBrandShop({ data: slug }).then(setRows).catch(() => setRows([]));
  }, [slug]);

  const open = rows.filter((r) => !r.dimensions || !r.colour_finish || !r.standard_ref).length;

  return (
    <div>
      <h1 className="font-display text-3xl">Manufacturer ranges</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Quote-only. These SKUs are not in the priced catalogue and cannot be checked out. {open} of the ranges on screen still need a confirmed size, colour or standard.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {shops.map((shop) => (
          <button
            key={shop.brand_slug}
            type="button"
            onClick={() => setSlug(shop.brand_slug)}
            className={`rounded-md px-3 py-1.5 text-sm ${slug === shop.brand_slug ? "bg-bisque/15 text-bisque" : "text-dim"}`}
          >
            {shop.brand} · {shop.ranges}
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th>Range</th>
              <th>Size</th>
              <th>Colour</th>
              <th>Standard</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku} className="border-t border-bisque/10">
                <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                <td>
                  {row.name}
                  <span className="mt-0.5 block text-xs text-dim">{row.family}</span>
                </td>
                <td>{row.dimensions ?? "—"}</td>
                <td>{row.colour_finish ?? "—"}</td>
                <td>{row.standard_ref ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/brands/$slug" params={{ slug: slug || "corobrik" }} className="mt-4 inline-block text-sm text-gold">
        Open the public shop →
      </Link>
    </div>
  );
}
