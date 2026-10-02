import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout";
import { SourcingCarousel } from "@/components/sourcing-carousel";
import { SOURCING_BODIES, SOURCING_PRODUCTS, SOURCING_QUESTIONS, SOURCING_REGISTER, SOURCING_STEPS } from "@/data/sourcing";

export const Route = createFileRoute("/responsible-sourcing")({
  head: () => ({
    meta: [
      { title: "Responsible sourcing · Bricksplaza" },
      {
        name: "description",
        content: "How Bricksplaza selects partners, checks certificates, and publishes a claim only for the product it covers.",
      },
    ],
  }),
  component: ResponsibleSourcing,
});

function ResponsibleSourcing() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const records = useMemo(() => {
    return SOURCING_REGISTER.map((row) => {
      const body = SOURCING_BODIES.find((item) => item.id === row.id)!;
      return { ...row, body };
    }).filter((row) => {
      if (!needle) return true;
      return `${row.body.name} ${row.document} ${row.scope} ${row.status}`.toLowerCase().includes(needle);
    });
  }, [needle]);

  return (
    <>
      <PageHeader
        kicker="Responsible sourcing"
        title="Trust is a process, not a sticker."
        body="Bricksplaza buys from manufacturers across South Africa. We screen the partner, check the evidence, and map every claim to the product it actually covers. The badges below belong to those bodies. They are not Bricksplaza certifications."
      />

      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <p className="font-display text-3xl leading-tight">“We do not borrow credibility. We show the evidence behind it.”</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["4", "Checks before a claim is published"],
              ["8", "Bodies explained on this page"],
              ["Scope", "Matched to the product, not the store"],
              ["Open", "Ask for the certificate"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-card p-4">
                <dt className="font-display text-2xl">{value}</dt>
                <dd className="mt-1 text-mortar">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" id="method">
        <p className="text-[11px] uppercase tracking-[0.18em] text-clay">01 · Method</p>
        <h2 className="mt-2 max-w-xl font-display text-4xl">From partner selection to the product page.</h2>
        <p className="mt-3 max-w-xl text-sm text-mortar">
          The same four steps apply to a face brick, a roof tile, a paver, a retaining block or a civil precast unit.
        </p>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {SOURCING_STEPS.map(([number, title, text]) => (
            <li key={number} className="rounded-xl border border-line bg-paper p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-clay">{number}</p>
              <h3 className="mt-6 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm text-mortar">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6" id="framework">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">02 · Framework</p>
            <h2 className="mt-2 font-display text-4xl">Every badge has a job.</h2>
          </div>
          <p className="max-w-sm text-sm text-mortar">
            Some bodies certify a product. Some accredit the certifier. Some represent an industry. Two apply only to builders or contractors.
          </p>
        </div>
        <SourcingCarousel size="page" />
        <p className="mt-3 text-xs text-muted">Moves every six seconds. Arrow keys work when the panel is focused. Pause stops it.</p>
      </section>

      <section className="border-t border-line bg-card" id="evidence">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">03 · Evidence</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl">Search the claim before you trust it.</h2>
          <p className="mt-3 max-w-xl text-sm text-mortar">
            A published product badge will point at a product, a scope, a document and a review date. This register is the rule. It is not a wall of approvals.
          </p>
          <label className="mt-8 block">
            <span className="sr-only">Search the evidence register</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search SABS, Agrément, certificate, contractor…"
              className="h-12 w-full rounded-md border border-line bg-paper px-4 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
            />
          </label>
          <p className="mt-2 text-sm text-muted">{records.length} matching records</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {records.map((row) => (
              <article key={row.id} className="rounded-xl border border-line bg-paper p-4">
                <div className={`grid h-16 place-items-center rounded-lg px-3 ${row.body.onDark ? "bg-kiln" : "bg-card"}`}>
                  <img src={row.body.logo} alt="" className="max-h-12 w-full object-contain" />
                </div>
                <h3 className="mt-4 font-display text-xl">{row.body.name}</h3>
                <p className="mt-2 text-sm">{row.document}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">Scope · {row.scope}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-clay">{row.status}</p>
              </article>
            ))}
          </div>
          {records.length === 0 && (
            <p className="py-8 text-sm text-mortar">Nothing matches. Ask the yard for the product evidence.</p>
          )}

          <h3 className="mt-14 font-display text-3xl">Badges follow the product.</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {SOURCING_PRODUCTS.map(([product, evidence, reference]) => (
              <article key={product} className="rounded-xl border border-line bg-paper p-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-clay">{evidence}</p>
                <h4 className="mt-4 font-display text-xl">{product}</h4>
                <p className="mt-2 text-sm text-mortar">{reference}</p>
                <p className="mt-4 border-t border-line pt-3 text-xs uppercase tracking-[0.12em] text-muted">
                  On the product page only after the scope matches
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-clay text-paper" id="ask">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-paper/70">04 · What you can ask</p>
            <h2 className="mt-2 font-display text-4xl">Ask for the evidence behind the claim.</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SOURCING_QUESTIONS.map((question) => (
              <li key={question} className="rounded-xl bg-paper/15 p-5 font-display text-xl leading-tight">
                {question}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
