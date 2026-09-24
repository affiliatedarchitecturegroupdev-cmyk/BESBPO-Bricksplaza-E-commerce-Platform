import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { queryListing } from "@/lib/products";

export const Route = createFileRoute("/new")({
  loader: () => queryListing({ data: { newOnly: true } }),
  component: NewRange,
});

function NewRange() {
  const initial = Route.useLoaderData();
  return (
    <>
      <PageHeader kicker="Just added" title="New to the range" body="AAC, CSEB, brick slips and braai kits — the four newest categories." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Listing scope={{ newOnly: true }} initial={initial} />
      </div>
    </>
  );
}
