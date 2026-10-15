import { getSql } from "@/lib/db";
import { vatInclusive, round2 } from "@/lib/format";
import {
  expressDecision,
  expressFeeKept,
  type Pin,
  type SupplierPin,
} from "@/lib/express";

export { EXPRESS_FEE } from "@/lib/express";

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapSupplier(r: Record<string, unknown>): SupplierPin {
  return {
    id: Number(r.id),
    name: String(r.name),
    kind: String(r.kind ?? "partner"),
    city: String(r.city ?? ""),
    province: String(r.province ?? ""),
    lat: num(r.lat),
    lng: num(r.lng),
  };
}

export async function activeSuppliers() {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select id, name, kind, city, province, lat, lng
    from express_suppliers
    where active = true
    order by name
  `;
  return rows.map(mapSupplier);
}

export async function resolveExpress(input: {
  now: Date;
  method: "delivery" | "collection";
  quoted: boolean;
  lines: { fulfilment: string }[];
  pin: Pin | null;
}) {
  const suppliers = await activeSuppliers();
  return expressDecision({ ...input, suppliers });
}

export async function recomputeRating(sku: string) {
  const sql = await getSql();
  const rows = await sql<{ n: number; avg: number }>`
    select count(*)::int as n, coalesce(avg(stars), 0)::float as avg
    from product_stars where sku = ${sku}
  `;
  const count = num(rows[0]?.n);
  const average = num(rows[0]?.avg);
  await sql`update products set rating = ${average}, review_count = ${count} where sku = ${sku}`;
  const { bustCatalogue } = await import("@/lib/products.server");
  bustCatalogue();
  return { average, count };
}

export async function markExpressArrived(orderId: string) {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select id, user_id, payment_method, subtotal, delivery_fee, total, express_fee, express_status, express_confirmed_at
    from orders where id = ${orderId}
  `;
  const order = rows[0];
  if (!order) throw new Error("Order not found");
  const fee = num(order.express_fee);
  if (fee <= 0) throw new Error("This order is not on AA 60/120");
  const status = order.express_status == null ? "" : String(order.express_status);
  if (status === "delivered" || status === "fee_refunded") throw new Error("Arrival is already recorded");
  if (!order.express_confirmed_at) throw new Error("This express order has no confirmation time");
  const confirmed = new Date(String(order.express_confirmed_at));
  const delivered = new Date();
  const kept = expressFeeKept(confirmed, delivered);
  if (!kept) {
    const delivery = round2(num(order.delivery_fee) - fee);
    const exVat = round2(num(order.subtotal) + delivery);
    const total = vatInclusive(exVat);
    const vat = round2(total - exVat);
    const refund = round2(num(order.total) - total);
    await sql`update orders set
      delivery_fee = ${delivery},
      vat = ${vat},
      total = ${total},
      express_status = ${"fee_refunded"},
      express_delivered_at = ${delivered.toISOString()}
      where id = ${orderId}`;
    if (String(order.payment_method) === "float" && order.user_id && refund > 0) {
      await sql`update customers set float_balance = float_balance + ${refund} where user_id = ${String(order.user_id)}`;
    }
    await sql`insert into order_events (order_id, status, note)
      values (${orderId}, ${"delivered"}, ${"AA 60/120 arrived after 3 hours. The R1 000 express fee is refunded. The ordinary delivery fee stands."})`;
    return { status: "fee_refunded" as const, refund };
  }
  await sql`update orders set express_status = ${"delivered"}, express_delivered_at = ${delivered.toISOString()} where id = ${orderId}`;
  await sql`insert into order_events (order_id, status, note)
    values (${orderId}, ${"delivered"}, ${"AA 60/120 delivered inside 3 hours. The R1 000 fee stands."})`;
  return { status: "delivered" as const, refund: 0 };
}

export async function saveStars(userId: string, sku: string, stars: number) {
  const sql = await getSql();
  const product = await sql`select sku from products where sku = ${sku}`;
  if (!product[0]) throw new Error("Unknown SKU");
  await sql`insert into product_stars (user_id, sku, stars)
    values (${userId}, ${sku}, ${stars})
    on conflict (user_id, sku) do update set stars = ${stars}, updated_at = now()`;
  return recomputeRating(sku);
}

export async function saveWrittenReview(
  userId: string,
  data: { sku: string; stars: number; title: string; body: string },
) {
  const sql = await getSql();
  const bought = await sql`
    select o.id from orders o
    join order_lines l on l.order_id = o.id
    where o.user_id = ${userId} and l.sku = ${data.sku} and o.status <> 'cancelled'
    limit 1
  `;
  if (!bought[0]) throw new Error("A written review is only open after this account has purchased the SKU");
  await saveStars(userId, data.sku, data.stars);
  await sql`insert into reviews (user_id, sku, rating, title, body, verified, status)
    values (${userId}, ${data.sku}, ${data.stars}, ${data.title || null}, ${data.body}, ${true}, ${"published"})
    on conflict (user_id, sku) do update set
      rating = ${data.stars},
      title = ${data.title || null},
      body = ${data.body},
      verified = true`;
  const summary = await recomputeRating(data.sku);
  return { ok: true as const, ...summary };
}
