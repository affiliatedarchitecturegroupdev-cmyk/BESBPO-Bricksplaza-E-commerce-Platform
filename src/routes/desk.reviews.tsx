import { createFileRoute } from "@tanstack/react-router";
import { SAMPLE_REVIEWS } from "@/data/content";

export const Route = createFileRoute("/desk/reviews")({ component: ReviewsMod });

function ReviewsMod() {
  return (
    <div>
      <h1 className="font-display text-3xl">Reviews moderation</h1>
      <p className="mt-1 text-sm text-dim">Profanity/spam filter runs before this queue. Staff answers are badged Bricksplaza Team.</p>
      <div className="mt-6 space-y-3">
        {SAMPLE_REVIEWS.map((r) => (
          <article key={r.name} className="rounded-xl bg-kiln-2 p-4">
            <p className="font-medium">
              {r.name} · {r.city} · {r.rating}★
            </p>
            <p className="mt-1 text-sm text-dim">{r.body}</p>
            <p className="mt-2 text-xs uppercase tracking-wider text-gold">Published</p>
          </article>
        ))}
      </div>
    </div>
  );
}
