import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { DIVISIONS } from "@/data/content";
import { submitEnquiry } from "@/lib/commerce";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/divisions/$slug")({
  loader: ({ params }) => {
    const division = DIVISIONS[params.slug as keyof typeof DIVISIONS];
    if (!division) throw notFound();
    return division;
  },
  component: DivisionPage,
});

function DivisionPage() {
  const division = Route.useLoaderData();
  const [sent, setSent] = useState(false);
  return (
    <div>
      <section className="text-white" style={{ background: division.ink }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: division.accent }}>
            {division.kicker}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl sm:text-5xl">{division.pitch}</h1>
          <p className="mt-4 max-w-2xl text-sm text-white/80">{division.lede}</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-display text-2xl">What they do</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {division.services.map((service) => (
              <li key={service} className="rounded-lg border border-line px-3 py-2 text-sm">
                {service}
              </li>
            ))}
          </ul>
          <h2 className="mt-10 font-display text-2xl">Sectors</h2>
          <p className="mt-2 text-sm text-mortar">{division.sectors.join(" · ")}</p>
          <h2 className="mt-10 font-display text-2xl">From a brick order to a contract</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {division.steps.map((step, i) => (
              <li key={step}>
                <span className="font-medium">{i + 1}. </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            {division.sites.map((site) => (
              <a key={site.href} href={site.href} className="text-clay" target="_blank" rel="noreferrer">
                {site.label}
              </a>
            ))}
            <a href={`mailto:${division.email}`} className="text-clay">
              {division.email}
            </a>
            <Link to="/shop" className="text-clay">
              Back to the catalogue
            </Link>
          </div>
        </div>
        <form
          className="h-fit rounded-xl bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            try {
              await submitEnquiry({
                data: {
                  kind: division.slug,
                  name: String(form.get("name") ?? ""),
                  email: String(form.get("email") ?? ""),
                  phone: String(form.get("phone") ?? ""),
                  message: String(form.get("message") ?? ""),
                },
              });
              setSent(true);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not send");
            }
          }}
        >
          <h2 className="font-display text-2xl">Send the brief</h2>
          <p className="mt-1 text-xs text-muted">The yard reads it. It is not a quote and it does not reserve stock.</p>
          {sent ? (
            <p className="mt-4 text-sm">Received. The division replies from {division.email}.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <Label>Name</Label>
                <Input name="name" required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" />
              </div>
              <div>
                <Label>Project</Label>
                <Textarea name="message" required placeholder="Sector, site, and what you already ordered or still need." />
              </div>
              <Button type="submit">Send to the yard</Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
