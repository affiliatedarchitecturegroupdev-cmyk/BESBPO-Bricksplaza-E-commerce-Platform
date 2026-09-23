import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMyOrder } from "@/lib/commerce";
import { formatZar } from "@/lib/format";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { AdBanner } from "@/components/ad-banner";
import { adSlot } from "@/data/ads";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

function OrderPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const guest = localStorage.getItem(`bp-order-${id}`);
    if (guest) {
      setOrder(JSON.parse(guest));
      return;
    }
    if (user) {
      getMyOrder({ data: id }).then((o) => setOrder(o as Record<string, unknown> | null));
    }
  }, [id, user]);

  if (isPending) return <div className="mx-auto max-w-2xl px-4 py-16">Loading…</div>;
  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Order not found</h1>
        <p className="mt-2 text-mortar">Sign in if this was placed on your account.</p>
        <Link to="/login" className="mt-4 inline-block text-clay">
          Sign in
        </Link>
      </div>
    );
  }

  const total = Number(order.total ?? 0);
  const status = String(order.status ?? "processing");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ok">Order confirmed</p>
      <h1 className="mt-2 font-display text-4xl">{String(order.id)}</h1>
      <p className="mt-2 text-mortar">
        Status: <span className="font-medium capitalize text-kiln">{status.replace("_", " ")}</span>
        {order.carrier ? ` · ${String(order.carrier)}` : ""}
      </p>
      <p className="mt-1 font-display text-3xl tabular-nums">{formatZar(total)}</p>
      <div className="mt-8 rounded-xl bg-card p-5 text-sm">
        <p>A confirmation has been recorded against this order id. Email and SMS fire from the same server-side event so they cannot disagree.</p>
        {!user && (
          <p className="mt-3">
            Guest order stored on this device.{" "}
            <Link to="/login" className="text-clay">
              Create an account
            </Link>{" "}
            with the same email to keep history.
          </p>
        )}
      </div>
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
