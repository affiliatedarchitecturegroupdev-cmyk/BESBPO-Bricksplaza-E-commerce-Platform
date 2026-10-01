import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/taxonomy";
import { adjustStock, loadInventory, loadStockLog } from "@/lib/products";
import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/inventory")({
  loader: () => loadInventory({ data: { q: "", category: "" } }),
  component: Inventory,
});

function Inventory() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [data, setData] = useState(initial);
  const [sku, setSku] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [log, setLog] = useState<Awaited<ReturnType<typeof loadStockLog>>>([]);

  function reloadLog() {
    loadStockLog()
      .then(setLog)
      .catch(() => setLog([]));
  }

  useEffect(() => {
    reloadLog();
  }, []);

  useEffect(() => {
    let cancel = false;
    const t = window.setTimeout(() => {
      loadInventory({ data: { q, category: cat } })
        .then((rows) => {
          if (!cancel) setData(rows);
        })
        .catch(() => undefined);
    }, 150);
    return () => {
      cancel = true;
      window.clearTimeout(t);
    };
  }, [q, cat]);

  return (
    <div>
      <h1 className="font-display text-3xl">Inventory</h1>
      <p className="mt-1 text-sm text-dim">{data.low} SKUs below the low-stock alert (80 units)</p>
      <form
        className="mt-4 flex flex-wrap items-end gap-2 rounded-xl bg-kiln-2 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await adjustStock({ data: { sku, delta: Number(delta), reason } });
            toast.success(`${sku} is now ${formatNumber(res.stock)}`);
            setReason("");
            setDelta("");
            const rows = await loadInventory({ data: { q, category: cat } });
            setData(rows);
            reloadLog();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not adjust stock");
          }
        }}
      >
        <label className="text-xs text-dim">
          SKU
          <Input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 bg-kiln text-bisque" placeholder="BP-…" />
        </label>
        <label className="text-xs text-dim">
          Change
          <Input value={delta} onChange={(e) => setDelta(e.target.value)} className="mt-1 w-28 bg-kiln text-bisque" placeholder="-12" />
        </label>
        <label className="min-w-48 flex-1 text-xs text-dim">
          Reason
          <Input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 bg-kiln text-bisque" placeholder="Damaged pallet" />
        </label>
        <Button type="submit">Adjust stock</Button>
      </form>
      {log.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-dim">
          {log.map((row, i) => (
            <li key={`${row.sku}-${row.created_at}-${i}`}>
              {row.sku} {row.delta > 0 ? "+" : ""}
              {row.delta} — {row.reason}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SKU or name" className="bg-kiln-2 text-bisque" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-kiln-2 text-bisque">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th>Type</th>
              <th>Fulfilment</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((p) => (
              <tr key={p.sku} className="border-t border-bisque/10">
                <td className="px-4 py-2 font-mono text-xs">{p.sku}</td>
                <td>{p.productType}</td>
                <td>{p.fulfilmentType}</td>
                <td className={p.stock < 80 ? "text-gold" : ""}>
                  {p.fulfilmentType === "Made-to-Order" ? "MTO" : formatNumber(p.stock)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
