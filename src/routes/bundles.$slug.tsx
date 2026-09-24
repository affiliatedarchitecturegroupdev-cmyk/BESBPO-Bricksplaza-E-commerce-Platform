import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout";
import { ProductMedia } from "@/components/product-media";
import { Button } from "@/components/ui/button";
import { BUNDLES } from "@/data/content";
import { loadBundle } from "@/lib/products";
import { formatZar } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/bundles/$slug")({
  loader: ({ params }) => loadBundle({ data: { slug: params.slug } }),
  component: BundlePage,
});

function BundlePage() {
  const { slug } = Route.useParams();
  const bundle = BUNDLES.find((b) => b.slug === slug);
  const picks = Route.useLoaderData();
  const add = useCart((s) => s.add);

  if (!bundle) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">That bundle isn’t on the rail</h1>
        <Link to="/" className="mt-4 inline-block text-clay">
          Back home
        </Link>
      </div>
    );
  }

  const total = picks.reduce((n, p) => n + p.product.retailPrice * p.qty, 0);

  return (
    <>
      <PageHeader kicker={bundle.tag} title={bundle.name} body={bundle.blurb} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_20rem] sm:px-6">
        <ul className="space-y-3">
          {picks.map(({ qty, product }) => (
            <li key={product.sku} className="flex gap-4 rounded-xl bg-paper p-4 shadow-[var(--shadow-card)]">
              <ProductMedia product={product} labelled={false} className="size-20 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <Link to="/product/$sku" params={{ sku: product.sku }} className="font-display text-lg hover:text-clay">
                  {product.productType}
                </Link>
                <p className="text-sm text-muted">
                  {product.sku} · {product.colourFinish} · qty {qty}
                </p>
                <p className="mt-1 text-sm tabular-nums">{formatZar(product.retailPrice * qty)}</p>
              </div>
            </li>
          ))}
          {picks.length === 0 && <p className="text-mortar">Those lines aren’t in the catalogue yet.</p>}
        </ul>
        <aside className="h-fit rounded-xl bg-card p-5">
          <p className="text-sm text-muted">Kit at retail, before delivery and VAT</p>
          <p className="font-display text-3xl tabular-nums">{formatZar(total)}</p>
          <p className="mt-2 text-xs text-muted">One load. Trade and volume apply at checkout once you’re signed in.</p>
          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={!picks.length}
            onClick={() => {
              for (const { qty, product } of picks) add(product.sku, qty);
              toast.success(`${bundle.name} added to your load`);
            }}
          >
            Add the kit
          </Button>
        </aside>
      </div>
    </>
  );
}
