import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackOrder } from "@/lib/commerce";
import { formatZar } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AdBanner } from "@/components/ad-banner";
import { adSlot } from "@/data/ads";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

type Tracked = NonNullable<Awaited<ReturnType<typeof trackOrder>>>;

function OrderPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Tracked | null | undefined>(undefined);

  useEffect(() => {
    let cancel = false;
    trackOrder({ data: id })
      .then((row) => {
        if (!cancel) setOrder(row);
      })
      .catch(() => {
        if (!cancel) setOrder(null);
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  if (order === undefined) return <div className="mx-auto max-w-2xl px-4 py-16">Loading…</div>;
  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Order not found</h1>
        <p className="mt-2 text-mortar">Check the order id from the confirmation, or sign in if it sits on your account.</p>
        <Link to="/track" className="mt-4 inline-block text-clay">
          Track an order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ok">Order saved</p>
      <h1 className="mt-2 font-display text-4xl">{order.id}</h1>
      <p className="mt-2 text-mortar">
        Status: <span className="font-medium capitalize text-kiln">{order.status.replaceAll("_", " ")}</span>
        {order.carrier ? ` · ${order.carrier}` : ""}
        {order.tracking_ref ? ` · ${order.tracking_ref}` : ""}
      </p>
      <p className="mt-1 font-display text-3xl tabular-nums">{formatZar(order.total)}</p>
      <p className="mt-2 text-sm text-mortar">
        Payment: simulated — not captured. {order.delivery_method === "collection" ? "Collection" : "Delivery"} is on the yard’s list.
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        {order.lines.map((line) => (
          <li key={line.sku} className="flex justify-between gap-3">
            <span>
              {line.qty} × {line.name}
            </span>
            <span className="font-mono text-xs text-muted">{line.sku}</span>
          </li>
        ))}
      </ul>
      <ol className="mt-8 space-y-3 border-l border-line pl-4">
        {order.events.map((event, i) => (
          <li key={`${event.status}-${i}`}>
            <p className="text-sm font-medium capitalize">{event.status.replaceAll("_", " ")}</p>
            {event.note && <p className="text-sm text-mortar">{event.note}</p>}
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <AdBanner slot={adSlot("thankyou-banner")} contained />
      </div>
      <div className="mt-6 flex gap-3">
        <Link to="/account">
          <Button>Account</Button>
        </Link>
        <Link to="/track">
          <Button variant="outline">Track</Button>
        </Link>
      </div>
    </div>
  );
}
