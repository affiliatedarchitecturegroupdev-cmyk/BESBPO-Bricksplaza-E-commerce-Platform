import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { useCatalogue } from "@/components/catalogue";
import { SECTORS } from "@/data/taxonomy";

export const Route = createFileRoute("/sectors/$slug")({ component: Sector });

function Sector() {
  const { slug } = Route.useParams();
  const name = SECTORS.find((s) => s.toLowerCase() === slug) ?? "Residential";
  const products = useCatalogue().filter((p) => p.sectorsServed.includes(name));
  return (
    <>
      <PageHeader kicker="Shop by sector" title={name} body={`SKUs specified for ${name.toLowerCase()} work.`} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Listing products={products} />
      </div>
    </>
  );
}
