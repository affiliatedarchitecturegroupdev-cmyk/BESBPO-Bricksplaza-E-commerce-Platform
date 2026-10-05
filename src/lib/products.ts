import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
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

export const loadCatalogueJournal = createServerFn({ method: "GET" })
  .validator((d: { page?: number }) => ({
    page: Math.max(1, Math.floor(Number(d?.page) || 1)),
  }))
  .handler(async ({ data }) => {
    const { catalogueJournal } = await import("./products.server");
    return catalogueJournal(data.page);
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

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { sku?: string; delta?: number; reason?: string }) => ({
    sku: String(d?.sku ?? "").trim().slice(0, 40),
    delta: Math.trunc(Number(d?.delta)),
    reason: String(d?.reason ?? "").trim().slice(0, 160),
  }))
  .handler(async ({ context, data }) => {
    if (!data.sku) throw new Error("Enter a SKU");
    if (!Number.isFinite(data.delta) || data.delta === 0 || Math.abs(data.delta) > 100000) {
      throw new Error("Enter a quantity change between -100000 and 100000, not zero");
    }
    if (data.reason.length < 3) throw new Error("Say why the stock changed");
    const { assertYard } = await import("./commerce");
    await assertYard(context.userId);
    const { applyStockDelta } = await import("./products.server");
    const stock = await applyStockDelta(data.sku, data.delta, data.reason, context.userId);
    if (stock == null) throw new Error("That SKU is not a stock item, or the adjustment would go below zero");
    return { stock };
  });

export const loadStockLog = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { assertYard } = await import("./commerce");
    try {
      await assertYard(context.userId);
    } catch {
      return [];
    }
    const { recentStockEvents } = await import("./products.server");
    return recentStockEvents();
  });
