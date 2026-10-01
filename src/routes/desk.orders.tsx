import { createFileRoute } from "@tanstack/react-router";
import { claimYard, decideReturn, deskOrders, setOrderStatus, setPaymentStatus, setRfqStatus } from "@/lib/commerce";
import { useEffect, useState } from "react";
import { formatZar } from "@/lib/format";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/orders")({ component: DeskOrders });

const STATUSES = ["processing", "dispatched", "in_transit", "out_for_delivery", "delivered", "cancelled"];
const PAYMENT = ["simulated", "awaiting_eft", "proof_submitted", "proof_received", "on_account", "float"];

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
                  {data?.yard ? (
                    <Select
                      className="mt-1 bg-kiln text-bisque"
                      value={o.payment_status}
                      onChange={async (e) => {
                        try {
                          await setPaymentStatus({ data: { id: o.id, status: e.target.value } });
                          toast.success("Payment status updated");
                          refresh();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Could not update");
                        }
                      }}
                    >
                      {PAYMENT.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  ) : (
                    <span className="mt-0.5 block text-xs text-gold">{o.payment_status}</span>
                  )}
                  {o.payment_reference && <span className="mt-0.5 block text-xs text-dim">{o.payment_reference}</span>}
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
      <h2 className="mt-10 font-display text-2xl">Returns</h2>
      <div className="mt-3 overflow-x-auto rounded-xl bg-kiln-2">
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
            {(data?.returns ?? []).map((row) => (
              <tr key={row.id} className="border-t border-bisque/10">
                <td className="px-4 py-3">{row.order_id}</td>
                <td className="font-mono text-xs">{row.sku || "—"}</td>
                <td>{row.qty}</td>
                <td>{row.reason}</td>
                <td className="pr-4">
                  {data?.yard && row.status === "requested" ? (
                    <div className="flex gap-2">
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
            {(data?.returns ?? []).length === 0 && (
              <tr>
                <td className="px-4 py-6 text-dim" colSpan={5}>
                  No return requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <h2 className="mt-10 font-display text-2xl">Bulk quotes</h2>
      <ul className="mt-3 divide-y divide-bisque/10 rounded-xl bg-kiln-2">
        {(data?.rfqs ?? []).map((rfq) => (
          <li key={rfq.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <span>
              {rfq.company || rfq.name} · <span className="capitalize text-gold">{rfq.status}</span>
            </span>
            {data?.yard && (
              <Select
                className="bg-kiln text-bisque"
                value={rfq.status}
                onChange={async (e) => {
                  try {
                    await setRfqStatus({ data: { id: rfq.id, status: e.target.value } });
                    refresh();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not update");
                  }
                }}
              >
                <option value="open">open</option>
                <option value="quoted">quoted</option>
                <option value="closed">closed</option>
              </Select>
            )}
          </li>
        ))}
        {(data?.rfqs ?? []).length === 0 && <li className="px-4 py-6 text-sm text-dim">No quotes yet.</li>}
      </ul>
    </div>
  );
}
