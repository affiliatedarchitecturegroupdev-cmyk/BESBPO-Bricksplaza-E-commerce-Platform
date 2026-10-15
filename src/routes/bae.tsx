import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { CONTACTS } from "@/data/content";

export const Route = createFileRoute("/bae")({
  head: () => ({
    meta: [
      { title: "BAE · Bellwether Architecture & Engineering" },
      {
        name: "description",
        content:
          "Architectural design and engineering enquiries go to Bellwether Architecture & Engineering, a Besbpo Group company. Bricksplaza does not price that work.",
      },
    ],
  }),
  component: Bae,
});

const WORK = [
  ["Architectural design", "Plans and elevations that can name a Bricksplaza colourway, instead of a colour that is not in the kiln."],
  ["Engineering coordination", "The structural question sits with BAE. Bricksplaza supplies the specified material. It does not sign the calculation."],
  ["Material study", "Face brick, paver and boundary in one colourway, using the colour study on this store. A study is not a built project."],
  ["Not a tender", "BAE prices its own fees. Nothing on this page is a professional appointment, a SACAP number, or a portfolio of completed jobs."],
] as const;

function Bae() {
  return (
    <>
      <PageHeader
        kicker="Besbpo Group · BAE"
        title="Bellwether Architecture & Engineering"
        body="Design and engineering for a masonry order sit with BAE, a group company. This page is the enquiry. It is not a priced appointment, and it does not show a registration number or a set of BAE projects."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {WORK.map(([title, body]) => (
            <article key={title} className="rounded-2xl bg-paper p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display text-2xl">{title}</h2>
              <p className="mt-2 text-sm text-mortar">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-kiln p-6 text-bisque">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Ask BAE</p>
          <p className="mt-2 max-w-2xl text-sm text-dim">
            Write to {CONTACTS.partners} with the site, the sector, and whether you already have a Bricksplaza colourway. The reply comes from the group, not from an automated quote.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a className="text-gold" href={`mailto:${CONTACTS.partners}`}>
              {CONTACTS.partners}
            </a>
            <Link to="/visualise" className="text-gold">
              Open the colour study
            </Link>
            <Link to="/rfq" className="text-gold">
              Materials quote
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
