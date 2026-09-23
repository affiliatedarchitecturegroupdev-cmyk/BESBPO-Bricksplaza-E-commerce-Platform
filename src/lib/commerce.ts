import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getProduct } from "@/data/catalogue";
import { priceFor } from "@/lib/pricing";
import { quoteDelivery, craneSurcharge } from "@/lib/delivery";
import { round2, vatInclusive } from "@/lib/format";
import type { CustomerTier } from "@/data/taxonomy";

export type CustomerRow = {
  user_id: string;
  display_name: string | null;
  company: string | null;
  vat_number: string | null;
  phone: string | null;
  tier: CustomerTier;
  credit_limit: number;
  float_balance: number;
  trade_status: string;
  trade_terms: string | null;
};

function num(v: unknown) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  return Number.isFinite(n) ? n : 0;
}

function mapCustomer(r: Record<string, unknown>): CustomerRow {
  return {
    user_id: String(r.user_id),
    display_name: r.display_name == null ? null : String(r.display_name),
    company: r.company == null ? null : String(r.company),
    vat_number: r.vat_number == null ? null : String(r.vat_number),
    phone: r.phone == null ? null : String(r.phone),
    tier: (String(r.tier) as CustomerTier) || "retail",
    credit_limit: num(r.credit_limit),
    float_balance: num(r.float_balance),
    trade_status: String(r.trade_status ?? "none"),
    trade_terms: r.trade_terms == null ? null : String(r.trade_terms),
  };
}

async function loadCustomer(userId: string): Promise<CustomerRow> {
  const sql = await getSql();
  const existing = await sql`select * from customers where user_id = ${userId}`;
  if (existing[0]) return mapCustomer(existing[0] as Record<string, unknown>);
  await sql`insert into customers (user_id) values (${userId})`;
  const created = await sql`select * from customers where user_id = ${userId}`;
  return mapCustomer(created[0] as Record<string, unknown>);
}

export const getOrCreateCustomer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadCustomer(context.userId));

export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { display_name?: string; company?: string; phone?: string; vat_number?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into customers (user_id) values (${context.userId}) on conflict (user_id) do nothing`;
    await sql`update customers set
      display_name = coalesce(${data.display_name ?? null}, display_name),
      company = coalesce(${data.company ?? null}, company),
      phone = coalesce(${data.phone ?? null}, phone),
      vat_number = coalesce(${data.vat_number ?? null}, vat_number)
      where user_id = ${context.userId}`;
    return loadCustomer(context.userId);
  });

export const applyTradeAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { company: string; vat_number: string; phone: string; monthly: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into customers (user_id, company, vat_number, phone, trade_status)
      values (${context.userId}, ${data.company}, ${data.vat_number}, ${data.phone}, 'pending')
      on conflict (user_id) do update set
        company = excluded.company,
        vat_number = excluded.vat_number,
        phone = excluded.phone,
        trade_status = 'pending'`;
    return { ok: true as const };
  });

export const listAddresses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: number;
      label: string;
      recipient: string | null;
      line1: string;
      line2: string | null;
      city: string;
      province: string;
      postal_code: string;
      is_default: boolean;
    }>`select id, label, recipient, line1, line2, city, province, postal_code, is_default from addresses where user_id = ${context.userId} order by is_default desc, id desc`;
  });

export const saveAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      label: string;
      recipient: string;
      line1: string;
      line2?: string;
      city: string;
      province: string;
      postal_code: string;
      is_default?: boolean;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.is_default) {
      await sql`update addresses set is_default = false where user_id = ${context.userId}`;
    }
    await sql`insert into addresses (user_id, label, recipient, line1, line2, city, province, postal_code, is_default)
      values (${context.userId}, ${data.label}, ${data.recipient}, ${data.line1}, ${data.line2 ?? ""}, ${data.city}, ${data.province}, ${data.postal_code}, ${Boolean(data.is_default)})`;
    return { ok: true as const };
  });

