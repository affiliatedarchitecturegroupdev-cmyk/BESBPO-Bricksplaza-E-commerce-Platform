import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { assertYard } from "@/lib/commerce";

export const listExpressSuppliers = createServerFn({ method: "GET" }).handler(async () => {
  const { activeSuppliers } = await import("@/lib/express.server");
  return activeSuppliers();
});

export const saveExpressSupplier = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: { name: string; city: string; province: string; lat: number; lng: number; kind?: string; notes?: string }) => d,
  )
  .handler(async ({ context, data }) => {
    await assertYard(context.userId);
    const name = String(data.name ?? "").trim().slice(0, 80);
    const city = String(data.city ?? "").trim().slice(0, 80);
    const province = String(data.province ?? "").trim().slice(0, 40);
    const notes = String(data.notes ?? "").trim().slice(0, 240);
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    const kind = data.kind === "yard" ? "yard" : "partner";
    if (!name || !city || !province) throw new Error("Name, city and province are required");
    if (!Number.isFinite(lat) || lat < -35 || lat > -22) throw new Error("Latitude is outside South Africa");
    if (!Number.isFinite(lng) || lng < 16 || lng > 33) throw new Error("Longitude is outside South Africa");
    const sql = await getSql();
    await sql`insert into express_suppliers (name, kind, city, province, lat, lng, notes)
      values (${name}, ${kind}, ${city}, ${province}, ${lat}, ${lng}, ${notes})`;
    return { ok: true as const };
  });

export const setExpressSupplierActive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; active: boolean }) => d)
  .handler(async ({ context, data }) => {
    await assertYard(context.userId);
    const sql = await getSql();
    await sql`update express_suppliers set active = ${Boolean(data.active)} where id = ${Number(data.id)}`;
    return { ok: true as const };
  });

export const recordExpressArrival = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => String(id ?? "").trim().slice(0, 40))
  .handler(async ({ context, data: id }) => {
    await assertYard(context.userId);
    const { markExpressArrived } = await import("@/lib/express.server");
    return markExpressArrived(id);
  });

export const loadExpressDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const roleRows = await sql<{ yard_role: string }>`select yard_role from customers where user_id = ${context.userId}`;
    const role = String(roleRows[0]?.yard_role ?? "customer");
    const yard = role === "owner" || role === "staff";
    const owners = await sql`select user_id from customers where yard_role = 'owner' limit 1`;
    if (!yard) return { yard, unclaimed: !owners[0], suppliers: [], orders: [] };
    const suppliers = await sql<Record<string, unknown>>`
      select id, name, kind, city, province, lat, lng, active, notes
      from express_suppliers order by active desc, name
    `;
    const orders = await sql<Record<string, unknown>>`
      select id, status, payment_status, express_status, express_supplier_name, express_distance_km,
             express_place, express_confirmed_at, express_delivered_at, express_fee
      from orders
      where express_fee > 0
      order by created_at desc
      limit 40
    `;
    return {
      yard,
      unclaimed: !owners[0],
      suppliers: suppliers.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        kind: String(r.kind),
        city: String(r.city),
        province: String(r.province),
        lat: Number(r.lat),
        lng: Number(r.lng),
        active: Boolean(r.active),
        notes: String(r.notes ?? ""),
      })),
      orders: orders.map((r) => ({
        id: String(r.id),
        status: String(r.status ?? ""),
        payment_status: String(r.payment_status ?? ""),
        express_status: r.express_status == null ? "" : String(r.express_status),
        supplier: r.express_supplier_name == null ? "" : String(r.express_supplier_name),
        km: r.express_distance_km == null ? null : Number(r.express_distance_km),
        place: r.express_place == null ? "" : String(r.express_place),
        confirmed_at: r.express_confirmed_at == null ? null : String(r.express_confirmed_at),
        delivered_at: r.express_delivered_at == null ? null : String(r.express_delivered_at),
        fee: Number(r.express_fee ?? 0),
      })),
    };
  });
