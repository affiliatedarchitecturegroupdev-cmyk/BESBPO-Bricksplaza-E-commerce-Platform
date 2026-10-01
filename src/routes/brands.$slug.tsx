import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BRAND_COPY, loadBrandShop } from "@/lib/brands";

export const Route = createFileRoute("/brands/$slug")({
  loader: async ({ params }) => {
    const ranges = await loadBrandShop({ data: params.slug });
    if (!ranges.length) throw notFound();
    return ranges;
  },
  component: BrandShop,
});

function confirmed(value: string | null) {
  return value && value.trim() ? value : "Not confirmed";
}

function BrandShop() {
  const ranges = Route.useLoaderData();
  const brand = ranges[0]!;
  return (
    <>
      <PageHeader
        kicker="Manufacturer shop"
        title={brand.brand}
        body={BRAND_COPY[brand.brand_slug]?.line ?? "Quote-only ranges."}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="max-w-3xl text-sm text-mortar">
          {ranges.length} ranges. Nothing on this page has a selling price or a stock figure. A request goes to the yard as a quote, with the range SKU attached. The priced Bricksplaza catalogue stays separate.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {ranges.map((range) => (
            <article key={range.sku} className="rounded-xl border border-line bg-paper p-5">
              <p className="font-mono text-xs text-clay">{range.sku}</p>
              <h2 className="mt-1 font-display text-2xl">{range.name}</h2>
              <p className="text-sm text-muted">{range.family}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted">Size</dt>
                  <dd>{confirmed(range.dimensions)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Colour</dt>
                  <dd>{confirmed(range.colour_finish)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Standard</dt>
                  <dd>{confirmed(range.standard_ref)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Brochure</dt>
                  <dd>{confirmed(range.brochure_ref)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted">{range.notes}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link to="/rfq" search={{ sku: range.sku }}>
                  <Button>Request this range</Button>
                </Link>
                <a href={range.official_url} target="_blank" rel="noreferrer" className="text-sm text-clay">
                  Manufacturer page
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted">
          Availability is marked {brand.availability_status.replaceAll("_", " ")}. Delivery is {brand.delivery_class.replaceAll("_", " ")}. Image rights: {brand.image_rights_status.replaceAll("_", " ")}.
        </p>
        <Link to="/brands" className="mt-4 inline-block text-sm font-medium text-clay">
          ← All manufacturer shops
        </Link>
      </div>
    </>
  );
}
