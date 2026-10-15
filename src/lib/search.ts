import type { Product } from "@/data/catalogue";
import { CATEGORIES, COLOURS } from "@/data/taxonomy";

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
  [/slip|cladding/i, { category: "brick-slips" }],
  [/paver|paving/i, { family: "hard-landscaping" }],
  [/clay paver/i, { category: "clay-pavers", family: "hard-landscaping" }],
  [/concrete paver|interlock/i, { category: "concrete-pavers", family: "hard-landscaping" }],
  [/cobble/i, { category: "cobbles" }],
  [/slab|flagstone/i, { category: "slabs" }],
  [/retain/i, { category: "retaining-blocks" }],
  [/coping|capping/i, { category: "coping" }],
  [/mortar|jointing|sealer/i, { category: "mortar-accessories" }],
  [/engineering/i, { category: "engineering-bricks" }],
  [/stock brick/i, { category: "stock-bricks" }],
  [/maxi/i, { category: "clay-maxi-bricks" }],
  [/lintel/i, { category: "lintels" }],
  [/semi-?face/i, { category: "semi-face-bricks" }],
  [/face brick|facing brick/i, { category: "clay-face-bricks" }],
  [/fire.?brick/i, { category: "fire-bricks" }],
  [/concrete block|hollow block/i, { category: "concrete-blocks" }],
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

export type SearchHint = {
  label: string;
  detail: string;
  href: string;
};

export function explainQuery(q: string): SearchHint[] {
  const query = q.trim();
  if (query.length < 2) return [];
  const intel = applyQueryIntel({ q: query });
  const hints: SearchHint[] = [];
  const seen = new Set<string>();
  const push = (hint: SearchHint) => {
    if (seen.has(hint.href)) return;
    seen.add(hint.href);
    hints.push(hint);
  };
  if (intel.category) {
    const cat = CATEGORIES.find((c) => c.slug === intel.category);
    if (cat) push({ label: cat.name, detail: cat.blurb, href: `/shop/${cat.slug}` });
  } else if (intel.family === "hard-landscaping") {
    push({
      label: "Hard landscaping",
      detail: "Pavers, cobbles, slabs, retaining and coping.",
      href: "/shop/clay-pavers",
    });
  }
  if (intel.duty) {
    push({
      label: intel.duty,
      detail: "Duty class read from the words in the search.",
      href: `/search?q=${encodeURIComponent(query)}`,
    });
  }
  const lower = query.toLowerCase();
  for (const colour of COLOURS) {
    if (lower.includes(colour.name.toLowerCase())) {
      push({
        label: colour.name,
        detail: "A colourway across face, semi-face and pavers.",
        href: `/search?colour=${encodeURIComponent(colour.name)}`,
      });
    }
  }
  const standard = query.match(/sans\s*\d+/i);
  if (standard) {
    push({
      label: standard[0].replace(/\s+/, " ").toUpperCase(),
      detail: "Matched as a standard, not a product name.",
      href: `/search?q=${encodeURIComponent(standard[0])}`,
    });
  }
  if (/^bp-[a-z0-9-]+$/i.test(query)) {
    push({
      label: query.toUpperCase(),
      detail: "That reads as a catalogue SKU.",
      href: `/search?q=${encodeURIComponent(query)}`,
    });
  }
  return hints.slice(0, 4);
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
  const intel = applyQueryIntel({ q });
  if (intel.category) return CATEGORIES.find((c) => c.slug === intel.category) ?? CATEGORIES[0];
  return (
    CATEGORIES.find((c) => t.includes(c.name.toLowerCase().split(" ")[0]!.toLowerCase()) || t.includes(c.slug)) ??
    CATEGORIES.find((c) => c.slug.includes("paver") && /pav|drive|patio/.test(t)) ??
    CATEGORIES[0]
  );
}