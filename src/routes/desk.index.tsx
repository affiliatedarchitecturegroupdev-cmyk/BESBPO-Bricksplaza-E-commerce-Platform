import { createFileRoute } from "@tanstack/react-router";
import { useCatalogue } from "@/components/catalogue";
import { deskOrders } from "@/lib/commerce";
import { useEffect, useState } from "react";
import { formatZar } from "@/lib/format";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

function DeskHome() {
  const [data, setData] = useState<Awaited<ReturnType<typeof deskOrders>> | null>(null);
  useEffect(() => {
    deskOrders()
      .then(setData)
      .catch(() => setData({ orders: [], rfqs: [], returns: [] }));
  }, []);

  const cat = useCatalogue();
  const low = cat.filter((p) => p.fulfilmentType === "Stock Item" && p.stock < 80).length;
  const revenue = (data?.orders ?? []).reduce((n, o) => n + o.total, 0);

  const tiles = [
    ["Orders (yours)", String(data?.orders.length ?? 0)],
    ["Revenue captured", formatZar(revenue, true)],
    ["Open RFQs", String(data?.rfqs.length ?? 0)],
    ["Low stock SKUs", String(low)],
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Yard dashboard</h1>
      <p className="mt-1 text-sm text-dim">
        Live catalogue of {cat.length.toLocaleString("en-ZA")} SKUs · HITL ops console
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-kiln-2 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{k}</p>
            <p className="mt-2 font-display text-2xl">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 overflow-hidden rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th>Status</th>
              <th>Total</th>
              <th>Carrier</th>
            </tr>
          </thead>
          <tbody>
            {(data?.orders ?? []).slice(0, 8).map((o) => (
              <tr key={o.id} className="border-t border-bisque/10">
                <td className="px-4 py-3">{o.id}</td>
                <td className="capitalize">{o.status}</td>
                <td className="tabular-nums">{formatZar(o.total)}</td>
                <td>{o.carrier}</td>
              </tr>
            ))}
            {(data?.orders ?? []).length === 0 && (
              <tr>
                <td className="px-4 py-6 text-dim" colSpan={4}>
                  No orders on this staff account yet — place one from the storefront.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
