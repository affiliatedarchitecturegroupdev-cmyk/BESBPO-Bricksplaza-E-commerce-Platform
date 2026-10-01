import { createFileRoute } from "@tanstack/react-router";
import { loadDeskSummary } from "@/lib/products";
import { deskOrders } from "@/lib/commerce";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { formatZar } from "@/lib/format";

export const Route = createFileRoute("/desk/reports")({
  loader: () => loadDeskSummary(),
  component: Reports,
});

function Reports() {
  const catalogue = Route.useLoaderData().categories.map((c) => ({
    name: c.prefix,
    skus: c.count,
  }));
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof deskOrders>> | null>(null);
  useEffect(() => {
    deskOrders()
      .then(setOrders)
      .catch(() => setOrders(null));
  }, []);
  const byStatus = Object.entries(
    (orders?.orders ?? []).reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
  const recorded = (orders?.orders ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((n, o) => n + o.total, 0);

  return (
    <div>
      <h1 className="font-display text-3xl">Reporting</h1>
      <p className="mt-1 text-sm text-dim">
        Orders on this desk · {formatZar(recorded)} still open or delivered · cancelled loads are left out of that total
      </p>
      <div className="mt-6 h-64 rounded-xl bg-kiln-2 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byStatus}>
            <XAxis dataKey="name" stroke="#B7ADA0" fontSize={11} />
            <YAxis stroke="#B7ADA0" fontSize={11} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#C4A574" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h2 className="mt-10 font-display text-2xl">Catalogue mix</h2>
      <div className="mt-4 h-80 rounded-xl bg-kiln-2 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={catalogue}>
            <XAxis dataKey="name" stroke="#B7ADA0" fontSize={11} />
            <YAxis stroke="#B7ADA0" fontSize={11} />
            <Tooltip />
            <Bar dataKey="skus" fill="#A8412E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
