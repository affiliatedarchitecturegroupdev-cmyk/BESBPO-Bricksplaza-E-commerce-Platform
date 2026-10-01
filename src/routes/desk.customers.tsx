import { createFileRoute } from "@tanstack/react-router";
import { claimYard, decideTrade, listTradeQueue } from "@/lib/commerce";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatZar } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/customers")({ component: Customers });

type Queue = Awaited<ReturnType<typeof listTradeQueue>>;

function Customers() {
  const [data, setData] = useState<Queue | null>(null);
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState<Record<string, string>>({});

  async function refresh() {
    const next = await listTradeQueue();
    setData(next);
  }

  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Trade account approval</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Applications arrive from Account → Trade. The yard desk approves them. A customer cannot approve their own account, and a yard login cannot decide its own application.
      </p>
      {data?.unclaimed && (
        <div className="mt-4 rounded-xl bg-kiln-2 p-4">
          <p className="text-sm">Claim the yard desk before you can see the queue.</p>
          <Button
            className="mt-3"
            onClick={async () => {
              try {
                await claimYard();
                toast.success("This account is the yard operator");
                await refresh();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not claim the desk");
              }
            }}
          >
            Claim the yard desk
          </Button>
        </div>
      )}
      {data && !data.yard && !data.unclaimed && (
        <p className="mt-4 text-sm text-dim">You are signed in, but this account is not the yard desk.</p>
      )}
      <div className="mt-6 overflow-x-auto rounded-xl bg-kiln-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th>VAT</th>
              <th>Status</th>
              <th>Limit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.rows ?? []).map((row) => (
              <tr key={row.user_id} className="border-t border-bisque/10 align-top">
                <td className="px-4 py-3">
                  <p>{row.company || row.display_name || "Unnamed"}</p>
                  <p className="text-xs text-dim">{row.phone}</p>
                </td>
                <td>{row.vat_number}</td>
                <td className="capitalize">
                  {row.trade_status}
                  {row.trade_status === "approved" && (
                    <span className="mt-0.5 block text-xs text-gold">
                      {row.trade_terms} · {formatZar(row.credit_limit)}
                    </span>
                  )}
                </td>
                <td>
                  {data?.yard && row.trade_status === "pending" ? (
                    <div className="flex flex-col gap-1">
                      <input
                        className="w-28 rounded-md bg-kiln px-2 py-1"
                        inputMode="numeric"
                        placeholder="150000"
                        value={limits[row.user_id] ?? "150000"}
                        onChange={(e) => setLimits({ ...limits, [row.user_id]: e.target.value })}
                      />
                      <select
                        className="rounded-md bg-kiln px-2 py-1"
                        value={terms[row.user_id] ?? "Net 30"}
                        onChange={(e) => setTerms({ ...terms, [row.user_id]: e.target.value })}
                      >
                        <option>Net 7</option>
                        <option>Net 14</option>
                        <option>Net 30</option>
                      </select>
                    </div>
                  ) : (
                    <span className="text-dim">{row.tier}</span>
                  )}
                </td>
                <td className="pr-4">
                  {data?.yard && row.trade_status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            await decideTrade({
                              data: {
                                userId: row.user_id,
                                status: "approved",
                                creditLimit: Number(limits[row.user_id] ?? 150000),
                                terms: terms[row.user_id] ?? "Net 30",
                              },
                            });
                            toast.success("Trade account approved · 12% off retail");
                            await refresh();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Could not approve");
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await decideTrade({ data: { userId: row.user_id, status: "declined" } });
                            toast.message("Application declined");
                            await refresh();
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Could not decline");
                          }
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data?.yard && data.rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-dim" colSpan={5}>
                  No trade applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
