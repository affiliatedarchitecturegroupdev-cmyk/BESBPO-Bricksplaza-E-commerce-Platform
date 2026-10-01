import { createFileRoute } from "@tanstack/react-router";
import { listContacts, setContactStatus } from "@/lib/commerce";
import { YardClaim } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/inbox")({ component: Inbox });

type Queue = Awaited<ReturnType<typeof listContacts>>;

function Inbox() {
  const [data, setData] = useState<Queue | null>(null);
  async function refresh() {
    setData(await listContacts());
  }
  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);
  const rows = data?.rows ?? [];
  return (
    <div>
      <h1 className="font-display text-3xl">Inbox</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">Messages from the contact form. Reply from the sales mailbox, then close the note.</p>
      {data && <YardClaim unclaimed={data.unclaimed} onClaimed={refresh} />}
      {data && !data.yard && !data.unclaimed && (
        <p className="mt-4 text-sm text-dim">The yard operator reads this inbox.</p>
      )}
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl bg-kiln-2 p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-dim">{row.email}</p>
              </div>
              <span className="capitalize text-gold">{row.status}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap">{row.message}</p>
            {data?.yard && (
              <Button
                className="mt-3"
                variant="outline"
                onClick={async () => {
                  try {
                    await setContactStatus({
                      data: { id: row.id, status: row.status === "open" ? "closed" : "open" },
                    });
                    refresh();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not update");
                  }
                }}
              >
                {row.status === "open" ? "Mark closed" : "Reopen"}
              </Button>
            )}
          </article>
        ))}
        {data && rows.length === 0 && data.yard && <p className="text-sm text-dim">No messages yet.</p>}
      </div>
    </div>
  );
}
