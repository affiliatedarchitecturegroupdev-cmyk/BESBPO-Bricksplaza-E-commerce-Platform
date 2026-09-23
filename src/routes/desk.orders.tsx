import { createFileRoute } from "@tanstack/react-router";
import { deskOrders, setOrderStatus } from "@/lib/commerce";
import { useEffect, useState } from "react";
import { formatZar } from "@/lib/format";
import { Select } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/orders")({ component: DeskOrders });

const STATUSES = ["processing", "dispatched", "in_transit", "out_for_delivery", "delivered", "cancelled"];

function DeskOrders() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof deskOrders>>["orders"]>([]);
  async function refresh() {
    const d = await deskOrders();
    setRows(d.orders);
  }
  useEffect(() => {
    refresh().catch(() => setRows([]));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">Order management</h1>
      <div className="mt-6 overflow-x-auto rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-bisque/10">
                <td className="px-4 py-3">{o.id}</td>
                <td>{o.payment_method}</td>
                <td className="tabular-nums">{formatZar(o.total)}</td>
                <td className="pr-4">
                  <Select
                    className="bg-kiln text-bisque"
                    value={o.status}
                    onChange={async (e) => {
                      await setOrderStatus({ data: { id: o.id, status: e.target.value } });
                      toast.success("Status updated");
                      refresh();
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-dim" colSpan={4}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
