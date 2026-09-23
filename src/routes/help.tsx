import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { FAQS } from "@/data/content";

export const Route = createFileRoute("/help")({ component: Help });

function Help() {
  return (
    <>
      <PageHeader kicker="Support" title="Help centre" body="Start here before you phone the yard." />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-xl bg-paper p-4 shadow-[var(--shadow-card)]">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-mortar">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link to="/contact" className="text-clay">
            Contact us
          </Link>
          <Link to="/returns" className="text-clay">
            Returns
          </Link>
          <Link to="/warranty" className="text-clay">
            Warranty claim
          </Link>
          <Link to="/rfq" className="text-clay">
            Bulk RFQ
          </Link>
        </div>
      </div>
    </>
  );
}
