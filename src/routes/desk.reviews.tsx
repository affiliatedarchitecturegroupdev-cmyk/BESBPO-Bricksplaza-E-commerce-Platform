import { createFileRoute, Link } from "@tanstack/react-router";
import { listYardReviews, setReviewStatus } from "@/lib/commerce";
import { YardClaim } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/reviews")({ component: ReviewsMod });

type Queue = Awaited<ReturnType<typeof listYardReviews>>;

function ReviewsMod() {
  const [data, setData] = useState<Queue | null>(null);
  async function refresh() {
    setData(await listYardReviews());
  }
  useEffect(() => {
    refresh().catch(() => setData(null));
  }, []);
  const rows = data?.rows ?? [];
  return (
    <div>
      <h1 className="font-display text-3xl">Reviews</h1>
      <p className="mt-1 max-w-2xl text-sm text-dim">
        New reviews stay hidden until you publish them. Hiding a review removes it from the product page.
      </p>
      {data && <YardClaim unclaimed={data.unclaimed} onClaimed={refresh} />}
      {data && !data.yard && !data.unclaimed && (
        <p className="mt-4 text-sm text-dim">The yard operator moderates reviews.</p>
      )}
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl bg-kiln-2 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs text-gold">
                <Link to="/product/$sku" params={{ sku: row.sku }} className="hover:underline">
                  {row.sku}
                </Link>
                {row.verified ? " · verified purchase" : ""}
              </p>
              <span className="capitalize text-gold">
                {row.rating}★ · {row.status}
              </span>
            </div>
            {row.title && <p className="mt-2 font-medium">{row.title}</p>}
            <p className="mt-1 text-dim">{row.body}</p>
            {data?.yard && (
              <div className="mt-3 flex gap-2">
                {row.status !== "published" && (
                  <Button
                    onClick={async () => {
                      try {
                        await setReviewStatus({ data: { id: row.id, status: "published" } });
                        toast.success("Review published");
                        refresh();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Could not publish");
                      }
                    }}
                  >
                    Publish
                  </Button>
                )}
                {row.status !== "hidden" && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await setReviewStatus({ data: { id: row.id, status: "hidden" } });
                        toast.message("Review hidden");
                        refresh();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Could not hide");
                      }
                    }}
                  >
                    Hide
                  </Button>
                )}
              </div>
            )}
          </article>
        ))}
        {data && rows.length === 0 && data.yard && <p className="text-sm text-dim">No reviews yet.</p>}
      </div>
    </div>
  );
}
