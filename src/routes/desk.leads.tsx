import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listEnquiries, setEnquiryStatus } from "@/lib/commerce";
import { YardClaim } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/leads")({ component: Leads });

function Leads() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listEnquiries>> | null>(null);
  async function refresh() {
    setData(await listEnquiries());
  }
  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">Leads and applications</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Contract briefs for Affiliated Builders and Finishes Construction, and careers applications. Reply from the division mailbox, then close the note.
      </p>
      {data && <YardClaim unclaimed={data.unclaimed} onClaimed={refresh} />}
      <div className="mt-6 space-y-3">
        {(data?.rows ?? []).map((row) => (
          <article key={row.id} className="rounded-xl bg-kiln-2 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {row.name} · {row.kind}
                  {row.role ? ` · ${row.role}` : ""}
                </p>
                <p className="text-dim">
                  {row.email}
                  {row.phone ? ` · ${row.phone}` : ""}
                </p>
              </div>
              <span className="capitalize text-gold">{row.status}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap">{row.message}</p>
            {data?.yard && row.status === "new" && (
              <Button
                className="mt-3"
                variant="outline"
                onClick={async () => {
                  await setEnquiryStatus({ data: { id: row.id, status: "closed" } });
                  toast.success("Closed");
                  refresh();
                }}
              >
                Close
              </Button>
            )}
          </article>
        ))}
        {data && data.rows.length === 0 && <p className="text-sm text-dim">No briefs yet.</p>}
      </div>
    </div>
  );
}
