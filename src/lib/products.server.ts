import { colourMatched, frequentlyBought, relatedProducts, type Product } from "@/data/catalogue";
import { BUNDLES, type BundleLine } from "@/data/content";
import { CATEGORIES, COLOURS, type ColourName, type DutyClass, type Fulfilment } from "@/data/taxonomy";
import { getSql } from "@/lib/db";
import type { CatalogueQuery, ListingResult } from "@/lib/products";
import { searchProducts } from "@/lib/search";

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function numOrNull(v: unknown) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function sectors(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    return v
      .replace(/^\{|\}$/g, "")
      .split(",")
      .map((s) => s.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }
  return [];
}

function mapProduct(r: Record<string, unknown>): Product {
  return {
    sku: String(r.sku),
    categorySlug: String(r.category_slug),
    category: String(r.category),
    family: String(r.family),
    productType: String(r.product_type),
    productName: String(r.product_name),
    colourFinish: String(r.colour_finish) as ColourName,
    colourHex: String(r.colour_hex),
    sizeMm: String(r.size_mm),
    thicknessMm: String(r.thickness_mm),
    lengthMm: num(r.length_mm),
    widthMm: num(r.width_mm),
    unitOfSale: String(r.unit_of_sale),
    applicableStandard: String(r.applicable_standard),
    dutyLoadClass: String(r.duty_load_class) as DutyClass,
    sectorsServed: sectors(r.sectors_served),
    fulfilmentType: String(r.fulfilment_type) as Fulfilment,
    unitCost: num(r.unit_cost),
    retailPrice: num(r.retail_price),
    tradePrice: num(r.trade_price),
    volumePrice: num(r.volume_price),
    coveragePerM2: numOrNull(r.coverage_per_m2),
    rating: num(r.rating),
    reviewCount: num(r.review_count),
    stock: num(r.stock),
    isNew: Boolean(r.is_new),
    isClearance: Boolean(r.is_clearance),
    isTrending: Boolean(r.is_trending),
    isBestSeller: Boolean(r.is_best_seller),
    weightKg: num(r.weight_kg),
    unitsPerPallet: num(r.units_per_pallet),
    description: String(r.description ?? ""),
  };
}

const TTL_MS = 5 * 60 * 1000;
const g = globalThis as typeof globalThis & {
  __bpCatalogue?: { at: number; products: Product[] };
  __bpCatalogueFlight?: Promise<Product[]>;
};
// A hot reload must not keep stock figures from the previous module instance.
g.__bpCatalogue = undefined;

