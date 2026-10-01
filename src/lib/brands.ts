import { createServerFn } from "@tanstack/react-start";
import type { BrandShop, BrandSku } from "./brands.server";

export type { BrandShop, BrandSku };

export const BRAND_COPY: Record<string, { line: string }> = {
  corobrik: {
    line: "Clay face brick, paving and retaining ranges that drawings often name outright.",
  },
  bosun: {
    line: "Concrete paving, kerbs and retaining blocks specified as a Bosun product.",
  },
  technicrete: {
    line: "Paving, masonry, erosion protection and mining products from the Technicrete range.",
  },
  infraset: {
    line: "Concrete roof tiles, paving, retaining and the fittings that go with them.",
  },
};

export const listBrandShops = createServerFn({ method: "GET" }).handler(async () => {
  const { brandShops } = await import("./brands.server");
  return brandShops();
});

export const loadBrandShop = createServerFn({ method: "GET" })
  .validator((slug: string) => String(slug ?? "").trim().toLowerCase())
  .handler(async ({ data }) => {
    const { brandRanges } = await import("./brands.server");
    return brandRanges(data);
  });

export const searchBrandRanges = createServerFn({ method: "GET" })
  .validator((q: string) => String(q ?? ""))
  .handler(async ({ data }) => {
    const { matchBrandRanges } = await import("./brands.server");
    return matchBrandRanges(data);
  });
