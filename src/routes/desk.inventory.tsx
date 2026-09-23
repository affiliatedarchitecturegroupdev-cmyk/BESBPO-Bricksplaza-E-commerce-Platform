import { createFileRoute } from "@tanstack/react-router";
import { getCatalogue } from "@/data/catalogue";
import { CATEGORIES } from "@/data/taxonomy";
import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/desk/inventory")({ component: Inventory });

function Inventory() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const rows = useMemo(() => {
    return getCatalogue()
      .filter((p) => (!cat || p.categorySlug === cat) && (!q || `${p.sku} ${p.productName}`.toLowerCase().includes(q.toLowerCase())))
      .slice(0, 80);
  }, [q, cat]);
  const low = getCatalogue().filter((p) => p.fulfilmentType === "Stock Item" && p.stock < 80).length;
  return (
    <div>
      <h1 className="font-display text-3xl">Inventory</h1>
      <p className="mt-1 text-sm text-dim">{low} SKUs below the low-stock alert (80 units)</p>
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
            {rows.map((p) => (
              <tr key={p.sku} className="border-t border-bisque/10">
                <td className="px-4 py-2 font-mono text-xs">{p.sku}</td>
                <td>{p.productType}</td>
                <td>{p.fulfilmentType}</td>
                <td className={p.stock < 80 ? "text-gold" : ""}>{p.fulfilmentType === "Made-to-Order" ? "MTO" : formatNumber(p.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
