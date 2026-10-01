import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { BRAND_COPY, listBrandShops } from "@/lib/brands";

export const Route = createFileRoute("/brands/")({
  loader: () => listBrandShops(),
  component: Brands,
});

function Brands() {
  const shops = Route.useLoaderData();
  const total = shops.reduce((n, s) => n + s.ranges, 0);
  return (
    <>
      <PageHeader
        kicker="Specified by name"
        title="Manufacturer shops"
        body="A complementary catalogue for four ranges that clients name on the drawing. These do not replace the Bricksplaza SKUs. Size, colour, stock, price and photographs stay unconfirmed until the manufacturer clears them, so every range here is quoted, not added to the cart."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-sm text-mortar">
          {total} quote-only ranges across {shops.length} manufacturers.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {shops.map((shop) => (
            <Link
              key={shop.brand_slug}
              to="/brands/$slug"
              params={{ slug: shop.brand_slug }}
              className="rounded-xl border border-line bg-paper p-6 shadow-[var(--shadow-card)] hover:border-clay"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-clay">{shop.ranges} ranges</p>
              <h2 className="mt-2 font-display text-3xl">{shop.brand}</h2>
              <p className="mt-2 text-sm text-mortar">{BRAND_COPY[shop.brand_slug]?.line}</p>
              <p className="mt-4 text-sm font-medium text-clay">Open the shop →</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-xs text-muted">
          Bricksplaza is not these manufacturers and does not claim to be an authorised stockist. Official pages are linked for reference. Product photographs and logos are not shown until image rights are cleared.
        </p>
      </div>
    </>
  );
}
