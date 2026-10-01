import { createFileRoute } from "@tanstack/react-router";
import { listYardRfqs, setRfqStatus } from "@/lib/commerce";
import { YardClaim } from "@/components/layout";
import { Select } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/rfqs")({ component: Quotes });

type Queue = Awaited<ReturnType<typeof listYardRfqs>>;

function Quotes() {
  const [data, setData] = useState<Queue | null>(null);
  async function refresh() {
    setData(await listYardRfqs());
  }
  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);
  const rows = data?.rows ?? [];
  return (
    <div>
      <h1 className="font-display text-3xl">Bulk quotes</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Requests from the RFQ form. Mark a quote sent, then close it when the customer decides.
      </p>
      {data && <YardClaim unclaimed={data.unclaimed} onClaimed={refresh} />}
      {data && !data.yard && !data.unclaimed && (
        <p className="mt-4 text-sm text-dim">The yard operator works this queue.</p>
      )}
      <div className="mt-6 space-y-3">
        {rows.map((rfq) => (
          <article key={rfq.id} className="rounded-xl bg-kiln-2 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{rfq.company || rfq.name}</p>
                <p className="text-dim">
                  {rfq.name} · {rfq.email}
                  {rfq.phone ? ` · ${rfq.phone}` : ""}
                  {rfq.province ? ` · ${rfq.province}` : ""}
                </p>
              </div>
              {data?.yard ? (
                <Select
                  className="bg-kiln text-bisque"
                  value={rfq.status}
                  onChange={async (e) => {
                    try {
                      await setRfqStatus({ data: { id: rfq.id, status: e.target.value } });
                      toast.success("Quote updated");
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
              ) : (
                <span className="capitalize text-gold">{rfq.status}</span>
              )}
            </div>
            {rfq.sku_list && <p className="mt-3 font-mono text-xs text-gold">{rfq.sku_list}</p>}
            <p className="mt-3 whitespace-pre-wrap text-dim">{rfq.message}</p>
          </article>
        ))}
        {data && rows.length === 0 && data.yard && <p className="text-sm text-dim">No quotes yet.</p>}
      </div>
    </div>
  );
}
