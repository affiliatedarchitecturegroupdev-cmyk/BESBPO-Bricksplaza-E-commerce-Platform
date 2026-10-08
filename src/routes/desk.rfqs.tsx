import { createFileRoute } from "@tanstack/react-router";
import { listYardRfqs, setRfqStatus } from "@/lib/commerce";
import { YardClaim } from "@/components/layout";
import { Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
                    if (e.target.value === "quoted") {
                      toast.error("Write the quote in the box, then send it");
                      return;
                    }
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
            {rfq.reply && <p className="mt-3 whitespace-pre-wrap text-bisque">{rfq.reply}</p>}
            {data?.yard && rfq.status === "open" && (
              <form
                className="mt-3 space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const reply = String(new FormData(e.currentTarget).get("reply") ?? "");
                  try {
                    await setRfqStatus({ data: { id: rfq.id, status: "quoted", reply } });
                    toast.success("Quote sent");
                    refresh();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not send");
                  }
                }}
              >
                <Textarea name="reply" required placeholder="The price, the lead time, and what is excluded" className="bg-kiln text-bisque" />
                <Button type="submit" size="sm">
                  Send quote
                </Button>
              </form>
            )}
          </article>
        ))}
        {data && rows.length === 0 && data.yard && <p className="text-sm text-dim">No quotes yet.</p>}
      </div>
    </div>
  );
}
