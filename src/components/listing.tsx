import { useEffect, useState } from "react";
import { ProductGrid } from "./product-card";
import { COLOURS } from "@/data/taxonomy";
import { Select } from "./ui/input";
import { Button } from "./ui/button";
import { queryListing, type CatalogueQuery, type ListingResult } from "@/lib/products";

export type ListingScope = {
  category?: string;
  sector?: string;
  q?: string;
  colour?: string;
  newOnly?: boolean;
  clearance?: boolean;
};

export function Listing({
  scope,
  initial,
  title,
}: {
  scope: ListingScope;
  initial: ListingResult;
  title?: string;
}) {
  const [colour, setColour] = useState("");
  const [duty, setDuty] = useState("");
  const [fulfilment, setFulfilment] = useState("");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(initial);
  const [pending, setPending] = useState(false);
  const scopeKey = JSON.stringify(scope);
  const isDefault = !colour && !duty && !fulfilment && sort === "featured" && page === 1;

  useEffect(() => {
    if (isDefault) return;
    let cancel = false;
    const parsed = JSON.parse(scopeKey) as ListingScope;
    const query: CatalogueQuery = {
      ...parsed,
      scopeColour: parsed.colour,
      colour: colour || undefined,
      duty: duty || undefined,
      fulfilment: fulfilment || undefined,
      sort,
      page,
    };
    setPending(true);
    queryListing({ data: query })
      .then((res) => {
        if (!cancel) setData(res);
      })
      .finally(() => {
        if (!cancel) setPending(false);
      });
    return () => {
      cancel = true;
    };
  }, [isDefault, scopeKey, colour, duty, fulfilment, sort, page]);

  const view = isDefault ? initial : data;
  const duties = view.duties;

  return (
    <div className={pending ? "opacity-70" : undefined}>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-mortar">
          {title ? `${title} · ` : ""}
          <span className="tabular-nums font-medium text-kiln">{view.total}</span> SKUs
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Select
            value={colour}
            onChange={(e) => {
              setColour(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All colours</option>
            {COLOURS.map((c) => (
              <option key={c.slug}>{c.name}</option>
            ))}
          </Select>
          <Select
            value={duty}
            onChange={(e) => {
              setDuty(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Duty class</option>
            {duties.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
          <Select
            value={fulfilment}
            onChange={(e) => {
              setFulfilment(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Fulfilment</option>
            <option>Stock Item</option>
            <option>Made-to-Order</option>
          </Select>
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price · low</option>
            <option value="price-desc">Price · high</option>
            <option value="rating">Top rated</option>
          </Select>
        </div>
      </div>
      <ProductGrid products={view.items} />
      {view.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={view.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm tabular-nums text-mortar">
            {view.page} / {view.pages}
          </span>
          <Button variant="outline" disabled={view.page >= view.pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
