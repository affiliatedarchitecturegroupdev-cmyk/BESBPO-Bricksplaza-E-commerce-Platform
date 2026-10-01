import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { priceFor } from "@/lib/pricing";
import { quoteDelivery, craneSurcharge, palletCount, CARRIERS } from "@/lib/delivery";
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
  collection_slot?: string;
};

const ORDER_STATUSES = [
  "processing",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const PAYMENT_STATUSES = [
  "simulated",
  "awaiting_eft",
  "proof_submitted",
  "proof_received",
  "on_account",
  "float",
] as const;

const COLLECTION_SLOT_IDS = ["morning", "midday", "afternoon"] as const;

function paymentStatusFor(method: string) {
  if (method === "eft") return "awaiting_eft";
  if (method === "trade") return "on_account";
  if (method === "float") return "float";
  return "simulated";
}

function paymentNote(status: string) {
  if (status === "awaiting_eft") return "Order saved. Awaiting an EFT reference. Nothing has been captured.";
  if (status === "on_account") return "Order saved on the trade account. No card capture.";
  if (status === "float") return "Order saved against the float balance. No card capture.";
  return "Order saved. Payment is simulated and has not been captured.";
}

type ResolvedLine = {
  sku: string;
  qty: number;
  name: string;
  unit: number;
  fulfilment: string;
};

async function reserveStock(lines: ResolvedLine[]) {
  const sql = await getSql();
  const { noteStock } = await import("@/lib/products.server");
  const applied: { sku: string; qty: number }[] = [];
  try {
    for (const line of lines) {
      if (line.fulfilment !== "Stock Item") continue;
      const updated = await sql<{ sku: string }>`
        update products set stock = stock - ${line.qty}
        where sku = ${line.sku} and fulfilment_type = 'Stock Item' and stock >= ${line.qty}
        returning sku
      `;
      if (!updated[0]) throw new Error(`Not enough stock for ${line.sku}`);
      applied.push({ sku: line.sku, qty: line.qty });
      noteStock(line.sku, -line.qty);
    }
  } catch (err) {
    for (const row of applied) {
      await sql`update products set stock = stock + ${row.qty} where sku = ${row.sku}`;
      noteStock(row.sku, row.qty);
    }
    throw err;
  }
}

async function restoreStock(orderId: string) {
  const sql = await getSql();
  const { noteStock } = await import("@/lib/products.server");
  const lines = await sql<{ sku: string; qty: number; fulfilment: string }>`
    select sku, qty, fulfilment from order_lines where order_id = ${orderId}
  `;
  for (const line of lines) {
    if (line.fulfilment !== "Stock Item") continue;
    const qty = num(line.qty);
    await sql`update products set stock = stock + ${qty} where sku = ${line.sku}`;
    noteStock(line.sku, qty);
  }
}

async function commitOrder(opts: {
  userId: string | null;
  tier: CustomerTier;
  data: OrderInput;
  creditLimit?: number | null;
  floatBalance?: number | null;
}) {
  const { userId, tier, data } = opts;
  if (!data.email || !data.email.includes("@")) throw new Error("An email is required so the yard can confirm the load");
  if (!Array.isArray(data.lines) || data.lines.length === 0 || data.lines.length > 40) {
    throw new Error("Add between 1 and 40 lines");
  }
  let subtotal = 0;
  let pallets = 0;
  const { fetchProduct } = await import("@/lib/products.server");
  const resolved: ResolvedLine[] = [];
  for (const l of data.lines) {
    const qty = Math.floor(Number(l.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 100000) throw new Error(`Invalid quantity for ${l.sku}`);
    const p = await fetchProduct(l.sku);
    if (!p) throw new Error(`Unknown SKU ${l.sku}`);
    const unit = priceFor(p, tier);
    subtotal = round2(subtotal + round2(unit * qty));
    pallets += palletCount(qty, p.unitsPerPallet);
    resolved.push({ sku: l.sku, qty, name: p.productName, unit, fulfilment: p.fulfilmentType });
  }
  const quote = quoteDelivery(data.postal_code || data.address.postal_code, data.delivery_method);
  const delivery = (quote.fee ?? 0) + craneSurcharge(Boolean(data.hiab));
  const totalEx = round2(subtotal + delivery);
  const total = vatInclusive(totalEx);
  const vat = round2(total - totalEx);
  const paymentStatus = paymentStatusFor(data.payment_method);
  const collectionSlot =
    data.delivery_method === "collection" &&
    COLLECTION_SLOT_IDS.includes(data.collection_slot as (typeof COLLECTION_SLOT_IDS)[number])
      ? data.collection_slot
      : null;
  if (opts.creditLimit != null && opts.creditLimit > 0 && total > opts.creditLimit) {
    throw new Error("Order exceeds trade credit limit");
  }
  if (opts.floatBalance != null && total > opts.floatBalance) {
    throw new Error("Insufficient float balance");
  }
  await reserveStock(resolved);
  const id = `BP-${Date.now().toString(36).toUpperCase()}`;
  const carrier = data.delivery_method === "collection" ? "Collection" : null;
  const loadNote = `Load count: ${pallets} pallet${pallets === 1 ? "" : "s"}. The band fee is the published flat rate; it is not a weighed quote.`;
  const notes = [data.notes?.trim(), loadNote].filter(Boolean).join("\n");
  const sql = await getSql();
  try {
    await sql`insert into orders (
      id, user_id, status, email, phone, delivery_method, address_json, payment_method,
      payment_status, payment_reference, stock_applied, subtotal, delivery_fee, vat, total, tier, carrier, tracking_ref, notes, collection_slot
    ) values (
      ${id}, ${userId}, ${"processing"}, ${data.email}, ${data.phone}, ${data.delivery_method},
      ${JSON.stringify({ ...data.address, quote })}, ${data.payment_method},
      ${paymentStatus}, ${null}, ${true},
      ${subtotal}, ${delivery}, ${vat}, ${total}, ${tier}, ${carrier}, ${null}, ${notes}, ${collectionSlot}
    )`;
    for (const line of resolved) {
      await sql`insert into order_lines (order_id, sku, name, qty, unit_price, fulfilment)
        values (${id}, ${line.sku}, ${line.name}, ${line.qty}, ${line.unit}, ${line.fulfilment})`;
    }
    await sql`insert into order_events (order_id, status, note)
      values (${id}, ${"processing"}, ${paymentNote(paymentStatus)})`;
    if (opts.floatBalance != null && userId) {
      await sql`update customers set float_balance = float_balance - ${total} where user_id = ${userId}`;
    }
  } catch (err) {
    const { noteStock } = await import("@/lib/products.server");
    for (const line of resolved) {
      if (line.fulfilment !== "Stock Item") continue;
      await sql`update products set stock = stock + ${line.qty} where sku = ${line.sku}`;
      noteStock(line.sku, line.qty);
    }
    await sql`delete from order_lines where order_id = ${id}`;
    await sql`delete from order_events where order_id = ${id}`;
    await sql`delete from orders where id = ${id}`;
    throw err;
  }
  return { id, total, vat, delivery, subtotal, tier, carrier, payment_status: paymentStatus };
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: OrderInput) => d)
  .handler(async ({ context, data }) => {
    const customer = await loadCustomer(context.userId);
    return commitOrder({
      userId: context.userId,
      tier: customer.tier,
      data,
      creditLimit: data.payment_method === "trade" ? customer.credit_limit : null,
      floatBalance: data.payment_method === "float" ? customer.float_balance : null,
    });
  });

/** Guest checkout. No account, so no client-supplied user id — retail price only, and no trade or float. */
export const placeGuestOrder = createServerFn({ method: "POST" })
  .validator((d: OrderInput) => d)
  .handler(async ({ data }) => {
    if (data.payment_method === "trade" || data.payment_method === "float") {
      throw new Error("Sign in to use a trade or float account");
    }
    return commitOrder({ userId: null, tier: "retail", data });
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
    payment_status: r.payment_status == null ? "simulated" : String(r.payment_status),
    payment_reference: r.payment_reference == null ? null : String(r.payment_reference),
    collection_slot: r.collection_slot == null ? null : String(r.collection_slot),
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
    await sql`insert into reviews (user_id, sku, rating, title, body, verified, status)
      values (${context.userId}, ${data.sku}, ${data.rating}, ${data.title}, ${data.body}, ${Boolean(bought[0])}, ${"pending"})`;
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

async function yardGate(userId: string) {
  const sql = await getSql();
  const yard = await isYard(userId);
  const owners = await sql`select user_id from customers where yard_role = 'owner' limit 1`;
  return { sql, yard, unclaimed: !owners[0] };
}

export const listYardRfqs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, yard, unclaimed } = await yardGate(context.userId);
    if (!yard) return { yard, unclaimed, rows: [] as YardRfq[] };
    const rows = await sql<Record<string, unknown>>`
      select id, name, email, company, phone, province, message, sku_list, status, created_at
      from rfqs
      order by case status when 'open' then 0 when 'quoted' then 1 else 2 end, id desc
      limit 80
    `;
    return {
      yard,
      unclaimed,
      rows: rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name ?? ""),
        email: String(r.email ?? ""),
        company: r.company == null ? "" : String(r.company),
        phone: r.phone == null ? "" : String(r.phone),
        province: r.province == null ? "" : String(r.province),
        message: String(r.message ?? ""),
        sku_list: r.sku_list == null ? "" : String(r.sku_list),
        status: String(r.status ?? "open"),
        created_at: String(r.created_at ?? ""),
      })),
    };
  });