export type OrderInput = {
  email: string;
  phone: string;
  delivery_method: "delivery" | "collection";
  postal_code: string;
  address: {
    recipient: string;
    line1: string;
    city: string;
    province: string;
    postal_code: string;
  };
  payment_method: string;
  lines: { sku: string; qty: number }[];
  hiab?: boolean;
  notes?: string;
};

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: OrderInput) => d)
  .handler(async ({ context, data }) => {
    const customer = await loadCustomer(context.userId);
    const tier = customer.tier;
    let subtotal = 0;
    const resolved = data.lines.map((l) => {
      const p = getProduct(l.sku);
      if (!p) throw new Error(`Unknown SKU ${l.sku}`);
      const unit = priceFor(p, tier);
      const line = round2(unit * l.qty);
      subtotal = round2(subtotal + line);
      return { ...l, name: p.productName, unit, fulfilment: p.fulfilmentType };
    });
    const quote = quoteDelivery(data.postal_code || data.address.postal_code, data.delivery_method);
    const delivery = (quote.fee ?? 0) + craneSurcharge(Boolean(data.hiab));
    const totalEx = round2(subtotal + delivery);
    const total = vatInclusive(totalEx);
    const vat = round2(total - totalEx);
    if (tier !== "retail" && customer.credit_limit > 0 && data.payment_method === "trade") {
      if (total > customer.credit_limit) throw new Error("Order exceeds trade credit limit");
    }
    if (data.payment_method === "float") {
      if (total > customer.float_balance) throw new Error("Insufficient float balance");
    }
    const id = `BP-${Date.now().toString(36).toUpperCase()}`;
    const carrier = quote.band === "collection" ? "Collection" : "DSV South Africa";
    const sql = await getSql();
    await sql`insert into orders (
      id, user_id, status, email, phone, delivery_method, address_json, payment_method,
      subtotal, delivery_fee, vat, total, tier, carrier, tracking_ref, notes
    ) values (
      ${id}, ${context.userId}, ${"processing"}, ${data.email}, ${data.phone}, ${data.delivery_method},
      ${JSON.stringify({ ...data.address, quote })}, ${data.payment_method},
      ${subtotal}, ${delivery}, ${vat}, ${total}, ${tier}, ${carrier}, ${id.replace("BP-", "TRK-")}, ${data.notes ?? ""}
    )`;
    for (const line of resolved) {
      await sql`insert into order_lines (order_id, sku, name, qty, unit_price, fulfilment)
        values (${id}, ${line.sku}, ${line.name}, ${line.qty}, ${line.unit}, ${line.fulfilment})`;
    }
    if (data.payment_method === "float") {
      await sql`update customers set float_balance = float_balance - ${total} where user_id = ${context.userId}`;
    }
    return { id, total, vat, delivery, subtotal, tier, carrier };
  });

function mapOrder(r: Record<string, unknown>) {
  return {
    id: String(r.id),
    status: String(r.status),
    email: r.email == null ? null : String(r.email),
    phone: r.phone == null ? null : String(r.phone),
    delivery_method: String(r.delivery_method),
    address_json: String(r.address_json),
    payment_method: String(r.payment_method),
    subtotal: num(r.subtotal),
    delivery_fee: num(r.delivery_fee),
    vat: num(r.vat),
    total: num(r.total),
    tier: String(r.tier),
    carrier: r.carrier == null ? null : String(r.carrier),
    tracking_ref: r.tracking_ref == null ? null : String(r.tracking_ref),
    notes: r.notes == null ? null : String(r.notes),
    created_at: String(r.created_at),
  };
}

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const orders = await sql<Record<string, unknown>>`select * from orders where user_id = ${context.userId} order by created_at desc`;
    return orders.map(mapOrder);
  });

export const getMyOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const orders = await sql<Record<string, unknown>>`select * from orders where id = ${id} and user_id = ${context.userId}`;
    const order = orders[0];
    if (!order) return null;
    const lines = await sql<{
      sku: string;
      name: string;
      qty: number;
      unit_price: unknown;
      fulfilment: string;
    }>`select sku, name, qty, unit_price, fulfilment from order_lines where order_id = ${id}`;
    return {
      ...mapOrder(order),
      lines: lines.map((l) => ({ ...l, unit_price: num(l.unit_price) })),
    };
  });

export const toggleWishlist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((sku: string) => sku)
  .handler(async ({ context, data: sku }) => {
    const sql = await getSql();
    const existing = await sql`select sku from wishlists where user_id = ${context.userId} and sku = ${sku}`;
    if (existing[0]) {
      await sql`delete from wishlists where user_id = ${context.userId} and sku = ${sku}`;
      return { on: false };
    }
    await sql`insert into wishlists (user_id, sku) values (${context.userId}, ${sku})`;
    return { on: true };
  });

export const listWishlist = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ sku: string }>`select sku from wishlists where user_id = ${context.userId} order by created_at desc`;
    return rows.map((r) => r.sku);
  });

