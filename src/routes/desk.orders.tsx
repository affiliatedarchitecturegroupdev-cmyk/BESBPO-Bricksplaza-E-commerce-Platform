import { createFileRoute } from "@tanstack/react-router";
import { claimYard, deskOrders, setOrderStatus } from "@/lib/commerce";
import { useEffect, useState } from "react";
import { formatZar } from "@/lib/format";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/orders")({ component: DeskOrders });

const STATUSES = ["processing", "dispatched", "in_transit", "out_for_delivery", "delivered", "cancelled"];

function DeskOrders() {
  const [data, setData] = useState<Awaited<ReturnType<typeof deskOrders>> | null>(null);
  async function refresh() {
    setData(await deskOrders());
  }
  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);
  const rows = data?.orders ?? [];
  return (
    <div>
      <h1 className="font-display text-3xl">Order management</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Checkout saves the load here. Payment stays simulated until PayFast is connected. Cancelling a stock line puts the units back on the yard.
      </p>
      {data?.unclaimed && (
        <div className="mt-4 rounded-xl bg-kiln-2 p-4">
          <p className="text-sm">No yard operator yet. The first signed-in account to claim this desk can see every order and move its status.</p>
          <Button
            className="mt-3"
            onClick={async () => {
              try {
                await claimYard();
                toast.success("This account is the yard operator");
                await refresh();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not claim the desk");
              }
            }}
          >
            Claim the yard desk
          </Button>
        </div>
      )}
      {data && !data.yard && !data.unclaimed && (
        <p className="mt-4 text-sm text-dim">You can see your own orders. The yard operator sees every load.</p>
      )}
      <div className="mt-6 overflow-x-auto rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th>Email</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-bisque/10">
                <td className="px-4 py-3">{o.id}</td>
                <td>{o.email}</td>
                <td>
                  {o.payment_method}
                  <span className="mt-0.5 block text-xs text-gold">{o.payment_status}</span>
                </td>
                <td className="tabular-nums">{formatZar(o.total)}</td>
                <td className="pr-4">
                  {data?.yard ? (
                    <Select
                      className="bg-kiln text-bisque"
                      value={o.status}
                      onChange={async (e) => {
                        try {
                          await setOrderStatus({ data: { id: o.id, status: e.target.value } });
                          toast.success("Status updated");
                          refresh();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Could not update");
                        }
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  ) : (
                    <span className="capitalize">{o.status.replaceAll("_", " ")}</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-dim" colSpan={5}>
                  No orders yet. A guest or signed-in checkout lands here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
