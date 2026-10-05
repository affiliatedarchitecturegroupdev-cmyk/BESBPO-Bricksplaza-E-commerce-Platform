import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout";
import { ProductMedia } from "@/components/product-media";
import { loadCatalogueJournal } from "@/lib/products";
import { formatZar } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/catalogue";

export const Route = createFileRoute("/catalogue")({
  loader: () => loadCatalogueJournal({ data: { page: 1 } }).catch(() => emptyJournal()),
  component: Catalogue,
});

function emptyJournal() {
  return { items: [] as Product[], total: 0, page: 1, pages: 1 };
}

function Catalogue() {
  const initial = Route.useLoaderData();
  const [data, setData] = useState(initial);
  const [pending, setPending] = useState(false);

  function go(page: number) {
    setPending(true);
    loadCatalogueJournal({ data: { page } })
      .then(setData)
      .finally(() => setPending(false));
  }

  return (
    <>
      <PageHeader
        kicker="Master catalogue"
        title="Every SKU, newest first"
        body="The priced catalogue as a running list. A new unit appears at the top when it is entered. Open a category in the shop when you already know the range."
      />
      <div className={`mx-auto max-w-3xl px-4 py-10 sm:px-6 ${pending ? "opacity-70" : ""}`}>
        <p className="text-sm text-mortar">
          <span className="tabular-nums font-medium text-kiln">{data.total}</span> priced SKUs
        </p>
        <ol className="mt-6 space-y-6">
          {data.items.map((product) => (
            <li key={product.sku}>
              <Link
                to="/product/$sku"
                params={{ sku: product.sku }}
                className="grid gap-4 overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)] sm:grid-cols-[11rem_1fr]"
              >
                <ProductMedia product={product} alt="" className="aspect-[4/3] sm:aspect-auto sm:h-full" />
                <div className="p-5 sm:pl-0">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-clay">
                    {product.category}
                    {product.listedAt
                      ? ` · ${new Date(product.listedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}`
                      : ""}
                  </p>
                  <h2 className="mt-1 font-display text-2xl">{product.productName}</h2>
                  <p className="mt-1 text-sm text-mortar">
                    {product.sku} · {product.colourFinish}
                    {product.sizeMm !== "—" ? ` · ${product.sizeMm} mm` : ""}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm">{product.description}</p>
                  <p className="mt-3 font-display text-lg tabular-nums">{formatZar(product.retailPrice, product.retailPrice >= 1000)}</p>
                  <p className="text-[11px] text-muted">{product.unitOfSale}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
        {data.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" disabled={data.page <= 1 || pending} onClick={() => go(data.page - 1)}>
              Newer
            </Button>
            <span className="text-sm tabular-nums text-mortar">
              {data.page} / {data.pages}
            </span>
            <Button variant="outline" disabled={data.page >= data.pages || pending} onClick={() => go(data.page + 1)}>
              Older
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