export const listReviews = createServerFn({ method: "POST" })
  .validator((sku: string) => sku)
  .handler(async ({ data: sku }) => {
    const sql = await getSql();
    return sql<{
      id: number;
      rating: number;
      title: string | null;
      body: string;
      verified: boolean;
      helpful: number;
      created_at: string;
    }>`select id, rating, title, body, verified, helpful, created_at from reviews where sku = ${sku} and status = 'published' order by helpful desc, id desc`;
  });

export const addReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { sku: string; rating: number; title: string; body: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const bought = await sql`select o.id from orders o join order_lines l on l.order_id = o.id where o.user_id = ${context.userId} and l.sku = ${data.sku} limit 1`;
    await sql`insert into reviews (user_id, sku, rating, title, body, verified)
      values (${context.userId}, ${data.sku}, ${data.rating}, ${data.title}, ${data.body}, ${Boolean(bought[0])})`;
    return { ok: true as const };
  });

export const listQuestions = createServerFn({ method: "POST" })
  .validator((sku: string) => sku)
  .handler(async ({ data: sku }) => {
    const sql = await getSql();
    return sql<{
      id: number;
      body: string;
      answer: string | null;
      answered_by: string | null;
      created_at: string;
    }>`select id, body, answer, answered_by, created_at from questions where sku = ${sku} order by id desc`;
  });

export const addQuestion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { sku: string; body: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into questions (user_id, sku, body) values (${context.userId}, ${data.sku}, ${data.body})`;
    return { ok: true as const };
  });

export const submitRfq = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      name: string;
      email: string;
      company?: string;
      phone?: string;
      province?: string;
      message: string;
      sku_list?: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into rfqs (user_id, name, email, company, phone, province, message, sku_list)
      values (${context.userId}, ${data.name}, ${data.email}, ${data.company ?? ""}, ${data.phone ?? ""}, ${data.province ?? ""}, ${data.message}, ${data.sku_list ?? ""})`;
    return { ok: true as const };
  });

export const submitReturn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { order_id: string; sku?: string; reason: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const own = await sql`select id from orders where id = ${data.order_id} and user_id = ${context.userId}`;
    if (!own[0]) throw new Error("Order not found");
    await sql`insert into returns (user_id, order_id, sku, reason) values (${context.userId}, ${data.order_id}, ${data.sku ?? ""}, ${data.reason})`;
    return { ok: true as const };
  });

export const deskOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const orders = await sql<Record<string, unknown>>`select * from orders where user_id = ${context.userId} order by created_at desc`;
    const rfqs = await sql<Record<string, unknown>>`select id, name, company, status, created_at from rfqs where user_id = ${context.userId} order by id desc`;
    const returns = await sql<Record<string, unknown>>`select id, order_id, reason, status, created_at from returns where user_id = ${context.userId} order by id desc`;
    return {
      orders: orders.map(mapOrder),
      rfqs: rfqs.map((r) => ({
        id: Number(r.id),
        name: String(r.name ?? ""),
        company: r.company == null ? null : String(r.company),
        status: String(r.status ?? "open"),
        created_at: String(r.created_at ?? ""),
      })),
      returns: returns.map((r) => ({
        id: Number(r.id),
        order_id: String(r.order_id ?? ""),
        reason: String(r.reason ?? ""),
        status: String(r.status ?? "requested"),
        created_at: String(r.created_at ?? ""),
      })),
    };
  });


export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string; status: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update orders set status = ${data.status} where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const topUpFloat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((amount: number) => amount)
  .handler(async ({ context, data: amount }) => {
    if (amount <= 0 || amount > 500000) throw new Error("Invalid amount");
    const sql = await getSql();
    await sql`insert into customers (user_id) values (${context.userId}) on conflict (user_id) do nothing`;
    await sql`update customers set float_balance = float_balance + ${amount} where user_id = ${context.userId}`;
    return loadCustomer(context.userId);
  });

export const approveOwnTradeDemo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { status: "approved" | "declined"; terms?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const tier = data.status === "approved" ? "trade" : "retail";
    const limit = data.status === "approved" ? 150000 : 0;
    await sql`update customers set trade_status = ${data.status}, tier = ${tier}, credit_limit = ${limit}, trade_terms = ${data.terms ?? "Net 30"} where user_id = ${context.userId}`;
    return loadCustomer(context.userId);
  });
