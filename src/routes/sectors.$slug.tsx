import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { SECTORS } from "@/data/taxonomy";
import { queryListing } from "@/lib/products";

export const Route = createFileRoute("/sectors/$slug")({
  loader: ({ params }) => {
    const name = SECTORS.find((s) => s.toLowerCase() === params.slug) ?? "Residential";
    return queryListing({ data: { sector: name } });
  },
  component: Sector,
});

function Sector() {
  const { slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const name = SECTORS.find((s) => s.toLowerCase() === slug) ?? "Residential";
  return (
    <>
      <PageHeader kicker="Shop by sector" title={name} body={`SKUs specified for ${name.toLowerCase()} work.`} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Listing scope={{ sector: name }} initial={initial} />
      </div>
    </>
  );
}
