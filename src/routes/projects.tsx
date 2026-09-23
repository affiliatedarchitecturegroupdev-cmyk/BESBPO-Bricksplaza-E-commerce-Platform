import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { PROJECTS } from "@/data/content";

export const Route = createFileRoute("/projects")({ component: Projects });

function Projects() {
  return (
    <>
      <PageHeader kicker="Case studies" title="Project gallery" body="Finished work, linked back to the SKUs that built it." />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-2">
        {PROJECTS.map((p) => (
          <article key={p.slug} className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]">
            <img src={p.image} alt={p.title} className="aspect-[16/9] w-full object-cover" />
            <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {p.sector} · {p.location}
              </p>
              <h2 className="mt-1 font-display text-2xl">{p.title}</h2>
              <p className="mt-2 text-sm text-mortar">{p.body}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
