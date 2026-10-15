import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { previewReturn, submitReturn } from "@/lib/commerce";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { HANDLING_RATE, handlingFee, type HandlingFault } from "@/lib/handling";
import { formatZar } from "@/lib/format";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/returns")({ component: Returns });

const FAULTS: { id: HandlingFault; label: string }[] = [
  { id: "customer", label: "My change — not the yard, not the supplier" },
  { id: "yard", label: "Damaged, short, or a yard error" },
  { id: "supplier", label: "The supplier’s fault" },
];

function Returns() {
  const { user, isPending } = useCurrentUserState();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [fault, setFault] = useState<HandlingFault>("customer");
  const [paid, setPaid] = useState<number | null>(null);
  const [lookup, setLookup] = useState("");
  useEffect(() => setReady(true), []);
  if (!ready || isPending) return <div className="h-32 animate-pulse bg-card" />;
  if (!user) return <RedirectToSignIn />;
  const fee = paid == null ? null : handlingFee(paid, fault);
  return (
    <>
      <PageHeader
        kicker="Support"
        title="Returns request"
        body="Stock items within 10 business days, unopened. A change that is not our fault and not the supplier’s is 18% of the paid order. Damage and supplier fault are not charged that fee."
      />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <p className="mb-4 text-sm text-mortar">
          15% is the usual handling charge. The extra 3% is administration and coordination. The fee is recorded. Cards are not charged.{" "}
          <Link to="/legal/$slug" params={{ slug: "delivery-handling-fee" }} className="text-clay">
            Delivery Handling Fee policy
          </Link>
        </p>
        {done ? (
          <p className="rounded-xl bg-card p-6">{done}</p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const result = await submitReturn({
                data: {
                  order_id: String(fd.get("order_id")),
                  sku: String(fd.get("sku") || ""),
                  qty: Number(fd.get("qty") || 1),
                  reason: String(fd.get("reason")),
                  fault,
                },
              });
              const note =
                result.fee > 0
                  ? `Request logged. Handling fee ${formatZar(result.fee)} (18% of ${formatZar(result.paid)}) is recorded, not charged to a card.`
                  : "Request logged. No handling fee — the reason is not a customer change.";
              toast.success("Return requested");
              setDone(note);
            }}
          >
            <fieldset>
              <legend className="text-sm font-medium">Whose fault is it?</legend>
              <div className="mt-2 space-y-2">
                {FAULTS.map((row) => (
                  <label key={row.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="radio"
                      name="fault"
                      className="mt-1"
                      checked={fault === row.id}
                      onChange={() => setFault(row.id)}
                    />
                    {row.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <Label>Order id</Label>
              <Input
                name="order_id"
                required
                placeholder="BP-…"
                onBlur={async (event) => {
                  const orderId = event.target.value.trim();
                  if (orderId.length < 4) return;
                  setLookup("Checking the order…");
                  try {
                    const preview = await previewReturn({ data: { order_id: orderId, fault } });
                    setPaid(preview ? preview.paid : null);
                    setLookup(preview ? "" : "That order is not on this account.");
                  } catch {
                    setPaid(null);
                    setLookup("The order total could not be read. You can still submit. The fee is worked out on the server.");
                  }
                }}
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input name="sku" required placeholder="The line you are sending back" />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input name="qty" type="number" min={1} defaultValue={1} required />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea name="reason" required />
            </div>
            <p className="rounded-lg bg-card p-3 text-sm text-mortar">
              {fault === "customer"
                ? paid != null && fee != null
                  ? `Handling fee ${formatZar(fee)} — ${Math.round(HANDLING_RATE * 100)}% of the paid order ${formatZar(paid)}.`
                  : "18% of the paid order will be recorded if this is your change."
                : "No handling fee for a yard or supplier fault."}
              {lookup ? ` ${lookup}` : ""}
            </p>
            <Button type="submit">Submit RMA</Button>
          </form>
        )}
      </div>
    </>
  );
}
