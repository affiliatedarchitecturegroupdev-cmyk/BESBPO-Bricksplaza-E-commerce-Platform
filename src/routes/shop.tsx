import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { queryListing } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  loader: () => queryListing({ data: {} }),
  component: Shop,
});

function Shop() {
  const initial = Route.useLoaderData();
  return (
    <>
      <PageHeader
        kicker="Master catalogue"
        title="All 2,044 SKUs"
        body="Every priced unit is its own page. Named Corobrik, Bosun, Technicrete and Infraset ranges are a separate, quote-only catalogue."
      />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Link to="/brands" className="text-sm font-medium text-clay">
          Open the manufacturer shops →
        </Link>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Listing scope={{}} initial={initial} />
      </div>
    </>
  );
}
