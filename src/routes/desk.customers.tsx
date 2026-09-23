import { createFileRoute } from "@tanstack/react-router";
import { approveOwnTradeDemo, getOrCreateCustomer, type CustomerRow } from "@/lib/commerce";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatZar } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/customers")({ component: Customers });

function Customers() {
  const [c, setC] = useState<CustomerRow | null>(null);
  useEffect(() => {
    getOrCreateCustomer().then(setC);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">Trade account approval</h1>
      <p className="mt-1 text-sm text-dim">
        Production isolates this by staff role. In this HITL demo you can approve the signed-in application on your own
        ledger.
      </p>
      <div className="mt-6 max-w-lg rounded-xl bg-kiln-2 p-5">
        <p className="text-sm">Status: {c?.trade_status}</p>
        <p className="text-sm">Tier: {c?.tier}</p>
        <p className="text-sm">Credit limit: {formatZar(c?.credit_limit ?? 0)}</p>
        <p className="text-sm">Float: {formatZar(c?.float_balance ?? 0)}</p>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={async () => {
              setC(await approveOwnTradeDemo({ data: { status: "approved", terms: "Net 30" } }));
              toast.success("Trade account approved · 12% off · R150k limit");
            }}
          >
            Approve trade
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setC(await approveOwnTradeDemo({ data: { status: "declined" } }));
              toast.message("Application declined");
            }}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
