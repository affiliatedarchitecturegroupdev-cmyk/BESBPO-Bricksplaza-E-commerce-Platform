import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/partners")({ component: Partners });

const PROGRAMMES = [
  {
    title: "Construction companies",
    body: "Repeat loads, named merchandiser, and volume pricing once the account is approved. Credit is vetted — it is not switched on at signup.",
    href: "/sectors/commercial" as const,
    slug: "commercial",
    kind: "sector" as const,
    image: "/images/projects/commercial.jpg",
  },
  {
    title: "Property developers",
    body: "Colour-matched face, semi-face and paver across a whole estate, scheduled against the build programme.",
    href: "/sectors/residential" as const,
    slug: "residential",
    kind: "sector" as const,
    image: "/images/projects/estate.jpg",
  },
  {
    title: "Hardware stores",
    body: "A wholesale relationship for stores that resell the range. Trade 12% from the first approved order.",
    href: "/trade" as const,
    slug: "",
    kind: "trade" as const,
    image: "/images/hero/yard.jpg",
  },
];

function Partners() {
  return (
    <>
      <PageHeader
        kicker="Strategic partners"
        title="Built for the people who buy by the load"
        body="Three programmes. One catalogue. Pricing and credit stay with the Business Desk — this page is how you ask."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {PROGRAMMES.map((p) => (
            <article key={p.title} className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]">
              <img src={p.image} alt="" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <h2 className="font-display text-2xl">{p.title}</h2>
                <p className="mt-2 text-sm text-mortar">{p.body}</p>
                {p.kind === "sector" ? (
                  <Link to="/sectors/$slug" params={{ slug: p.slug }} className="mt-4 inline-block text-sm font-medium text-clay">
                    Sector notes →
                  </Link>
                ) : (
                  <Link to="/trade" className="mt-4 inline-block text-sm font-medium text-clay">
                    Trade application →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        <section id="refer" className="mt-14 rounded-2xl bg-kiln p-8 text-bisque sm:p-12">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Referral</p>
          <h2 className="mt-2 font-display text-3xl">Refer a buyer. R500 credit when their first load ships.</h2>
          <p className="mt-3 max-w-2xl text-dim">
            The credit lands on your account after the referred order is delivered and paid. Tell us both company names — the desk confirms it. This is not an automatic coupon.
          </p>
          <Link to="/contact" className="mt-6 inline-block">
            <Button size="lg">Send the introduction</Button>
          </Link>
        </section>
      </div>
    </>
  );
}
