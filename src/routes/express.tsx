import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout";
import { LocationPicker } from "@/components/location-picker";
import {
  EXPRESS_RADIUS_KM,
  expressHours,
  nearestSuppliers,
  type Pin,
  type SupplierPin,
} from "@/lib/express";
import { listExpressSuppliers } from "@/lib/express.api";

export const Route = createFileRoute("/express")({
  head: () => ({
    meta: [
      { title: "AA 60/120 Express · Bricksplaza" },
      {
        name: "description",
        content:
          "AA 60/120 adds R1 000 on top of a quoted delivery for stocked lines within 30 km of a supplier pin. Monday to Saturday, 07:00 to 15:30. The fee is refunded if the load arrives at 3 hours or later.",
      },
    ],
  }),
  component: ExpressPage,
});

const RULES = [
  ["R1 000 on top", "The fee sits on a delivery that already has a price. It does not replace that fee, and it is not available on collection."],
  ["Stock lines only", "Every line has to be a stock item. Made-to-order units stay on the ordinary lead time."],
  ["Mon–Sat, 07:00–15:30", "15:30 is the last minute an order can be placed. Sunday is closed. The clock is South African time."],
  ["20 minutes inside the clock", "Preparation is not added after the window. The load is planned inside 2 hours."],
  ["Paid through 2 h 59", "The R1 000 is kept only if the yard marks arrival strictly before 3 hours. At 3:00 the fee is refunded. That is 59 minutes after the 2-hour span."],
  ["30 km from a pin", "The check uses the pin you set, not the postcode alone. Today only Midrand and Cato Ridge are pinned, until the desk adds a partner who can prepare a load in 20 minutes."],
];

function ExpressPage() {
  const [suppliers, setSuppliers] = useState<SupplierPin[]>([]);
  const [pins, setPins] = useState<"loading" | "ready" | "error">("loading");
  const [pin, setPin] = useState<(Pin & { label: string }) | null>(null);
  const [now] = useState(() => new Date());
  const hours = expressHours(now);
  const nearest = pin ? nearestSuppliers(pin, suppliers) : [];
  const inRange = nearest.find((row) => row.km <= EXPRESS_RADIUS_KM);

  useEffect(() => {
    listExpressSuppliers()
      .then((rows) => {
        setSuppliers(rows);
        setPins("ready");
      })
      .catch(() => {
        setSuppliers([]);
        setPins("error");
      });
  }, []);

  return (
    <>
      <PageHeader
        kicker="AA 60/120"
        title="A delivery clock, not another freight band."
        body="R1 000 on top of a quoted delivery, for stocked material a partner can prepare in 20 minutes and bring to a pin within 30 km. The service is designed to run wherever a pin exists. Right now the only pins are the Midrand and Cato Ridge yards."
      />
      <section className="border-b border-line bg-kiln text-bisque">
        <ol className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-bisque/10 sm:grid-cols-4">
          {[
            ["R1 000", "On top of delivery"],
            ["30 km", "From a supplier pin"],
            ["2 hours", "Planned span"],
            ["3 hours", "Fee refunds"],
          ].map(([value, label]) => (
            <li key={label} className="bg-kiln px-4 py-6 sm:px-6">
              <p className="font-display text-3xl text-gold">{value}</p>
              <p className="mt-1 text-sm text-dim">{label}</p>
            </li>
          ))}
        </ol>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="font-display text-2xl">Set a pin</h2>
          <p className="mt-2 max-w-xl text-sm text-mortar">
            Search a town, use your location, or click the map. The ring is 30 km. Black dots are supplier pins. This page only checks range and hours. The fee is added at checkout, on top of the ordinary quote.
          </p>
          <div className="mt-5">
            <LocationPicker pin={pin} suppliers={suppliers} onChange={setPin} />
          </div>
        </div>
        <aside className="h-fit space-y-4 rounded-xl bg-card p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Right now</p>
          <p className={hours.open ? "text-ok" : "text-clay"}>{hours.open ? "Open for new orders." : hours.reason}</p>
          {pins === "loading" ? (
            <p className="text-sm text-mortar">Loading supplier pins…</p>
          ) : pins === "error" ? (
            <p className="text-sm text-mortar">Supplier pins could not be loaded. Try again in a moment.</p>
          ) : pin ? (
            inRange ? (
              <p className="text-sm text-mortar">
                {pin.label} is {inRange.km.toFixed(1)} km from {inRange.name}. A stocked, quoted delivery can take AA 60/120 while the service is open.
              </p>
            ) : (
              <p className="text-sm text-mortar">
                No supplier pin is within 30 km of {pin.label}
                {nearest[0] ? `. The nearest is ${nearest[0].name} at ${nearest[0].km.toFixed(0)} km.` : "."}
              </p>
            )
          ) : (
            <p className="text-sm text-mortar">No pin yet. The 30 km check cannot use a postcode on its own.</p>
          )}
          <ul className="space-y-2 text-sm text-mortar">
            {pins === "loading" && <li>Loading supplier pins…</li>}
            {pins === "error" && <li>Supplier pins could not be loaded. Try again in a moment.</li>}
            {pins === "ready" && suppliers.length === 0 && <li>No supplier pins are active.</li>}
            {suppliers.map((supplier) => (
              <li key={supplier.id}>
                {supplier.name}
                <span className="text-muted"> · {supplier.city}</span>
              </li>
            ))}
          </ul>
          <Link to="/checkout" className="inline-flex text-sm font-medium text-clay">
            Add it at checkout
          </Link>
        </aside>
      </div>
      <section className="bg-card py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl">How the fee is earned</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RULES.map(([title, body]) => (
              <article key={title} className="rounded-xl bg-paper p-5 shadow-[var(--shadow-card)]">
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-2 text-sm text-mortar">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-mortar">
            A late arrival reduces the order total by the R1 000 and the VAT that was charged on it. If the payment came off a float, that difference is credited back. Card capture is not live, so there is no card refund to send. The ordinary delivery fee is not refunded. Marking arrival records the clock. It does not dispatch a load that is still waiting on an EFT reference or a trade account.
          </p>
        </div>
      </section>
    </>
  );
}
