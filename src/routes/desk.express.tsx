import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { YardClaim } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PROVINCES } from "@/data/taxonomy";
import { loadExpressDesk, recordExpressArrival, saveExpressSupplier, setExpressSupplierActive } from "@/lib/express.api";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/express")({ component: ExpressDesk });

type Board = Awaited<ReturnType<typeof loadExpressDesk>>;

function ExpressDesk() {
  const [data, setData] = useState<Board | null>(null);
  const [form, setForm] = useState({ name: "", city: "", province: "Gauteng", lat: "", lng: "", notes: "" });

  async function refresh() {
    setData(await loadExpressDesk());
  }

  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">AA 60/120</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Pins are the 30 km check. The two yards are already on the map. Add a partner only when they can prepare a stocked load in 20 minutes. Marking arrival records the fee clock. It does not send an unpaid load.
      </p>
      {data && <YardClaim unclaimed={data.unclaimed} onClaimed={refresh} />}
      {data && !data.yard && !data.unclaimed && <p className="mt-4 text-sm text-dim">The yard operator manages these pins.</p>}

      {data?.yard && (
        <>
          <form
            className="mt-6 grid gap-3 rounded-xl bg-kiln-2 p-4 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await saveExpressSupplier({
                  data: {
                    name: form.name,
                    city: form.city,
                    province: form.province,
                    lat: Number(form.lat),
                    lng: Number(form.lng),
                    notes: form.notes,
                    kind: "partner",
                  },
                });
                toast.success("Partner pin saved");
                setForm({ name: "", city: "", province: form.province, lat: "", lng: "", notes: "" });
                refresh();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not save the pin");
              }
            }}
          >
            <p className="sm:col-span-2 font-medium">Add a partner pin</p>
            <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
            <div>
              <Label>Province</Label>
              <Select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                {PROVINCES.map((province) => (
                  <option key={province.slug}>{province.name}</option>
                ))}
              </Select>
            </div>
            <Field label="Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
            <Field label="Latitude" value={form.lat} onChange={(lat) => setForm({ ...form, lat })} />
            <Field label="Longitude" value={form.lng} onChange={(lng) => setForm({ ...form, lng })} />
            <div className="sm:col-span-2">
              <Button type="submit">Save pin</Button>
            </div>
          </form>

          <ul className="mt-6 space-y-3">
            {data.suppliers.map((supplier) => (
              <li key={supplier.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-kiln-2 p-4 text-sm">
                <div>
                  <p className="font-medium">
                    {supplier.name}
                    <span className="ml-2 text-xs uppercase tracking-wider text-gold">{supplier.kind}</span>
                    {!supplier.active && <span className="ml-2 text-xs text-dim">Off</span>}
                  </p>
                  <p className="text-dim">
                    {supplier.city}, {supplier.province} · {supplier.lat.toFixed(3)}, {supplier.lng.toFixed(3)}
                  </p>
                  {supplier.notes && <p className="mt-1 text-dim">{supplier.notes}</p>}
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await setExpressSupplierActive({ data: { id: supplier.id, active: !supplier.active } });
                      toast.success(supplier.active ? "Pin turned off" : "Pin turned on");
                      refresh();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not update the pin");
                    }
                  }}
                >
                  {supplier.active ? "Turn off" : "Turn on"}
                </Button>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl">Express orders</h2>
          <ul className="mt-4 space-y-3">
            {data.orders.length === 0 && <li className="text-sm text-dim">No AA 60/120 orders yet.</li>}
            {data.orders.map((order) => (
              <li key={order.id} className="rounded-xl bg-kiln-2 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link to="/order/$id" params={{ id: order.id }} className="font-mono text-gold hover:underline">
                    {order.id}
                  </Link>
                  <span className="capitalize text-gold">{order.express_status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-2 text-dim">
                  {order.supplier}
                  {order.km != null ? ` · ${order.km.toFixed(1)} km` : ""}
                  {order.place ? ` · ${order.place}` : ""}
                </p>
                <p className="text-dim">
                  Order {order.status.replaceAll("_", " ")} · payment {order.payment_status.replaceAll("_", " ")}
                  {order.confirmed_at ? ` · confirmed ${clock(order.confirmed_at)}` : ""}
                </p>
                {order.express_status === "open" && (
                  <Button
                    className="mt-3"
                    onClick={async () => {
                      try {
                        const result = await recordExpressArrival({ data: order.id });
                        toast.success(result.status === "fee_refunded" ? "Arrival recorded. The fee is refunded." : "Arrival recorded. The fee stands.");
                        refresh();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Could not record arrival");
                      }
                    }}
                  >
                    Mark arrived
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} required={label !== "Notes"} />
    </div>
  );
}

function clock(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
