import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BRAND_COPY, loadBrandShop, type BrandSku } from "@/lib/brands";
import { BRAND_FAMILY_IMAGE, BRAND_MEDIA, BRAND_SKU_IMAGE } from "@/data/brand-media";

export const Route = createFileRoute("/brands/$slug")({
  loader: async ({ params }) => {
    const ranges = await loadBrandShop({ data: params.slug });
    if (!ranges.length) throw notFound();
    return ranges;
  },
  component: BrandShopPage,
});

const STATUS: Record<string, string> = {
  family_only: "Range only",
  brochure: "Brochure sheet",
  brochure_name_only: "Name only — figures rejected",
  manufacturer_page: "Manufacturer page",
};

function BrandShopPage() {
  const rows = Route.useLoaderData();
  const brand = rows[0]!;
  const media = BRAND_MEDIA[brand.brand_slug];
  const parents = rows.filter((row) => !row.parent_sku);
  const children = rows.filter((row) => row.parent_sku);
  const sourced = children.filter((row) => row.dimensions).length;
  return (
    <>
      <PageHeader
        kicker="Manufacturer shop"
        title={brand.brand}
        body={BRAND_COPY[brand.brand_slug]?.line ?? "Quote-only ranges."}
      />
      {media && (
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 lg:grid-cols-[16rem_1fr]">
          <div className="flex items-center justify-center rounded-xl bg-paper p-6">
            <img src={media.logo} alt={media.logoAlt} className="max-h-24 w-full object-contain" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <img src={media.hero.src} alt={media.hero.alt} className="aspect-[16/8] w-full rounded-xl object-cover" />
            {media.hero2 && (
              <img src={media.hero2.src} alt={media.hero2.alt} className="aspect-[16/8] w-full rounded-xl object-cover" />
            )}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="max-w-3xl text-sm text-mortar">
          {parents.length} ranges, {children.length} named products, {sourced} of them with a size taken from the source.
          Still no selling price and no stock figure. A photograph is the manufacturer’s, and a bad brochure reading was dropped rather than shown as a specification.
        </p>
        <div className="mt-8 space-y-10">
          {parents.map((parent) => {
            const items = children.filter((row) => row.parent_sku === parent.sku);
            const family = BRAND_FAMILY_IMAGE[parent.sku];
            return (
              <section key={parent.sku}>
                <h2 className="font-display text-2xl">{parent.name}</h2>
                <p className="text-sm text-muted">{parent.family}</p>
                {family && (
                  <img src={family.src} alt={family.alt} className="mt-3 aspect-[16/6] w-full rounded-xl object-cover" />
                )}
                {items.length === 0 ? (
                  <p className="mt-3 text-sm text-mortar">No individual product has been sourced under this range yet.</p>
                ) : (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {items.map((item) => (
                      <ProductCard key={item.sku} item={item} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <Link to="/brands" className="mt-8 inline-block text-sm font-medium text-clay">
          ← All manufacturer shops
        </Link>
      </div>
    </>
  );
}

function ProductCard({ item }: { item: BrandSku }) {
  const shot = BRAND_SKU_IMAGE[item.sku];
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-paper">
      {shot && <img src={shot.src} alt={shot.alt} className="aspect-[16/9] w-full object-cover" />}
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-clay">{item.sku}</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{STATUS[item.spec_status] ?? item.spec_status}</p>
        </div>
        <h3 className="mt-1 font-display text-xl">{item.name}</h3>
        {item.manufacturer_code && <p className="text-xs text-muted">Manufacturer code {item.manufacturer_code}</p>}
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Size</dt>
            <dd>{item.dimensions ?? "Not in the source"}</dd>
          </div>
          <div>
            <dt className="text-muted">Colour</dt>
            <dd>{item.colour_finish ?? "Not in the source"}</dd>
          </div>
          <div>
            <dt className="text-muted">Standard</dt>
            <dd>{item.standard_ref ?? "Not in the source"}</dd>
          </div>
          <div>
            <dt className="text-muted">Mass</dt>
            <dd>{item.mass_kg != null ? `${item.mass_kg} kg` : "Not in the source"}</dd>
          </div>
        </dl>
        {item.factory && <p className="mt-2 text-xs text-muted">Factory named on the sheet: {item.factory}</p>}
        {item.notes && <p className="mt-2 text-xs text-muted">{item.notes}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to="/rfq" search={{ sku: item.sku }}>
            <Button>Request this product</Button>
          </Link>
          <a href={item.source_url ?? item.official_url} target="_blank" rel="noreferrer" className="text-sm text-clay">
            Source page
          </a>
        </div>
      </div>
    </article>
  );
}