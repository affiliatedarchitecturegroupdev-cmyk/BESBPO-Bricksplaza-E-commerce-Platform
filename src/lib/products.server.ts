import type { Product } from "@/data/catalogue";
import type { ColourName, DutyClass, Fulfilment } from "@/data/taxonomy";
import { getSql } from "@/lib/db";

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

/** Public catalogue. Not user-scoped — every visitor sees the same SKUs. */
export async function fetchProducts(): Promise<Product[]> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from products order by sku`;
  return rows.map(mapProduct);
}

export async function fetchProduct(sku: string): Promise<Product | undefined> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from products where sku = ${sku} limit 1`;
  const row = rows[0];
  return row ? mapProduct(row) : undefined;
}
