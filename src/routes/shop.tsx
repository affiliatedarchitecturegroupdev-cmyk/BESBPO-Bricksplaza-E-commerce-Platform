import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { useCatalogue } from "@/components/catalogue";

export const Route = createFileRoute("/shop")({ component: Shop });

function Shop() {
  const products = useCatalogue();
  return (
    <>
      <PageHeader
        kicker="Master catalogue"
        title="All 2,044 SKUs"
        body="Every unit is its own page — not a shared configurator. Filter by colour, duty class and fulfilment, or jump a category from Shop."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Listing products={products} />
      </div>
    </>
  );
}
