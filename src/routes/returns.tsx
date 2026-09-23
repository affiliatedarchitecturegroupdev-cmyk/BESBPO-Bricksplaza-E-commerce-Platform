import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { submitReturn } from "@/lib/commerce";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/returns")({ component: Returns });

function Returns() {
  const { user, isPending } = useCurrentUserState();
  const [done, setDone] = useState(false);
  if (isPending) return <div className="h-32 animate-pulse bg-card" />;
  if (!user) return <RedirectToSignIn />;
  return (
    <>
      <PageHeader kicker="Support" title="Returns request" body="Stock items within 10 business days, unopened. MTO is not returnable once production starts." />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        {done ? (
          <p className="rounded-xl bg-card p-6">Request logged. The RMA queue in the Business Desk will pick it up.</p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await submitReturn({
                data: {
                  order_id: String(fd.get("order_id")),
                  sku: String(fd.get("sku") || ""),
                  reason: String(fd.get("reason")),
                },
              });
              toast.success("Return requested");
              setDone(true);
            }}
          >
            <div>
              <Label>Order id</Label>
              <Input name="order_id" required placeholder="BP-…" />
            </div>
            <div>
              <Label>SKU (optional)</Label>
              <Input name="sku" />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea name="reason" required />
            </div>
            <Button type="submit">Submit RMA</Button>
          </form>
        )}
      </div>
    </>
  );
}