export const listYardQuestions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, yard, unclaimed } = await yardGate(context.userId);
    if (!yard) return { yard, unclaimed, rows: [] as YardQuestion[] };
    const rows = await sql<Record<string, unknown>>`
      select id, sku, body, answer, created_at
      from questions
      order by case when answer is null or answer = '' then 0 else 1 end, id desc
      limit 80
    `;
    return {
      yard,
      unclaimed,
      rows: rows.map((r) => ({
        id: Number(r.id),
        sku: String(r.sku ?? ""),
        body: String(r.body ?? ""),
        answer: r.answer == null ? "" : String(r.answer),
        created_at: String(r.created_at ?? ""),
      })),
    };
  });

export const answerQuestion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; answer: string }) => d)
  .handler(async ({ context, data }) => {
    await assertYard(context.userId);
    const answer = String(data.answer ?? "").trim().slice(0, 2000);
    if (!answer) throw new Error("Write an answer");
    const sql = await getSql();
    const rows = await sql`select id from questions where id = ${data.id}`;
    if (!rows[0]) throw new Error("Question not found");
    await sql`update questions set answer = ${answer}, answered_by = ${"Bricksplaza Team"} where id = ${data.id}`;
    return { ok: true as const };
  });

export const listYardReviews = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, yard, unclaimed } = await yardGate(context.userId);
    if (!yard) return { yard, unclaimed, rows: [] as YardReview[] };
    const rows = await sql<Record<string, unknown>>`
      select id, sku, rating, title, body, verified, status, created_at
      from reviews
      order by case status when 'pending' then 0 when 'published' then 1 else 2 end, id desc
      limit 80
    `;
    return {
      yard,
      unclaimed,
      rows: rows.map((r) => ({
        id: Number(r.id),
        sku: String(r.sku ?? ""),
        rating: num(r.rating),
        title: r.title == null ? "" : String(r.title),
        body: String(r.body ?? ""),
        verified: Boolean(r.verified),
        status: String(r.status ?? "pending"),
        created_at: String(r.created_at ?? ""),
      })),
    };
  });

