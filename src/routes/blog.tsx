import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { BLOG } from "@/data/content";

export const Route = createFileRoute("/blog")({ component: Blog });

function Blog() {
  return (
    <>
      <PageHeader kicker="Content hub" title="Yard notes" body="Specification, compliance and trade — written for the people who actually buy the brick." />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        {BLOG.map((p) => (
          <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="block rounded-xl bg-paper p-5 shadow-[var(--shadow-card)]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-clay">
              {p.tag} · {p.date}
            </p>
            <h2 className="mt-1 font-display text-2xl">{p.title}</h2>
            <p className="mt-2 text-sm text-mortar">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