async function readProducts(): Promise<Product[]> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from products order by sku`;
  return rows.map(mapProduct);
}

/** One Supabase read, reused for a few minutes. Pages only receive a slice. */
export function cachedProducts(): Promise<Product[]> {
  const hit = g.__bpCatalogue;
  if (hit && Date.now() - hit.at < TTL_MS) return Promise.resolve(hit.products);
  if (!g.__bpCatalogueFlight) {
    g.__bpCatalogueFlight = readProducts()
      .then((products) => {
        g.__bpCatalogue = { at: Date.now(), products };
        return products;
      })
      .finally(() => {
        g.__bpCatalogueFlight = undefined;
      });
  }
  return g.__bpCatalogueFlight;
}

export async function fetchProducts(): Promise<Product[]> {
  return cachedProducts();
}

export async function fetchProduct(sku: string): Promise<Product | undefined> {
  const products = await cachedProducts();
  return products.find((p) => p.sku === sku);
}

/** Keep the in-memory catalogue aligned after a stock update in this process. */
export function noteStock(sku: string, delta: number) {
  const hit = g.__bpCatalogue;
  if (!hit) return;
  const product = hit.products.find((p) => p.sku === sku);
  if (product && product.fulfilmentType === "Stock Item") {
    product.stock = Math.max(0, product.stock + delta);
  }
}

const PAGE_SIZE = 24;

const FAMILY_RANK: Record<string, number> = {
  "clay-masonry": 0,
  "hard-landscaping": 1,
  specialist: 2,
  concrete: 3,
};

function sortProducts(list: Product[], sort: string): Product[] {
  const out = [...list];
  if (sort === "price-asc") out.sort((a, b) => a.retailPrice - b.retailPrice);
  else if (sort === "price-desc") out.sort((a, b) => b.retailPrice - a.retailPrice);
  else if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
  else
    out.sort((a, b) => {
      const fa = FAMILY_RANK[a.family] ?? 9;
      const fb = FAMILY_RANK[b.family] ?? 9;
      if (fa !== fb) return fa - fb;
      if (a.isBestSeller !== b.isBestSeller) return Number(b.isBestSeller) - Number(a.isBestSeller);
      return b.rating - a.rating;
    });
  return out;
}

export async function queryCatalogue(input: CatalogueQuery): Promise<ListingResult> {
  const all = await cachedProducts();
  const scoped = searchProducts(all, {
    q: input.q,
    category: input.category,
    sector: input.sector,
    colour: input.scopeColour,
    newOnly: input.newOnly,
    clearance: input.clearance,
  });
  const duties = [...new Set(scoped.map((p) => p.dutyLoadClass))].filter((d) => d !== "N/A");
  let list = scoped.filter((p) => {
    if (input.colour && p.colourFinish !== input.colour) return false;
    if (input.duty && p.dutyLoadClass !== input.duty) return false;
    if (input.fulfilment && p.fulfilmentType !== input.fulfilment) return false;
    return true;
  });
  list = sortProducts(list, input.sort || "featured");
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, input.page || 1), pages);
  return {
    items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: list.length,
    duties,
    page,
    pages,
  };
}

function firstOf(catalogue: Product[], categorySlug: string, colour?: string) {
  return catalogue.find((p) => p.categorySlug === categorySlug && (!colour || p.colourFinish === colour));
}

export async function homeCatalogue() {
  const catalogue = await cachedProducts();
  const colours = ["Autumn Red", "Imperial", "Sandstone", "Kalahari", "Slate", "Burgundy"].flatMap((colour) => {
    const face = catalogue.find((p) => p.categorySlug === "clay-face-bricks" && p.colourFinish === colour);
    if (!face) return [];
    return [
      {
        colour,
        face,
        semi: catalogue.find((p) => p.categorySlug === "semi-face-bricks" && p.colourFinish === colour),
        paver: catalogue.find((p) => p.categorySlug === "clay-pavers" && p.colourFinish === colour),
      },
    ];
  });
  const valueSlugs = ["stock-bricks", "concrete-blocks", "concrete-maxi", "mortar-accessories"];
  const seen = new Set<string>();
  const restocked = [];
  const ranked = catalogue
    .filter((p) => p.fulfilmentType === "Stock Item" && !p.isNew && !p.isClearance && p.stock > 200)
    .sort((a, b) => b.stock - a.stock);
  for (const p of ranked) {
    if (seen.has(p.categorySlug)) continue;
    seen.add(p.categorySlug);
    restocked.push(p);
    if (restocked.length === 4) break;
  }
  return {
    trending: catalogue.filter((p) => p.isTrending).slice(0, 8),
    arrivals: [...catalogue].reverse().filter((p) => p.isNew).slice(0, 8),
    clearance: catalogue.filter((p) => p.isClearance).slice(0, 8),
    best: catalogue.filter((p) => p.isBestSeller).slice(0, 8),
    favs: catalogue.filter((p) => p.rating >= 4.5).slice(0, 8),
    editorial: [
      firstOf(catalogue, "clay-face-bricks", "Autumn Red"),
      firstOf(catalogue, "clay-pavers", "Sandstone"),
      firstOf(catalogue, "brick-slips", "Slate"),
      firstOf(catalogue, "braai-kits", "Autumn Red"),
    ].filter((p): p is Product => p != null),
    value: valueSlugs
      .map(
        (slug) =>
          catalogue
            .filter((p) => p.categorySlug === slug && !p.isClearance)
            .sort((a, b) => a.retailPrice - b.retailPrice)[0],
      )
      .filter((p): p is Product => p != null),
    bulk: [
      firstOf(catalogue, "clay-face-bricks", "Autumn Red"),
      firstOf(catalogue, "concrete-blocks", "White"),
      firstOf(catalogue, "clay-pavers", "Autumn Red"),
      firstOf(catalogue, "stock-bricks"),
    ].filter((p): p is Product => p != null),
    restocked,
    colours,
  };
}

function uniqueSwatches(catalogue: Product[], product: Product): Product[] {
  return catalogue
    .filter((p) => p.productType === product.productType && p.sizeMm === product.sizeMm)
    .reduce<Product[]>((acc, p) => {
      if (!acc.some((x) => x.colourFinish === p.colourFinish)) acc.push(p);
      return acc;
    }, []);
}

export async function productView(sku: string) {
  const catalogue = await cachedProducts();
  const product = catalogue.find((p) => p.sku === sku) ?? null;
  if (!product) {
    return {
      product: null,
      swatches: [] as Product[],
      matched: [] as Product[],
      fbt: [] as Product[],
      related: [] as Product[],
    };
  }
  return {
    product,
    swatches: uniqueSwatches(catalogue, product),
    matched: colourMatched(catalogue, product),
    fbt: frequentlyBought(catalogue, product),
    related: relatedProducts(catalogue, product),
  };
}

export async function productsBySkus(skus: string[]): Promise<Product[]> {
  const want = new Set(skus.filter((s) => typeof s === "string").slice(0, 40));
  if (!want.size) return [];
  const catalogue = await cachedProducts();
  return catalogue.filter((p) => want.has(p.sku));
}

export async function suggestProducts(q: string): Promise<Product[]> {
  const query = q.trim().slice(0, 80);
  if (query.length < 2) return [];
  const { suggest } = await import("@/lib/search");
  return suggest(await cachedProducts(), query, 6);
}

export async function colourIndex() {
  const catalogue = await cachedProducts();
  return COLOURS.map((c) => ({
    name: c.name,
    sku:
      catalogue.find((p) => p.categorySlug === "clay-face-bricks" && p.colourFinish === c.name)?.sku ?? null,
  }));
}

function resolveLine(products: Product[], line: BundleLine): Product | undefined {
  const rows = products.filter((p) => p.categorySlug === line.categorySlug && p.productType === line.productType);
  return rows.find((p) => p.colourFinish === line.colour) ?? rows[0];
}

export async function resolveBundle(slug: string) {
  const bundle = BUNDLES.find((b) => b.slug === slug);
  if (!bundle) return [];
  const products = await cachedProducts();
  return bundle.lines.flatMap((line) => {
    const product = resolveLine(products, line);
    return product ? [{ qty: line.qty, product }] : [];
  });
}

export async function deskSummary() {
  const cat = await cachedProducts();
  const categories = CATEGORIES.map((c) => {
    const items = cat.filter((p) => p.categorySlug === c.slug);
    const avg = items.reduce((n, p) => n + p.retailPrice, 0) / (items.length || 1);
    return { slug: c.slug, name: c.name, prefix: c.prefix, standard: c.standard, count: items.length, avg };
  });
  return {
    count: cat.length,
    low: cat.filter((p) => p.fulfilmentType === "Stock Item" && p.stock < 80).length,
    categories,
  };
}

export async function inventoryRows(q: string, category: string) {
  const cat = await cachedProducts();
  const needle = q.trim().toLowerCase();
  const rows = cat
    .filter(
      (p) =>
        (!category || p.categorySlug === category) &&
        (!needle || `${p.sku} ${p.productName}`.toLowerCase().includes(needle)),
    )
    .slice(0, 80);
  return {
    low: cat.filter((p) => p.fulfilmentType === "Stock Item" && p.stock < 80).length,
    rows,
  };
}
