import { createFileRoute } from "@tanstack/react-router";
import { claimYard, decideReturn, deskOrders } from "@/lib/commerce";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/returns")({ component: ReturnsQueue });

function ReturnsQueue() {
  const [data, setData] = useState<Awaited<ReturnType<typeof deskOrders>> | null>(null);
  async function refresh() {
    setData(await deskOrders());
  }
  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);
  const rows = data?.returns ?? [];
  return (
    <div>
      <h1 className="font-display text-3xl">Returns</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Approving a stock line puts the units back on the yard. Made-to-order lines are recorded without a stock change.
      </p>
      {data?.unclaimed && (
        <div className="mt-4 rounded-xl bg-kiln-2 p-4">
          <p className="text-sm">Claim the yard desk before you can decide a return.</p>
          <Button
            className="mt-3"
            onClick={async () => {
              try {
                await claimYard();
                toast.success("This account is the yard operator");
                refresh();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not claim the desk");
              }
            }}
          >
            Claim the yard desk
          </Button>
        </div>
      )}
      <div className="mt-6 overflow-x-auto rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-bisque/10">
                <td className="px-4 py-3">{row.order_id}</td>
                <td className="font-mono text-xs">{row.sku || "—"}</td>
                <td>{row.qty}</td>
                <td>{row.reason}</td>
                <td className="pr-4">
                  {data?.yard && row.status === "requested" ? (
                    <div className="flex gap-2 py-2">
                      <Button
                        onClick={async () => {
                          try {
                            const res = await decideReturn({ data: { id: row.id, status: "approved" } });
                            toast.success(res.restored ? "Approved and stock restored" : "Approved");
                            refresh();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Could not approve");
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await decideReturn({ data: { id: row.id, status: "declined" } });
                            toast.message("Return declined");
                            refresh();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Could not decline");
                          }
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <span className="capitalize">{row.status}</span>
                  )}
                </td>
              </tr>
            ))}
            {data && rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-dim" colSpan={5}>
                  No return requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
