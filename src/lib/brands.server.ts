import { getSql } from "@/lib/db";

export type BrandSku = {
  sku: string;
  brand: string;
  brand_slug: string;
  family: string;
  name: string;
  official_url: string;
  dimensions: string | null;
  colour_finish: string | null;
  standard_ref: string | null;
  brochure_ref: string | null;
  availability_status: string;
  delivery_class: string;
  image_rights_status: string;
  publication_status: string;
  source_status: string;
  notes: string;
  parent_sku: string | null;
  spec_status: string;
  mass_kg: number | null;
  units_per_m2: number | null;
  units_per_pallet: number | null;
  factory: string | null;
  source_url: string | null;
  manufacturer_code: string | null;
};

export type BrandShop = {
  brand: string;
  brand_slug: string;
  ranges: number;
  products: number;
};

function mapSku(r: Record<string, unknown>): BrandSku {
  const text = (k: string) => (r[k] == null || r[k] === "" ? null : String(r[k]));
  return {
    sku: String(r.sku),
    brand: String(r.brand),
    brand_slug: String(r.brand_slug),
    family: String(r.family),
    name: String(r.name),
    official_url: String(r.official_url),
    dimensions: text("dimensions"),
    colour_finish: text("colour_finish"),
    standard_ref: text("standard_ref"),
    brochure_ref: text("brochure_ref"),
    availability_status: String(r.availability_status),
    delivery_class: String(r.delivery_class),
    image_rights_status: String(r.image_rights_status),
    publication_status: String(r.publication_status),
    source_status: String(r.source_status),
    notes: String(r.notes ?? ""),
    parent_sku: text("parent_sku"),
    spec_status: String(r.spec_status ?? "family_only"),
    mass_kg: r.mass_kg == null ? null : Number(r.mass_kg),
    units_per_m2: r.units_per_m2 == null ? null : Number(r.units_per_m2),
    units_per_pallet: r.units_per_pallet == null ? null : Number(r.units_per_pallet),
    factory: text("factory"),
    source_url: text("source_url"),
    manufacturer_code: text("manufacturer_code"),
  };
}

export async function brandShops(): Promise<BrandShop[]> {
  const sql = await getSql();
  const rows = await sql<{ brand: string; brand_slug: string; ranges: number; products: number }>`
    select brand, brand_slug,
      count(*) filter (where parent_sku is null)::int as ranges,
      count(*) filter (where parent_sku is not null)::int as products
    from brand_skus
    group by brand, brand_slug
    order by brand
  `;
  return rows.map((r) => ({
    brand: String(r.brand),
    brand_slug: String(r.brand_slug),
    ranges: Number(r.ranges),
    products: Number(r.products),
  }));
}

export async function brandRanges(slug: string): Promise<BrandSku[]> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select * from brand_skus where brand_slug = ${slug} order by sku
  `;
  return rows.map(mapSku);
}

export async function matchBrandRanges(q: string): Promise<BrandSku[]> {
  const term = q.trim().slice(0, 80);
  if (term.length < 2) return [];
  const like = `%${term.replace(/[%_]/g, "")}%`;
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select * from brand_skus
    where brand ilike ${like} or family ilike ${like} or name ilike ${like}
       or sku ilike ${like} or manufacturer_code ilike ${like}
    order by brand, sku
    limit 12
  `;
  return rows.map(mapSku);
}
