import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { useCatalogue } from "@/components/catalogue";

export const Route = createFileRoute("/new")({ component: NewRange });

function NewRange() {
  const products = useCatalogue().filter((p) => p.isNew);
  return (
    <>
      <PageHeader kicker="Just added" title="New to the range" body="AAC, CSEB, brick slips and braai kits — the four newest categories." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Listing products={products} />
      </div>
    </>
  );
}
