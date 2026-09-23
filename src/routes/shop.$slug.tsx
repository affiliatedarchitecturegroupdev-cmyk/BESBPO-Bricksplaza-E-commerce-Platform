import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { productsByCategory } from "@/data/catalogue";
import { CATEGORY_BY_SLUG } from "@/data/taxonomy";

export const Route = createFileRoute("/shop/$slug")({ component: CategoryPage });

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = CATEGORY_BY_SLUG[slug];
  const products = productsByCategory(slug);
  if (!cat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Category not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-clay">
          Back to shop
        </Link>
      </div>
    );
  }
  return (
    <>
      <PageHeader kicker={cat.family.replace("-", " ")} title={cat.name} body={cat.blurb} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {(cat.agreement || cat.newRange) && (
          <div className="mb-6 rounded-xl border border-line bg-card px-4 py-3 text-sm">
            {cat.agreement && (
              <p>
                <span className="font-medium">Agrément SA</span> — certification note shown on every listing card in this regulated category.
              </p>
            )}
            {cat.newRange && <p className="text-mortar">New to the range — AAC, CSEB, brick slips and braai kits.</p>}
          </div>
        )}
        <Listing products={products} title={cat.name} />
      </div>
    </>
  );
}
