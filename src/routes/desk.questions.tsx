import { createFileRoute, Link } from "@tanstack/react-router";
import { answerQuestion, listYardQuestions } from "@/lib/commerce";
import { YardClaim } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/questions")({ component: QuestionsQueue });

type Queue = Awaited<ReturnType<typeof listYardQuestions>>;

function QuestionsQueue() {
  const [data, setData] = useState<Queue | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  async function refresh() {
    const next = await listYardQuestions();
    setData(next);
    setDrafts(Object.fromEntries(next.rows.map((row) => [row.id, row.answer])));
  }
  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);
  const rows = data?.rows ?? [];
  return (
    <div>
      <h1 className="font-display text-3xl">Product questions</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        Unanswered questions come first. A published answer shows on the product page as Bricksplaza Team.
      </p>
      {data && <YardClaim unclaimed={data.unclaimed} onClaimed={refresh} />}
      {data && !data.yard && !data.unclaimed && (
        <p className="mt-4 text-sm text-dim">The yard operator answers these.</p>
      )}
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl bg-kiln-2 p-4 text-sm">
            <p className="font-mono text-xs text-gold">
              <Link to="/product/$sku" params={{ sku: row.sku }} className="hover:underline">
                {row.sku}
              </Link>
            </p>
            <p className="mt-2 font-medium">{row.body}</p>
            {data?.yard ? (
              <form
                className="mt-3 space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await answerQuestion({ data: { id: row.id, answer: drafts[row.id] ?? "" } });
                    toast.success("Answer published");
                    refresh();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not publish");
                  }
                }}
              >
                <Textarea
                  value={drafts[row.id] ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
                  placeholder="Answer the customer"
                />
                <Button type="submit">{row.answer ? "Update answer" : "Publish answer"}</Button>
              </form>
            ) : (
              row.answer && <p className="mt-2 text-dim">{row.answer}</p>
            )}
          </article>
        ))}
        {data && rows.length === 0 && data.yard && <p className="text-sm text-dim">No questions yet.</p>}
      </div>
    </div>
  );
}
