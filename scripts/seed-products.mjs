#!/usr/bin/env node
/**
 * The storefront no longer generates SKUs. Products are rows in Postgres.
 * This script only reports how many are already loaded.
 */
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log("[seed] DATABASE_URL not set — nothing to report.");
  process.exit(0);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : undefined,
  max: 1,
});
const count = await pool.query("select count(*)::int as n from products");
console.log(`[seed] products in database: ${count.rows[0].n}`);
await pool.end();
