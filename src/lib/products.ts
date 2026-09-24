import { createServerFn } from "@tanstack/react-start";
import type { Product } from "@/data/catalogue";

/** Guest-visible catalogue queries. No auth middleware: product rows are not per-user data. */

export type CatalogueQuery = {
  category?: string;
  sector?: string;
  q?: string;
  scopeColour?: string;
  colour?: string;
  duty?: string;
  fulfilment?: string;
  newOnly?: boolean;
  clearance?: boolean;
  sort?: string;
  page?: number;
};

export type ListingResult = {
  items: Product[];
  total: number;
  duties: string[];
  page: number;
  pages: number;
};

function str(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asQuery(d: CatalogueQuery | undefined): CatalogueQuery {
  const page = Math.max(1, Math.floor(Number(d?.page) || 1));
  return {
    category: str(d?.category),
    sector: str(d?.sector),
    q: str(d?.q),
    scopeColour: str(d?.scopeColour),
    colour: str(d?.colour),
    duty: str(d?.duty),
    fulfilment: str(d?.fulfilment),
    newOnly: d?.newOnly === true,
    clearance: d?.clearance === true,
    sort: str(d?.sort) ?? "featured",
    page,
  };
}

export const queryListing = createServerFn({ method: "POST" })
  .validator((d: CatalogueQuery) => asQuery(d))
  .handler(async ({ data }) => {
    const { queryCatalogue } = await import("./products.server");
    return queryCatalogue(data);
  });

export const loadHome = createServerFn({ method: "GET" }).handler(async () => {
  const { homeCatalogue } = await import("./products.server");
  return homeCatalogue();
});

export const loadProductView = createServerFn({ method: "GET" })
  .validator((d: { sku: string }) => ({ sku: String(d?.sku ?? "").slice(0, 40) }))
  .handler(async ({ data }) => {
    const { productView } = await import("./products.server");
    return productView(data.sku);
  });

export const loadBySkus = createServerFn({ method: "POST" })
  .validator((d: { skus: string[] }) => ({
    skus: Array.isArray(d?.skus) ? d.skus.map((s) => String(s)).slice(0, 40) : [],
  }))
  .handler(async ({ data }) => {
    const { productsBySkus } = await import("./products.server");
    return productsBySkus(data.skus);
  });

export const suggestProducts = createServerFn({ method: "GET" })
  .validator((d: { q: string }) => ({ q: String(d?.q ?? "").slice(0, 80) }))
  .handler(async ({ data }) => {
    const { suggestProducts: suggest } = await import("./products.server");
    return suggest(data.q);
  });

export const loadColourIndex = createServerFn({ method: "GET" }).handler(async () => {
  const { colourIndex } = await import("./products.server");
  return colourIndex();
});

export const loadBundle = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => ({ slug: String(d?.slug ?? "").slice(0, 80) }))
  .handler(async ({ data }) => {
    const { resolveBundle } = await import("./products.server");
    return resolveBundle(data.slug);
  });

export const loadDeskSummary = createServerFn({ method: "GET" }).handler(async () => {
  const { deskSummary } = await import("./products.server");
  return deskSummary();
});

export const loadInventory = createServerFn({ method: "POST" })
  .validator((d: { q?: string; category?: string }) => ({
    q: String(d?.q ?? "").slice(0, 80),
    category: String(d?.category ?? "").slice(0, 80),
  }))
  .handler(async ({ data }) => {
    const { inventoryRows } = await import("./products.server");
    return inventoryRows(data.q, data.category);
  });
