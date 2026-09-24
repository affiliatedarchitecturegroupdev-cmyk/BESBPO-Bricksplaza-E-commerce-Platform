import { createFileRoute, Link } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useEffect, useState, type ReactNode } from "react";
import {
  applyTradeAccount,
  getOrCreateCustomer,
  listAddresses,
  listMyOrders,
  saveAddress,
  topUpFloat,
  type CustomerRow,
} from "@/lib/commerce";
import { formatZar } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PROVINCES, TIER_LABEL } from "@/data/taxonomy";
import { useWishlistLocal } from "@/lib/cart-store";
import { useProductsBySku } from "@/lib/use-products";
import { ProductCard } from "@/components/product-card";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, isPending } = useCurrentUserState();
  const [tab, setTab] = useState("dashboard");
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof listMyOrders>>>([]);
  const [addresses, setAddresses] = useState<Awaited<ReturnType<typeof listAddresses>>>([]);
  const wish = useWishlistLocal((s) => s.skus);
  const { products: wished } = useProductsBySku(wish);

  useEffect(() => {
    if (!user) return;
    getOrCreateCustomer().then(setCustomer).catch(() => undefined);
    listMyOrders().then(setOrders).catch(() => setOrders([]));
    listAddresses().then(setAddresses).catch(() => setAddresses([]));
  }, [user]);

  if (isPending) return <div className="h-[40vh] animate-pulse bg-card" />;
  if (!user) return <RedirectToSignIn />;

  const tabs = [
    ["dashboard", "Dashboard"],
    ["orders", "Orders"],
    ["addresses", "Addresses"],
    ["wishlist", "Wishlist"],
    ["trade", "Trade account"],
    ["settings", "Profile"],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-clay">My account</p>
      <h1 className="mt-1 font-display text-4xl">Welcome back{customer?.display_name ? `, ${customer.display_name}` : ""}</h1>
      <p className="mt-2 text-mortar">
        {TIER_LABEL[customer?.tier ?? "retail"]}
        {customer && customer.float_balance > 0 ? ` · Float ${formatZar(customer.float_balance)}` : ""}
      </p>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm ${tab === id ? "bg-kiln text-bisque" : "bg-card"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="Recent orders">
            {orders.slice(0, 3).map((o) => (
              <Link key={o.id} to="/order/$id" params={{ id: o.id }} className="mt-2 block text-sm hover:text-clay">
                {o.id} · {o.status} · {formatZar(o.total)}
              </Link>
            ))}
            {orders.length === 0 && <p className="mt-2 text-sm text-muted">No orders yet.</p>}
          </Card>
          <Card title="Trade">
            <p className="mt-2 text-sm capitalize">{customer?.trade_status ?? "none"}</p>
            <p className="text-sm text-muted">Credit limit {formatZar(customer?.credit_limit ?? 0)}</p>
          </Card>
          <Card title="Yard tracking">
            <p className="mt-2 text-sm text-mortar">Open an order to see Processing → Dispatched → In transit → Out for delivery → Delivered.</p>
          </Card>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8 overflow-x-auto rounded-xl bg-paper shadow-[var(--shadow-card)]">
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th>Status</th>
                <th>Carrier</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/order/$id" params={{ id: o.id }} className="text-clay">
                      {o.id}
                    </Link>
                  </td>
                  <td className="capitalize">{o.status}</td>
                  <td>{o.carrier}</td>
                  <td className="tabular-nums">{formatZar(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "addresses" && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-xl border border-line p-4 text-sm">
                <p className="font-medium">{a.label}</p>
                <p className="text-mortar">
                  {a.line1}, {a.city}, {a.province} {a.postal_code}
                </p>
              </div>
            ))}
          </div>
          <form
            className="space-y-3 rounded-xl bg-card p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await saveAddress({
                data: {
                  label: String(fd.get("label")),
                  recipient: String(fd.get("recipient")),
                  line1: String(fd.get("line1")),
                  city: String(fd.get("city")),
                  province: String(fd.get("province")),
                  postal_code: String(fd.get("postal_code")),
                  is_default: true,
                },
              });
              toast.success("Address saved");
              setAddresses(await listAddresses());
            }}
          >
            <p className="font-display text-xl">Add address</p>
            <Input name="label" placeholder="Yard / Site / Home" required />
            <Input name="recipient" placeholder="Recipient" required />
            <Input name="line1" placeholder="Street" required />
            <Input name="city" placeholder="City" required />
            <Select name="province" defaultValue="Gauteng">
              {PROVINCES.map((p) => (
                <option key={p.slug}>{p.name}</option>
              ))}
            </Select>
            <Input name="postal_code" placeholder="Postcode" required />
            <Button type="submit">Save</Button>
          </form>
        </div>
      )}

      {tab === "wishlist" && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {wished.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
          {wish.length === 0 && <p className="text-mortar">No saved SKUs yet.</p>}
        </div>
      )}

      {tab === "trade" && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <form
            className="space-y-3 rounded-xl bg-card p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await applyTradeAccount({
                data: {
                  company: String(fd.get("company")),
                  vat_number: String(fd.get("vat")),
                  phone: String(fd.get("phone")),
                  monthly: String(fd.get("monthly")),
                },
              });
              toast.success("Application sent to the Business Desk");
              setCustomer(await getOrCreateCustomer());
            }}
          >
            <h2 className="font-display text-2xl">Trade application</h2>
            <p className="text-sm text-mortar">Credit-vetted. Net 7 / 14 / 30. 12% off list once approved.</p>
            <Input name="company" placeholder="Company" required />
            <Input name="vat" placeholder="VAT number" required />
            <Input name="phone" placeholder="Phone" required />
            <Input name="monthly" placeholder="Typical monthly demand (ZAR)" />
            <Button type="submit">Submit for vetting</Button>
          </form>
          <div className="rounded-xl border border-line p-5">
            <h2 className="font-display text-2xl">Float</h2>
            <p className="mt-1 text-sm text-mortar">Load a prepaid balance and draw it down against repeat orders.</p>
            <p className="mt-4 font-display text-3xl tabular-nums">{formatZar(customer?.float_balance ?? 0)}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={async () => {
                const next = await topUpFloat({ data: 10000 });
                setCustomer(next);
                toast.success("R10,000 loaded (demo top-up)");
              }}
            >
              Top up R10,000
            </Button>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <form className="mt-8 max-w-md space-y-3">
          <Label>Email</Label>
          <Input value={user.primaryEmail ?? ""} readOnly />
          <p className="text-sm text-muted">Notification preferences: order, dispatch, delivery — transactional only unless you opted into the newsletter.</p>
        </form>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-paper p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
      {children}
    </div>
  );
}
