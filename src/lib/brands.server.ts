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
};

export type BrandShop = {
  brand: string;
  brand_slug: string;
  ranges: number;
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
  };
}

export async function brandShops(): Promise<BrandShop[]> {
  const sql = await getSql();
  const rows = await sql<{ brand: string; brand_slug: string; ranges: number }>`
    select brand, brand_slug, count(*)::int as ranges
    from brand_skus
    group by brand, brand_slug
    order by brand
  `;
  return rows.map((r) => ({
    brand: String(r.brand),
    brand_slug: String(r.brand_slug),
    ranges: Number(r.ranges),
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
    where brand ilike ${like} or family ilike ${like} or name ilike ${like} or sku ilike ${like}
    order by brand, sku
    limit 12
  `;
  return rows.map(mapSku);
}
