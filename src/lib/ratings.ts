import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function starsOf(value: unknown) {
  const n = Math.round(Number(value));
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error("Choose 1 to 5 stars");
  return n;
}

export const ratingSummary = createServerFn({ method: "POST" })
  .validator((sku: string) => String(sku ?? "").trim().slice(0, 40))
  .handler(async ({ data: sku }) => {
    const sql = await getSql();
    const rows = await sql<{ n: number; avg: number }>`
      select count(*)::int as n, coalesce(avg(stars), 0)::float as avg
      from product_stars where sku = ${sku}
    `;
    const written = await sql<{ n: number }>`
      select count(*)::int as n from reviews where sku = ${sku} and status = 'published'
    `;
    return { average: num(rows[0]?.avg), stars: num(rows[0]?.n), reviews: num(written[0]?.n) };
  });

export const myProductStanding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((sku: string) => String(sku ?? "").trim().slice(0, 40))
  .handler(async ({ context, data: sku }) => {
    const sql = await getSql();
    const star = await sql<{ stars: number }>`
      select stars from product_stars where user_id = ${context.userId} and sku = ${sku}
    `;
    const bought = await sql`
      select o.id from orders o
      join order_lines l on l.order_id = o.id
      where o.user_id = ${context.userId} and l.sku = ${sku} and o.status <> 'cancelled'
      limit 1
    `;
    const review = await sql`select id from reviews where user_id = ${context.userId} and sku = ${sku} limit 1`;
    return {
      stars: star[0] ? num(star[0].stars) : null,
      purchased: Boolean(bought[0]),
      reviewed: Boolean(review[0]),
    };
  });

export const setProductStars = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { sku: string; stars: number }) => ({
    sku: String(d?.sku ?? "").trim().slice(0, 40),
    stars: d?.stars,
  }))
  .handler(async ({ context, data }) => {
    const stars = starsOf(data.stars);
    if (!data.sku) throw new Error("Missing SKU");
    const { saveStars } = await import("@/lib/express.server");
    return saveStars(context.userId, data.sku, stars);
  });

export const writeProductReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { sku: string; stars: number; title: string; body: string }) => ({
    sku: String(d?.sku ?? "").trim().slice(0, 40),
    stars: d?.stars,
    title: String(d?.title ?? "").trim().slice(0, 80),
    body: String(d?.body ?? "").trim().slice(0, 2000),
  }))
  .handler(async ({ context, data }) => {
    const stars = starsOf(data.stars);
    if (data.body.length < 12) throw new Error("Write a review of at least a sentence");
    const { saveWrittenReview } = await import("@/lib/express.server");
    return saveWrittenReview(context.userId, { sku: data.sku, stars, title: data.title, body: data.body });
  });
