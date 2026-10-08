import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { BRAND_COPY, listBrandShops } from "@/lib/brands";
import { BRAND_MEDIA } from "@/data/brand-media";

export const Route = createFileRoute("/brands/")({
  loader: () => listBrandShops(),
  component: Brands,
});

function Brands() {
  const shops = Route.useLoaderData();
  return (
    <>
      <PageHeader
        kicker="Specified by name"
        title="Manufacturer shops"
        body="A complementary catalogue for four ranges that clients name on the drawing. These do not replace the Bricksplaza SKUs. Every range here is quoted, not added to the cart."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-sm text-mortar">
          {shops.reduce((n, s) => n + s.ranges, 0)} ranges and {shops.reduce((n, s) => n + s.products, 0)} named products.
          A named product is here only because a brochure or the manufacturer’s own page printed it. A photograph is not a size.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {shops.map((shop) => {
            const media = BRAND_MEDIA[shop.brand_slug];
            return (
              <Link
                key={shop.brand_slug}
                to="/brands/$slug"
                params={{ slug: shop.brand_slug }}
                className="overflow-hidden rounded-xl border border-line bg-paper shadow-[var(--shadow-card)] hover:border-clay"
              >
                {media && (
                  <img src={media.hero.src} alt={media.hero.alt} className="aspect-[16/7] w-full object-cover" />
                )}
                <div className="flex items-start gap-4 p-6">
                  {media && (
                    <img src={media.logo} alt={media.logoAlt} className="h-12 w-16 shrink-0 object-contain" />
                  )}
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-clay">
                      {shop.ranges} ranges · {shop.products} named products
                    </p>
                    <h2 className="mt-1 font-display text-3xl">{shop.brand}</h2>
                    <p className="mt-2 text-sm text-mortar">{BRAND_COPY[shop.brand_slug]?.line}</p>
                    <p className="mt-4 text-sm font-medium text-clay">Open the shop →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-8 max-w-3xl text-xs text-muted">
          Photographs and marks are the manufacturers’. Bricksplaza is not these manufacturers and does not claim to be an authorised stockist. A picture does not confirm size, colour, stock or price.
        </p>
      </div>
    </>
  );
}