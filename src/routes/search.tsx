import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { Listing } from "@/components/listing";
import { closestCategory } from "@/lib/search";
import { queryListing } from "@/lib/products";
import { searchBrandRanges } from "@/lib/brands";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdBanner } from "@/components/ad-banner";
import { searchBanner } from "@/data/ads";

type Search = { q?: string; colour?: string; category?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : "",
    colour: typeof s.colour === "string" ? s.colour : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [listing, brands] = await Promise.all([
      queryListing({
        data: { q: deps.q, scopeColour: deps.colour, category: deps.category },
      }),
      searchBrandRanges({ data: deps.q ?? "" }),
    ]);
    return { listing, brands };
  },
  component: SearchPage,
});

function SearchPage() {
  const { q = "", colour, category } = Route.useSearch();
  const { listing, brands } = Route.useLoaderData();
  const navigate = useNavigate();
  const fallback = closestCategory(q);

  return (
    <>
      <PageHeader kicker="Search" title={q ? `Results for “${q}”` : "Search the catalogue"} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <form
          className="mb-8 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const next = new FormData(e.currentTarget).get("q") as string;
            navigate({ to: "/search", search: { q: next } });
          }}
        >
          <Input name="q" defaultValue={q} placeholder="pavers for driveway, BP-CFB-0001, SANS 227…" />
          <Button type="submit">Search</Button>
        </form>
        <div className="mb-8">
          <AdBanner slot={searchBanner(q)} contained />
        </div>
        {brands.length > 0 && (
          <div className="mb-8 rounded-xl border border-line bg-paper p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-clay">Manufacturer ranges</p>
            <ul className="mt-3 divide-y divide-line">
              {brands.map((range) => (
                <li key={range.sku} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span>
                    <span className="font-mono text-xs text-muted">{range.sku}</span> {range.brand} · {range.name}
                  </span>
                  <Link to="/brands/$slug" params={{ slug: range.brand_slug }} className="text-clay">
                    Open shop
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {listing.total === 0 ? (
          <div className="rounded-xl bg-card px-6 py-16 text-center">
            <p className="font-display text-2xl">No exact matches</p>
            <p className="mt-2 text-mortar">
              Closest category: <span className="font-medium text-kiln">{fallback?.name ?? "Clay Face Bricks"}</span>
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/shop/$slug"
                params={{ slug: fallback?.slug ?? "clay-face-bricks" }}
                className="text-sm font-medium text-clay"
              >
                Browse {fallback?.name ?? "the catalogue"}
              </Link>
              <Link to="/rfq" className="text-sm font-medium text-clay">
                Request a bulk quote
              </Link>
            </div>
          </div>
        ) : (
          <Listing scope={{ q, colour, category }} initial={listing} />
        )}
      </div>
    </>
  );
}
