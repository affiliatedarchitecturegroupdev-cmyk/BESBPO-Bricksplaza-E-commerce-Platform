import { createFileRoute } from "@tanstack/react-router";
import { getCatalogue } from "@/data/catalogue";
import { CATEGORIES } from "@/data/taxonomy";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/desk/reports")({ component: Reports });

function Reports() {
  const cat = getCatalogue();
  const data = CATEGORIES.map((c) => ({
    name: c.prefix,
    skus: cat.filter((p) => p.categorySlug === c.slug).length,
  }));
  return (
    <div>
      <h1 className="font-display text-3xl">Reporting</h1>
      <p className="mt-1 text-sm text-dim">SKU mix by category prefix · exportable in production</p>
      <div className="mt-6 h-80 rounded-xl bg-kiln-2 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