export const setReviewStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: "published" | "hidden" }) => d)
  .handler(async ({ context, data }) => {
    if (data.status !== "published" && data.status !== "hidden") throw new Error("Unknown decision");
    await assertYard(context.userId);
    const sql = await getSql();
    const rows = await sql`select id from reviews where id = ${data.id}`;
    if (!rows[0]) throw new Error("Review not found");
    await sql`update reviews set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

export const submitContact = createServerFn({ method: "POST" })
  .validator((d: { name: string; email: string; message: string }) => d)
  .handler(async ({ data }) => {
    const name = String(data.name ?? "").trim().slice(0, 80);
    const email = String(data.email ?? "").trim().toLowerCase().slice(0, 160);
    const message = String(data.message ?? "").trim().slice(0, 2000);
    if (!name) throw new Error("Enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email");
    if (message.length < 8) throw new Error("Say a bit more so the desk can reply");
    const sql = await getSql();
    await sql`insert into contacts (name, email, message) values (${name}, ${email}, ${message})`;
    return { ok: true as const };
  });

export const listContacts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, yard, unclaimed } = await yardGate(context.userId);
    if (!yard) return { yard, unclaimed, rows: [] as YardContact[] };
    const rows = await sql<Record<string, unknown>>`
      select id, name, email, message, status, created_at
      from contacts
      order by case status when 'open' then 0 else 1 end, id desc
      limit 80
    `;
    return {
      yard,
      unclaimed,
      rows: rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name ?? ""),
        email: String(r.email ?? ""),
        message: String(r.message ?? ""),
        status: String(r.status ?? "open"),
        created_at: String(r.created_at ?? ""),
      })),
    };
  });

export const setContactStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: "open" | "closed" }) => d)
  .handler(async ({ context, data }) => {
    if (data.status !== "open" && data.status !== "closed") throw new Error("Unknown status");
    await assertYard(context.userId);
    const sql = await getSql();
    await sql`update contacts set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

type YardRfq = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  province: string;
  message: string;
  sku_list: string;
  status: string;
  created_at: string;
};

type YardQuestion = {
  id: number;
  sku: string;
  body: string;
  answer: string;
  created_at: string;
};

type YardReview = {
  id: number;
  sku: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  status: string;
  created_at: string;
};

type YardContact = {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

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
  .validator((d: { order_id: string; sku?: string; reason: string; qty?: number }) => d)
  .handler(async ({ context, data }) => {
    const orderId = String(data.order_id ?? "").trim().slice(0, 40);
    const sku = String(data.sku ?? "").trim().slice(0, 40);
    const reason = String(data.reason ?? "").trim().slice(0, 500);
    const qty = Math.floor(Number(data.qty ?? 1));
    if (!reason) throw new Error("Say why you are returning it");
    if (!Number.isFinite(qty) || qty < 1 || qty > 100000) throw new Error("Invalid quantity");
    const sql = await getSql();
    const own = await sql`select id from orders where id = ${orderId} and user_id = ${context.userId}`;
    if (!own[0]) throw new Error("Order not found");
    if (sku) {
      const line = await sql<{ qty: number }>`select qty from order_lines where order_id = ${orderId} and sku = ${sku}`;
      if (!line[0]) throw new Error("That SKU is not on this order");
      if (qty > num(line[0].qty)) throw new Error("Return quantity is higher than the order");
    }
    await sql`insert into returns (user_id, order_id, sku, qty, reason) values (${context.userId}, ${orderId}, ${sku}, ${qty}, ${reason})`;
    return { ok: true as const };
  });

export const trackOrder = createServerFn({ method: "POST" })
  .validator((id: string) => String(id ?? "").trim().slice(0, 40))
  .handler(async ({ data: id }) => {
    if (!/^BP-[A-Z0-9]+$/.test(id)) return null;
    const sql = await getSql();
    const orders = await sql<Record<string, unknown>>`
      select id, status, delivery_method, payment_method, payment_status, payment_reference,
             collection_slot, carrier, tracking_ref, created_at, subtotal, delivery_fee, vat, total
      from orders where id = ${id}
    `;
    const order = orders[0];
    if (!order) return null;
    const lines = await sql<{ sku: string; name: string; qty: number }>`
      select sku, name, qty from order_lines where order_id = ${id} order by id
    `;
    const events = await sql<{ status: string; note: string | null; created_at: string }>`
      select status, note, created_at from order_events where order_id = ${id} order by id
    `;
    return {
      id: String(order.id),
      status: String(order.status),
      delivery_method: String(order.delivery_method),
      payment_method: String(order.payment_method ?? ""),
      payment_status: String(order.payment_status ?? "simulated"),
      payment_reference: order.payment_reference == null ? null : String(order.payment_reference),
      collection_slot: order.collection_slot == null ? null : String(order.collection_slot),
      carrier: order.carrier == null ? null : String(order.carrier),
      tracking_ref: order.tracking_ref == null ? null : String(order.tracking_ref),
      created_at: String(order.created_at),
      subtotal: num(order.subtotal),
      delivery_fee: num(order.delivery_fee),
      vat: num(order.vat),
      total: num(order.total),
      lines: lines.map((l) => ({ sku: String(l.sku), name: String(l.name), qty: num(l.qty) })),
      events: events.map((e) => ({
        status: String(e.status),
        note: e.note == null ? null : String(e.note),
        created_at: String(e.created_at),
      })),
    };
  });

async function isYard(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ yard_role: string }>`select yard_role from customers where user_id = ${userId}`;
  const role = String(rows[0]?.yard_role ?? "customer");
  return role === "owner" || role === "staff";
}

export async function assertYard(userId: string) {
  if (!(await isYard(userId))) throw new Error("Only the yard desk can do that");
}

export const claimYard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const owners = await sql<{ user_id: string }>`select user_id from customers where yard_role = 'owner' limit 1`;
    const owner = owners[0];
    if (owner && owner.user_id !== context.userId) throw new Error("The yard desk is already claimed");
    await sql`insert into customers (user_id, yard_role) values (${context.userId}, ${"owner"})
      on conflict (user_id) do update set yard_role = 'owner'`;
    return { ok: true as const };
  });

