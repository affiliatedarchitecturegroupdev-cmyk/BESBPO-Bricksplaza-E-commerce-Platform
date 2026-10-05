import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { queryListing } from "@/lib/products";

export const Route = createFileRoute("/shop/")({
  loader: () =>
    queryListing({ data: {} }).catch(() => ({ items: [], total: 0, duties: [], page: 1, pages: 1 })),
  component: ShopIndex,
});

function ShopIndex() {
  const initial = Route.useLoaderData();
  return (
    <>
      <PageHeader
        kicker="The shop"
        title="All priced SKUs"
        body="This is the full priced list. Open a category to see only that range. The Master catalogue is the same products, newest first."
      />
      <div className="mx-auto flex max-w-7xl flex-wrap gap-4 px-4 pt-6 text-sm font-medium sm:px-6">
        <Link to="/catalogue" className="text-clay">
          Master catalogue →
        </Link>
        <Link to="/brands" className="text-clay">
          Manufacturer shops →
        </Link>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Listing scope={{}} initial={initial} />
      </div>
    </>
  );
}
