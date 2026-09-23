import { useMemo, useState } from "react";
import type { Product } from "@/data/catalogue";
import { ProductGrid } from "./product-card";
import { COLOURS } from "@/data/taxonomy";
import { Select } from "./ui/input";
import { Button } from "./ui/button";

export function Listing({
  products,
  title,
}: {
  products: Product[];
  title?: string;
}) {
  const [colour, setColour] = useState("");
  const [duty, setDuty] = useState("");
  const [fulfilment, setFulfilment] = useState("");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const duties = useMemo(
    () => [...new Set(products.map((p) => p.dutyLoadClass))].filter((d) => d !== "N/A"),
    [products],
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (colour && p.colourFinish !== colour) return false;
      if (duty && p.dutyLoadClass !== duty) return false;
      if (fulfilment && p.fulfilmentType !== fulfilment) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.retailPrice - b.retailPrice);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.retailPrice - a.retailPrice);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "featured") {
      const familyRank: Record<string, number> = {
        "clay-masonry": 0,
        "hard-landscaping": 1,
        specialist: 2,
        concrete: 3,
      };
      list = [...list].sort((a, b) => {
        const fa = familyRank[a.family] ?? 9;
        const fb = familyRank[b.family] ?? 9;
        if (fa !== fb) return fa - fb;
        if (a.isBestSeller !== b.isBestSeller) return Number(b.isBestSeller) - Number(a.isBestSeller);
        return b.rating - a.rating;
      });
    }
    return list;
  }, [products, colour, duty, fulfilment, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-mortar">
          {title ? `${title} · ` : ""}
          <span className="tabular-nums font-medium text-kiln">{filtered.length}</span> SKUs
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
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price · low</option>
            <option value="price-desc">Price · high</option>
            <option value="rating">Top rated</option>
          </Select>
        </div>
      </div>
      <ProductGrid products={slice} />
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm tabular-nums text-mortar">
            {page} / {pages}
          </span>
          <Button variant="outline" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