export const deskOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const yard = await isYard(context.userId);
    const owners = await sql`select user_id from customers where yard_role = 'owner' limit 1`;
    const orders = yard
      ? await sql<Record<string, unknown>>`select * from orders order by created_at desc limit 100`
      : await sql<Record<string, unknown>>`select * from orders where user_id = ${context.userId} order by created_at desc`;
    const rfqs = yard
      ? await sql<Record<string, unknown>>`select id, name, company, status, created_at from rfqs order by id desc limit 50`
      : await sql<Record<string, unknown>>`select id, name, company, status, created_at from rfqs where user_id = ${context.userId} order by id desc`;
    const returns = yard
      ? await sql<Record<string, unknown>>`select id, order_id, sku, qty, reason, status, created_at from returns order by id desc limit 50`
      : await sql<Record<string, unknown>>`select id, order_id, sku, qty, reason, status, created_at from returns where user_id = ${context.userId} order by id desc`;
    return {
      yard,
      unclaimed: !owners[0],
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
        sku: r.sku == null ? "" : String(r.sku),
        qty: num(r.qty ?? 1),
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
    if (!ORDER_STATUSES.includes(data.status as (typeof ORDER_STATUSES)[number])) {
      throw new Error("Unknown status");
    }
    if (!(await isYard(context.userId))) throw new Error("Only the yard desk can move an order");
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select status, stock_applied from orders where id = ${data.id}`;
    const current = rows[0];
    if (!current) throw new Error("Order not found");
    const previous = String(current.status);
    const applied = Boolean(current.stock_applied);
    if (previous === data.status) return { ok: true as const };
    if (data.status === "cancelled" && applied) {
      await restoreStock(data.id);
      await sql`update orders set stock_applied = false where id = ${data.id}`;
    }
    if (previous === "cancelled" && data.status !== "cancelled" && !applied) {
      const lines = await sql<{ sku: string; name: string; qty: number; fulfilment: string }>`
        select sku, name, qty, fulfilment from order_lines where order_id = ${data.id}
      `;
      await reserveStock(
        lines.map((l) => ({
          sku: String(l.sku),
          qty: num(l.qty),
          name: String(l.name),
          unit: 0,
          fulfilment: String(l.fulfilment),
        })),
      );
      await sql`update orders set stock_applied = true where id = ${data.id}`;
    }
    await sql`update orders set status = ${data.status} where id = ${data.id}`;
    await sql`insert into order_events (order_id, status, note) values (${data.id}, ${data.status}, ${"Updated from the yard desk"})`;
    return { ok: true as const };
  });

export const setShipment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string; carrier: string; tracking_ref: string }) => ({
    id: String(d?.id ?? "").trim().slice(0, 40),
    carrier: String(d?.carrier ?? "").trim().slice(0, 80),
    tracking_ref: String(d?.tracking_ref ?? "").trim().slice(0, 80),
  }))
  .handler(async ({ context, data }) => {
    if (!CARRIERS.includes(data.carrier as (typeof CARRIERS)[number])) throw new Error("Unknown carrier");
    if (data.tracking_ref.length < 3) throw new Error("Enter the reference the carrier gave the yard");
    if (!(await isYard(context.userId))) throw new Error("Only the yard desk can assign a carrier");
    const sql = await getSql();
    const rows = await sql`select id from orders where id = ${data.id}`;
    if (!rows[0]) throw new Error("Order not found");
    await sql`update orders set carrier = ${data.carrier}, tracking_ref = ${data.tracking_ref} where id = ${data.id}`;
    await sql`insert into order_events (order_id, status, note)
      values (${data.id}, ${"shipment"}, ${`Carrier ${data.carrier}. Reference ${data.tracking_ref}. Recorded by the yard. This is not a live carrier feed.`})`;
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

export const recordEftReference = createServerFn({ method: "POST" })
  .validator((d: { id?: string; email?: string; reference?: string }) => ({
    id: String(d?.id ?? "").trim().slice(0, 40),
    email: String(d?.email ?? "").trim().slice(0, 120).toLowerCase(),
    reference: String(d?.reference ?? "").trim().slice(0, 40),
  }))
  .handler(async ({ data }) => {
    if (!/^BP-[A-Z0-9]+$/.test(data.id)) throw new Error("Unknown order");
    if (!/^[A-Za-z0-9][A-Za-z0-9 -]{3,39}$/.test(data.reference)) {
      throw new Error("Enter the bank reference, 4–40 letters or numbers");
    }
    const sql = await getSql();
    const rows = await sql<{ email: string | null; payment_method: string }>`
      select email, payment_method from orders where id = ${data.id}
    `;
    const order = rows[0];
    if (!order || String(order.email ?? "").toLowerCase() !== data.email) {
      throw new Error("That email does not match this order");
    }
    if (order.payment_method !== "eft") throw new Error("This order is not an EFT transfer");
    await sql`update orders set payment_reference = ${data.reference}, payment_status = 'proof_submitted' where id = ${data.id}`;
    await sql`insert into order_events (order_id, status, note) values (${data.id}, ${"proof_submitted"}, ${"Customer submitted an EFT reference. The yard has not confirmed the funds."})`;
    return { ok: true as const };
  });

export const setPaymentStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string; status: string }) => d)
  .handler(async ({ context, data }) => {
    if (!PAYMENT_STATUSES.includes(data.status as (typeof PAYMENT_STATUSES)[number])) {
      throw new Error("Unknown payment status");
    }
    await assertYard(context.userId);
    const sql = await getSql();
    const rows = await sql`select id from orders where id = ${data.id}`;
    if (!rows[0]) throw new Error("Order not found");
    await sql`update orders set payment_status = ${data.status} where id = ${data.id}`;
    await sql`insert into order_events (order_id, status, note) values (${data.id}, ${data.status}, ${"Payment status updated from the yard desk. This is not a card capture."})`;
    return { ok: true as const };
  });

export const loadInvoice = createServerFn({ method: "POST" })
  .validator((id: string) => String(id ?? "").trim().slice(0, 40))
  .handler(async ({ data: id }) => {
    if (!/^BP-[A-Z0-9]+$/.test(id)) return null;
    const sql = await getSql();
    const orders = await sql<Record<string, unknown>>`select * from orders where id = ${id}`;
    const order = orders[0];
    if (!order) return null;
    const lines = await sql<{ sku: string; name: string; qty: number; unit_price: unknown }>`
      select sku, name, qty, unit_price from order_lines where order_id = ${id} order by id
    `;
    let address = { recipient: "", line1: "", city: "", province: "", postal_code: "" };
    try {
      const parsed = JSON.parse(String(order.address_json ?? "{}")) as Record<string, unknown>;
      address = {
        recipient: String(parsed.recipient ?? ""),
        line1: String(parsed.line1 ?? ""),
        city: String(parsed.city ?? ""),
        province: String(parsed.province ?? ""),
        postal_code: String(parsed.postal_code ?? ""),
      };
    } catch {
      address = address;
    }
    const vatNo = process.env.COMPANY_VAT_NUMBER?.trim() || null;
    return {
      id,
      created_at: String(order.created_at),
      status: String(order.status),
      payment_method: String(order.payment_method),
      payment_status: String(order.payment_status ?? "simulated"),
      payment_reference: order.payment_reference == null ? null : String(order.payment_reference),
      delivery_method: String(order.delivery_method),
      collection_slot: order.collection_slot == null ? null : String(order.collection_slot),
      tier: String(order.tier),
      subtotal: num(order.subtotal),
      delivery_fee: num(order.delivery_fee),
      vat: num(order.vat),
      total: num(order.total),
      address,
      vat_number: vatNo,
      lines: lines.map((l) => ({
        sku: String(l.sku),
        name: String(l.name),
        qty: num(l.qty),
        unit_price: num(l.unit_price),
      })),
    };
  });

export const decideReturn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: "approved" | "declined"; note?: string }) => d)
  .handler(async ({ context, data }) => {
    if (data.status !== "approved" && data.status !== "declined") throw new Error("Unknown decision");
    await assertYard(context.userId);
    const sql = await getSql();
    const rows = await sql<{ id: number; order_id: string; sku: string | null; qty: number; status: string }>`
      select id, order_id, sku, qty, status from returns where id = ${data.id}
    `;
    const row = rows[0];
    if (!row) throw new Error("Return not found");
    if (String(row.status) !== "requested") throw new Error("This return is already decided");
    const note = String(data.note ?? "").trim().slice(0, 240);
    const sku = String(row.sku ?? "").trim();
    const qty = Math.max(1, num(row.qty));
    let restored = false;
    if (data.status === "approved" && sku) {
      const { fetchProduct, noteStock } = await import("@/lib/products.server");
      const product = await fetchProduct(sku);
      if (product?.fulfilmentType === "Stock Item") {
        await sql`update products set stock = stock + ${qty} where sku = ${sku}`;
        noteStock(sku, qty);
        restored = true;
      }
    }
    await sql`update returns set status = ${data.status}, decision_note = ${note} where id = ${data.id}`;
    const eventNote =
      data.status === "declined"
        ? `Return declined. ${note}`.trim()
        : restored
          ? `Return approved. ${qty} × ${sku} put back into stock.`
          : "Return approved. No stock was moved.";
    await sql`insert into order_events (order_id, status, note) values (${row.order_id}, ${"return"}, ${eventNote})`;
    return { ok: true as const, restored };
  });

export const setRfqStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: string }) => d)
  .handler(async ({ context, data }) => {
    if (!["open", "quoted", "closed"].includes(data.status)) throw new Error("Unknown status");
    await assertYard(context.userId);
    const sql = await getSql();
    await sql`update rfqs set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

export const listTradeQueue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const yard = await isYard(context.userId);
    const owners = await sql`select user_id from customers where yard_role = 'owner' limit 1`;
    if (!yard) return { yard: false, unclaimed: !owners[0], rows: [] as TradeQueueRow[] };
    const rows = await sql<Record<string, unknown>>`
      select user_id, display_name, company, vat_number, phone, trade_status, tier, credit_limit, trade_terms
      from customers
      where trade_status in ('pending', 'approved', 'declined')
      order by case trade_status when 'pending' then 0 when 'approved' then 1 else 2 end, created_at desc
      limit 80
    `;
    return {
      yard: true,
      unclaimed: !owners[0],
      rows: rows.map((r) => ({
        user_id: String(r.user_id),
        display_name: r.display_name == null ? null : String(r.display_name),
        company: r.company == null ? null : String(r.company),
        vat_number: r.vat_number == null ? null : String(r.vat_number),
        phone: r.phone == null ? null : String(r.phone),
        trade_status: String(r.trade_status),
        tier: String(r.tier),
        credit_limit: num(r.credit_limit),
        trade_terms: r.trade_terms == null ? null : String(r.trade_terms),
      })),
    };
  });

