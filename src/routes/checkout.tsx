import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { findProduct } from "@/data/catalogue";
import { useCatalogue } from "@/components/catalogue";
import { PAYMENT_METHODS } from "@/data/content";
import { formatZar, vatInclusive, round2 } from "@/lib/format";
import { priceFor } from "@/lib/pricing";
import { craneSurcharge, quoteDelivery } from "@/lib/delivery";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { placeOrder } from "@/lib/commerce";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PROVINCES } from "@/data/taxonomy";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({ component: Checkout });

const STEPS = ["Cart", "Delivery", "Payment", "Review", "Confirmation"] as const;

function Checkout() {
  const { lines, clear } = useCart();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"delivery" | "collection">("delivery");
  const [hiab, setHiab] = useState(false);
  const [pay, setPay] = useState("payfast");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    recipient: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    province: "Gauteng",
    postal_code: "1685",
    notes: "",
  });

  const catalogue = useCatalogue();
  const items = useMemo(
    () =>
      lines.flatMap((l) => {
        const p = findProduct(catalogue, l.sku);
        return p ? [{ ...l, product: p, price: priceFor(p, "retail") }] : [];
      }),
    [catalogue, lines],
  );
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const quote = quoteDelivery(form.postal_code, method);
  const delivery = (quote.fee ?? 0) + craneSurcharge(hiab);
  const totalEx = round2(subtotal + delivery);
  const total = vatInclusive(totalEx);
  const vat = round2(total - totalEx);

  async function place() {
    setBusy(true);
    try {
      const payload = {
        email: form.email || user?.primaryEmail || "",
        phone: form.phone,
        delivery_method: method,
        postal_code: form.postal_code,
        address: {
          recipient: form.recipient,
          line1: form.line1,
          city: form.city,
          province: form.province,
          postal_code: form.postal_code,
        },
        payment_method: pay,
        lines: items.map((i) => ({ sku: i.sku, qty: i.qty })),
        hiab,
        notes: form.notes,
      };
      if (user) {
        const res = await placeOrder({ data: payload });
        clear();
        navigate({ to: "/order/$id", params: { id: res.id } });
      } else {
        const id = `GUEST-${Date.now().toString(36).toUpperCase()}`;
        const order = { id, ...payload, subtotal, delivery, vat, total, status: "processing", created_at: new Date().toISOString() };
        localStorage.setItem(`bp-order-${id}`, JSON.stringify(order));
        clear();
        navigate({ to: "/order/$id", params: { id } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  if (!items.length && step < 4) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Nothing to check out</h1>
        <Link to="/shop" className="mt-4 inline-block text-clay">
          Shop the catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted">Secure checkout · SSL</p>
      <ol className="mx-auto mt-4 flex max-w-3xl justify-between text-xs uppercase tracking-wider">
        {STEPS.map((s, i) => (
          <li key={s} className={cn("text-muted", i === step && "font-semibold text-clay", i < step && "text-ok")}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-2xl bg-paper p-6 shadow-[var(--shadow-card)]">
          {step === 1 && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl">Delivery</h1>
              <div className="flex gap-2">
                {(["delivery", "collection"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={cn(
                      "h-11 flex-1 rounded-md border text-sm capitalize",
                      method === m ? "border-clay bg-card" : "border-line",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Recipient" value={form.recipient} onChange={(v) => setForm({ ...form, recipient: v })} />
                <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Postcode" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
                <div className="sm:col-span-2">
                  <Field label="Street" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
                </div>
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <div>
                  <Label>Province</Label>
                  <Select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                    {PROVINCES.map((p) => (
                      <option key={p.slug}>{p.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={hiab} onChange={(e) => setHiab(e.target.checked)} />
                Crane / Hiab offload (+ R850)
              </label>
              <p className="text-sm text-mortar">
                {quote.quoted
                  ? `${quote.yard} · ${quote.time} · ${formatZar(delivery)}`
                  : "Long-distance: quote confirmed within 1 business day. You can still place the order."}
              </p>
              <Button onClick={() => setStep(2)}>Continue to payment</Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="font-display text-2xl">Payment</h1>
              <p className="mt-1 text-sm text-mortar">15 methods at launch. This demo confirms instantly except EFT (marked pending proof).</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPay(p.id)}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm",
                      pay === p.id ? "border-clay bg-card" : "border-line",
                    )}
                  >
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted">{p.kind}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>Review order</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="font-display text-2xl">Review</h1>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.sku} className="flex justify-between">
                    <span>
                      {i.qty} × {i.product.productType}
                    </span>
                    <span className="tabular-nums">{formatZar(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-mortar">
                {method === "collection" ? "Collect" : "Deliver"} · {form.city || form.province} · {PAYMENT_METHODS.find((p) => p.id === pay)?.name}
              </p>
              <Label className="mt-4">Notes for the yard</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              {!isPending && !user && (
                <p className="mt-3 text-sm text-mortar">
                  Guest checkout is available.{" "}
                  <Link to="/login" className="text-clay">
                    Sign in
                  </Link>{" "}
                  to keep order history across devices.
                </p>
              )}
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button size="lg" disabled={busy} onClick={place}>
                  {busy ? "Placing…" : "Place order"}
                </Button>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-wider text-muted">PayFast · Ozow · PCI-DSS · SSL</p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-xl bg-card p-5">
          <h2 className="font-display text-lg">Order summary</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <Row k="Subtotal" v={formatZar(subtotal)} />
            <Row k="Delivery" v={quote.quoted ? formatZar(delivery) : "Quoted"} />
            <Row k="VAT (15%)" v={formatZar(vat)} />
            <Row k="Total" v={formatZar(total)} big />
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}

function Row({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className={cn("tabular-nums", big && "font-display text-2xl text-kiln")}>{v}</dd>
    </div>
  );
}
