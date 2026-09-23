import { createFileRoute, Link } from "@tanstack/react-router";
import { LEGAL } from "@/data/content";
import { PageHeader } from "@/components/layout";

export const Route = createFileRoute("/legal/$slug")({ component: LegalPage });

function LegalPage() {
  const { slug } = Route.useParams();
  const page = LEGAL[slug];
  if (!page) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-clay">
          Home
        </Link>
      </div>
    );
  }
  return (
    <>
      <PageHeader kicker="Legal" title={page.title} body={`Last updated ${page.updated}. Attorney review required before public launch copy is treated as final.`} />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {page.sections.map((s) => (
          <section key={s.heading} className="mb-8">
            <h2 className="font-display text-2xl">{s.heading}</h2>
            <p className="mt-3 leading-relaxed text-mortar">{s.body}</p>
          </section>
        ))}
      </article>
    </>
  );
}
