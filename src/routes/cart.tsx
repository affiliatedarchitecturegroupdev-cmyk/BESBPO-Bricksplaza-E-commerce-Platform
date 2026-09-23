import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout";
import { useCart } from "@/lib/cart-store";
import { getProduct } from "@/data/catalogue";
import { ProductMedia } from "@/components/product-media";
import { formatZar } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { priceFor } from "@/lib/pricing";
import { AdBanner } from "@/components/ad-banner";
import { adSlot } from "@/data/ads";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { lines, setQty, remove } = useCart();
  const items = lines.flatMap((l) => {
    const p = getProduct(l.sku);
    if (!p) return [];
    return [{ ...l, product: p, price: priceFor(p, "retail") }];
  });
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);

  return (
    <>
      <PageHeader
        kicker="Cart"
        title="Your load"
        body="Prices shown at retail. Trade and volume are applied when you sign in at checkout."
      />
      <div className="mx-auto flex max-w-7xl justify-end px-4 pt-6 sm:px-6">
        <div className="w-full max-w-[700px]">
          <AdBanner slot={adSlot("cart-banner")} contained />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_20rem] sm:px-6">
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="rounded-xl bg-card px-6 py-16 text-center">
              <p className="font-display text-2xl">Cart is empty</p>
              <Link to="/shop" className="mt-3 inline-block text-clay">
                Continue shopping
              </Link>
            </div>
          )}
          {items.map((i) => (
            <div key={i.sku} className="flex gap-4 rounded-xl bg-paper p-4 shadow-[var(--shadow-card)]">
              <ProductMedia product={i.product} labelled={false} className="size-24 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Link to="/product/$sku" params={{ sku: i.sku }} className="font-display text-lg hover:text-clay">
                  {i.product.productType}
                </Link>
                <p className="text-sm text-muted">
                  {i.sku} · {i.product.colourFinish}
                </p>
                <p className="mt-1 text-sm tabular-nums">{formatZar(i.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => setQty(i.sku, Number(e.target.value))}
                    className="h-10 w-20 rounded-md border border-line px-2 text-sm"
                  />
                  <button className="text-sm text-clay" onClick={() => remove(i.sku)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-xl bg-card p-5">
          <p className="text-sm text-muted">Subtotal (ex VAT, ex delivery)</p>
          <p className="font-display text-3xl tabular-nums">{formatZar(subtotal)}</p>
          <p className="mt-1 text-xs text-muted">Delivery calculated at the next step from your postcode.</p>
          {items.length > 0 ? (
            <Link to="/checkout">
              <Button className="mt-4 w-full" size="lg">
                Checkout
              </Button>
            </Link>
          ) : (
            <Button className="mt-4 w-full" size="lg" disabled>
              Checkout
            </Button>
          )}
          <p className="mt-3 text-center text-[11px] uppercase tracking-wider text-muted">SSL · PCI-DSS via partners</p>
        </aside>
      </div>
    </>
  );
}
