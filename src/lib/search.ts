import type { Product } from "@/data/catalogue";
import { CATEGORIES } from "@/data/taxonomy";

export type Facets = {
  q?: string;
  category?: string;
  colour?: string;
  duty?: string;
  fulfilment?: string;
  sector?: string;
  standard?: string;
  minPrice?: number;
  maxPrice?: number;
  family?: string;
  newOnly?: boolean;
  clearance?: boolean;
};

const SYNONYMS: [RegExp, Partial<Facets>][] = [
  [/driveway|vehicular|parking/i, { duty: "Light Vehicular" }],
  [/heavy.?duty|truck|industrial yard/i, { duty: "Heavy-Duty" }],
  [/pedestrian|patio|walkway/i, { duty: "Pedestrian" }],
  [/aac|aerated/i, { category: "aac-blocks" }],
  [/cseb|earth block|rammed/i, { category: "cseb" }],
  [/braai|barbecue/i, { category: "braai-kits" }],
  [/slip|cladding|tile/i, { category: "brick-slips" }],
  [/paver|paving/i, { family: "hard-landscaping" }],
  [/face brick/i, { category: "clay-face-bricks" }],
];

export function applyQueryIntel(facets: Facets): Facets {
  const q = facets.q?.trim();
  if (!q) return facets;
  const extra: Facets = { ...facets };
  for (const [re, add] of SYNONYMS) {
    if (re.test(q)) Object.assign(extra, add);
  }
  return extra;
}

export function searchProducts(products: Product[], raw: Facets): Product[] {
  const f = applyQueryIntel(raw);
  const q = f.q?.trim().toLowerCase();
  const intelApplied = Boolean(
    (f.category && f.category !== raw.category) ||
      (f.duty && f.duty !== raw.duty) ||
      (f.family && f.family !== raw.family),
  );
  return products.filter((p) => {
    if (f.category && p.categorySlug !== f.category) return false;
    if (f.family && p.family !== f.family) return false;
    if (f.colour && p.colourFinish !== f.colour) return false;
    if (f.duty && p.dutyLoadClass !== f.duty) return false;
    if (f.fulfilment && p.fulfilmentType !== f.fulfilment) return false;
    if (f.sector && !p.sectorsServed.includes(f.sector)) return false;
    if (f.standard && p.applicableStandard !== f.standard) return false;
    if (f.newOnly && !p.isNew) return false;
    if (f.clearance && !p.isClearance) return false;
    if (f.minPrice != null && p.retailPrice < f.minPrice) return false;
    if (f.maxPrice != null && p.retailPrice > f.maxPrice) return false;
    if (q && !intelApplied) {
      const hay = `${p.sku} ${p.productName} ${p.category} ${p.productType} ${p.colourFinish} ${p.applicableStandard} ${p.dutyLoadClass}`.toLowerCase();
      if (!hay.includes(q)) {
        const tokens = q.split(/\W+/).filter((t) => t.length >= 3);
        if (!tokens.length || !tokens.every((t) => hay.includes(t))) return false;
      }
    }
    return true;
  });
}

export function suggest(products: Product[], q: string, limit = 8): Product[] {
  if (!q.trim()) return [];
  return searchProducts(products, { q }).slice(0, limit);
}

export function closestCategory(q: string) {
  const t = q.toLowerCase();
  return (
    CATEGORIES.find((c) => t.includes(c.name.toLowerCase().split(" ")[0]!.toLowerCase()) || t.includes(c.slug)) ??
    CATEGORIES.find((c) => c.slug.includes("paver") && /pav|drive|patio/.test(t)) ??
    CATEGORIES[0]
  );
}
