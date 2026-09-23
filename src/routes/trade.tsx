import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/trade")({ component: Trade });

function Trade() {
  return (
    <div>
      <section className="relative overflow-hidden bg-kiln text-bisque">
        <img src="/images/hero/yard.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Contractors · QSs · merchants</p>
          <h1 className="mt-3 font-display text-5xl">Trade accounts. 12% off list. Net 7 / 14 / 30.</h1>
          <p className="mt-4 max-w-xl text-dim">
            Credit-vetted, limit enforced at checkout, float ledger for repeat yard collections. Volume (20%) is the next rung.
          </p>
          <Link to="/account" className="mt-8 inline-block">
            <Button size="lg">Apply from your account</Button>
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          ["Retail", "List price. No application."],
          ["Trade", "12% off. Credit limit. Terms."],
          ["Volume", "20% off. Cumulative spend."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-xl bg-paper p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-2xl">{t}</h2>
            <p className="mt-2 text-sm text-mortar">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
