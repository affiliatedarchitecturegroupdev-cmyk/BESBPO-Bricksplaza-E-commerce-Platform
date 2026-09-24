#!/usr/bin/env node
/**
 * Load the generated catalogue into `products`.
 * Requires DATABASE_URL. Safe to re-run: each SKU is inserted or updated.
 */
import { createServer } from "vite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log("[seed] DATABASE_URL not set — nothing loaded.");
  process.exit(0);
}

const COLS = [
  "sku",
  "category_slug",
  "category",
  "family",
  "product_type",
  "product_name",
  "colour_finish",
  "colour_hex",
  "size_mm",
  "thickness_mm",
  "length_mm",
  "width_mm",
  "unit_of_sale",
  "applicable_standard",
  "duty_load_class",
  "sectors_served",
  "fulfilment_type",
  "unit_cost",
  "retail_price",
  "trade_price",
  "volume_price",
  "coverage_per_m2",
  "rating",
  "review_count",
  "stock",
  "is_new",
  "is_clearance",
  "is_trending",
  "is_best_seller",
  "weight_kg",
  "units_per_pallet",
  "description",
];

function row(p) {
  return [
    p.sku,
    p.categorySlug,
    p.category,
    p.family,
    p.productType,
    p.productName,
    p.colourFinish,
    p.colourHex,
    p.sizeMm,
    p.thicknessMm,
    p.lengthMm,
    p.widthMm,
    p.unitOfSale,
    p.applicableStandard,
    p.dutyLoadClass,
    p.sectorsServed,
    p.fulfilmentType,
    p.unitCost,
    p.retailPrice,
    p.tradePrice,
    p.volumePrice,
    p.coveragePerM2,
    p.rating,
    p.reviewCount,
    p.stock,
    p.isNew,
    p.isClearance,
    p.isTrending,
    p.isBestSeller,
    p.weightKg,
    p.unitsPerPallet,
    p.description,
  ];
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const mod = await vite.ssrLoadModule("/src/data/catalogue.ts");
  const products = mod.getCatalogue();
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();
  try {
    const update = COLS.filter((c) => c !== "sku")
      .map((c) => `${c} = excluded.${c}`)
      .join(", ");
    const size = 100;
    for (let i = 0; i < products.length; i += size) {
      const chunk = products.slice(i, i + size);
      const values = [];
      const placeholders = chunk.map((p, rowIndex) => {
        const start = rowIndex * COLS.length;
        values.push(...row(p));
        const slots = COLS.map((_, col) => `$${start + col + 1}`);
        return `(${slots.join(", ")})`;
      });
      await client.query(
        `insert into products (${COLS.join(", ")}) values ${placeholders.join(", ")}
         on conflict (sku) do update set ${update}`,
        values,
      );
    }
    const count = await client.query("select count(*)::int as n from products");
    console.log(`[seed] products in database: ${count.rows[0].n}`);
  } finally {
    client.release();
    await pool.end();
  }
} finally {
  await vite.close();
}