type TradeQueueRow = {
  user_id: string;
  display_name: string | null;
  company: string | null;
  vat_number: string | null;
  phone: string | null;
  trade_status: string;
  tier: string;
  credit_limit: number;
  trade_terms: string | null;
};

export const decideTrade = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string; status: "approved" | "declined"; creditLimit?: number; terms?: string }) => d)
  .handler(async ({ context, data }) => {
    await assertYard(context.userId);
    if (data.userId === context.userId) {
      throw new Error("A yard account cannot decide its own trade application");
    }
    if (data.status !== "approved" && data.status !== "declined") throw new Error("Unknown decision");
    const terms = data.status === "approved" && ["Net 7", "Net 14", "Net 30"].includes(String(data.terms))
      ? String(data.terms)
      : data.status === "approved"
        ? "Net 30"
        : null;
    const limit = data.status === "approved" ? Math.min(500000, Math.max(0, Math.round(Number(data.creditLimit) || 0))) : 0;
    const tier = data.status === "approved" ? "trade" : "retail";
    const sql = await getSql();
    const existing = await sql`select user_id from customers where user_id = ${data.userId}`;
    if (!existing[0]) throw new Error("Application not found");
    await sql`update customers set trade_status = ${data.status}, tier = ${tier}, credit_limit = ${limit}, trade_terms = ${terms} where user_id = ${data.userId}`;
    return { ok: true as const };
  });
