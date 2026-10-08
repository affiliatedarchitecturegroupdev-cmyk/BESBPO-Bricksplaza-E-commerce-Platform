import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { PROJECTS } from "@/data/content";

export const Route = createFileRoute("/projects")({ component: Projects });

function Projects() {
  return (
    <>
      <PageHeader
        kicker="Reference"
        title="Project gallery"
        body="Stock photographs of masonry in use. None of these is a Bricksplaza job. The note under each one is how the same building type is scheduled from this catalogue."
      />
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
              <p className="mt-3 text-xs text-muted">Photograph: {p.credit}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
