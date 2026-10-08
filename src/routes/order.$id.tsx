import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackOrder, recordEftReference } from "@/lib/commerce";
import { collectionSlotLabel } from "@/lib/delivery";
import { formatZar } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AdBanner } from "@/components/ad-banner";
import { adSlot } from "@/data/ads";
import { toast } from "sonner";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

type Tracked = NonNullable<Awaited<ReturnType<typeof trackOrder>>>;

function OrderPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Tracked | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");

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

  const slot = order ? collectionSlotLabel(order.collection_slot) : null;
  const paymentCopy: Record<string, string> = {
    simulated: "Simulated — not captured. No merchant has taken funds.",
    awaiting_eft: "Awaiting an EFT reference. Nothing has been captured.",
    proof_submitted: "EFT reference received. The yard has not confirmed the funds.",
    proof_received: "The yard confirmed the EFT reference. This is still not a card capture.",
    on_account: "On the trade account.",
    float: "Taken from the float balance.",
  };

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
      <Fulfilment status={order.status} carrier={order.carrier} tracking={order.tracking_ref} />
      <p className="mt-1 font-display text-3xl tabular-nums">{formatZar(order.total)}</p>
      <p className="mt-2 text-sm text-mortar">
        Payment: {paymentCopy[order.payment_status] ?? order.payment_status}
        {order.payment_reference ? ` Reference ${order.payment_reference}.` : ""}
        {order.delivery_method === "collection" ? ` Collection${slot ? ` · ${slot}` : ""}.` : " Delivery is on the yard’s list."}
      </p>
      {(order.payment_method === "eft" && (order.payment_status === "awaiting_eft" || order.payment_status === "proof_submitted")) && (
        <div className="mt-4 rounded-xl bg-card p-4 text-sm">
          <p className="font-medium">Pay this reference: {order.id}</p>
          {order.eft.accountNumber ? (
            <p className="mt-2 text-mortar">
              {order.eft.accountName}
              {order.eft.bank ? ` · ${order.eft.bank}` : ""} · {order.eft.accountNumber}
              {order.eft.branchCode ? ` · branch ${order.eft.branchCode}` : ""}
            </p>
          ) : (
            <p className="mt-2 text-mortar">The yard account number is not published in this environment yet. The reference is still the order number.</p>
          )}
          <p className="mt-2 text-mortar">Stock stays reserved. The load does not leave until the yard matches the reference you submit below.</p>
        </div>
      )}
      {(order.payment_status === "awaiting_eft" || order.payment_status === "proof_submitted") && (
        <form
          className="mt-4 space-y-2 rounded-xl bg-card p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await recordEftReference({ data: { id: order.id, email, reference } });
              toast.success("Reference sent to the yard");
              const row = await trackOrder({ data: id });
              setOrder(row);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not save the reference");
            }
          }}
        >
          <p className="text-sm font-medium">EFT reference</p>
          <p className="text-xs text-mortar">Use the email from checkout. The yard matches it before they mark the funds received.</p>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Bank reference</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} required />
          </div>
          <Button type="submit">Submit reference</Button>
        </form>
      )}
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
        <Link to="/invoice/$id" params={{ id: order.id }}>
          <Button>
            {order.payment_status === "proof_received" || order.payment_status === "on_account" ? "Tax invoice" : "Pro forma"}
          </Button>
        </Link>
        <Link to="/account">
          <Button variant="outline">Account</Button>
        </Link>
        <Link to="/track">
          <Button variant="outline">Track</Button>
        </Link>
      </div>
    </div>
  );
}

const STEPS = ["processing", "dispatched", "in_transit", "out_for_delivery", "delivered"] as const;

function Fulfilment({ status, carrier, tracking }: { status: string; carrier: string | null; tracking: string | null }) {
  const ref = tracking && !tracking.startsWith("TRK-") ? tracking : null;
  if (status === "cancelled") {
    return <p className="mt-2 text-sm text-mortar">This order is cancelled.</p>;
  }
  const at = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <div className="mt-4">
      <ol className="grid gap-2 sm:grid-cols-5">
        {STEPS.map((step, i) => (
          <li key={step} className={i <= at ? "text-kiln" : "text-muted"}>
            <p className="text-[11px] uppercase tracking-[0.12em]">{i < at ? "Done" : i === at ? "Now" : "Waiting"}</p>
            <p className="text-sm font-medium capitalize">{step.replaceAll("_", " ")}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-mortar">
        {carrier ? carrier : "No carrier assigned yet."}
        {ref ? ` · ${ref}` : " · No carrier reference yet."}
      </p>
    </div>
  );
}
