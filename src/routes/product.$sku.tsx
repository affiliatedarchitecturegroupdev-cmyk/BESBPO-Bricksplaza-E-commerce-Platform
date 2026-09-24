import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SAMPLE_REVIEWS } from "@/data/content";
import { formatNumber, formatZar } from "@/lib/format";
import { quoteDelivery } from "@/lib/delivery";
import { useCart, useViewed, useWishlistLocal } from "@/lib/cart-store";
import { Stars } from "@/components/stars";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { addQuestion, addReview, listQuestions, listReviews } from "@/lib/commerce";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Heart, FileDown, Truck, Calculator } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/ad-banner";
import { crossSellBanner } from "@/data/ads";
import { loadProductView } from "@/lib/products";

export const Route = createFileRoute("/product/$sku")({
  loader: ({ params }) => loadProductView({ data: { sku: params.sku } }),
  component: ProductPage,
});

function ProductPage() {
  const { product, swatches, matched, fbt, related } = Route.useLoaderData();
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const viewed = useViewed((s) => s.push);
  const wish = useWishlistLocal();
  const { user } = useCurrentUserState();

  const [qty, setQty] = useState(1);
  const [m2, setM2] = useState("");
  const [postcode, setPostcode] = useState("1685");
  const [tab, setTab] = useState("specs");

  useEffect(() => {
    if (product) viewed(product.sku);
  }, [product, viewed]);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">SKU not in the catalogue</h1>
        <Link to="/shop" className="mt-4 inline-block text-clay">
          Back to shop
        </Link>
      </div>
    );
  }

  const unitsFromM2 =
    product.coveragePerM2 && Number(m2) > 0 ? Math.ceil(Number(m2) * product.coveragePerM2 * 1.08) : null;
  const quote = quoteDelivery(postcode, "delivery");

  function addToCart(n = qty) {
    add(product!.sku, n);
    toast.success(`Added ${n} × ${product!.sku} to cart`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 text-sm text-muted">
        <Link to="/" className="hover:text-clay">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link to="/shop/$slug" params={{ slug: product.categorySlug }} className="hover:text-clay">
          {product.category}
        </Link>
        <span className="px-2">/</span>
        <span className="text-kiln">{product.sku}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl bg-card">
            <ProductMedia product={product} className="aspect-[4/3] w-full" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="size-20 rounded-lg ring-1 ring-line"
              style={{ background: product.colourHex }}
              title={product.colourFinish}
            />
            <p className="text-sm text-mortar">{product.colourFinish}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-clay">{product.category}</p>
          <div className="mt-1 flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl sm:text-4xl">{product.productType}</h1>
            <p className="shrink-0 font-mono text-sm text-muted">{product.sku}</p>
          </div>
          <p className="mt-2 text-mortar">
            {product.colourFinish}
            {product.sizeMm !== "—" ? ` · ${product.sizeMm} mm` : ""}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Stars value={product.rating} />
            <span className="tabular-nums text-muted">
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-card p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Retail</p>
            <p className="font-display text-3xl tabular-nums">{formatZar(product.retailPrice)}</p>
            <p className="text-sm text-muted">{product.unitOfSale}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted">Trade (12%)</p>
                <p className="tabular-nums font-medium">{formatZar(product.tradePrice)}</p>
              </div>
              <div>
                <p className="text-muted">Volume (20%)</p>
                <p className="tabular-nums font-medium">{formatZar(product.volumePrice)}</p>
              </div>
            </div>
            {user && (
              <p className="mt-2 text-xs text-ok">Signed in — your tier price is applied at checkout.</p>
            )}
          </div>

          {swatches.length > 1 && (
            <div className="mt-6">
              <p className="text-sm font-medium">Colour · {product.colourFinish}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {swatches.map((s) => (
                  <Link
                    key={s.sku}
                    to="/product/$sku"
                    params={{ sku: s.sku }}
                    title={s.colourFinish}
                    className={cn(
                      "size-8 rounded-full ring-2 ring-offset-2 ring-offset-cream",
                      s.sku === product.sku ? "ring-kiln" : "ring-transparent hover:ring-line",
                    )}
                    style={{ background: s.colourHex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.coveragePerM2 && (
            <div className="mt-6 rounded-xl border border-line p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Calculator className="size-4" /> Coverage calculator
              </p>
              <p className="mt-1 text-xs text-muted">
                {product.coveragePerM2} units / m² · we add 8% for cuts
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Area m²"
                  value={m2}
                  onChange={(e) => setM2(e.target.value)}
                  inputMode="decimal"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => unitsFromM2 && setQty(unitsFromM2)}
                  disabled={!unitsFromM2}
                >
                  Use {unitsFromM2 ?? "—"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="qty">Qty</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-28"
              />
            </div>
            <Button size="lg" className="flex-1" onClick={() => addToCart()}>
              Add to cart
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: "/rfq", search: { sku: product.sku } })}>
              Bulk quote
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Wishlist"
              onClick={() => {
                wish.toggle(product.sku);
                toast.message(wish.has(product.sku) ? "Removed from wishlist" : "Saved to wishlist");
              }}
            >
              <Heart className={cn("size-5", wish.has(product.sku) && "fill-clay text-clay")} />
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span
              className={cn(
                "rounded-full px-3 py-1",
                product.fulfilmentType === "Stock Item" ? "bg-ok/10 text-ok" : "bg-gold/20 text-kiln",
              )}
            >
              {product.fulfilmentType === "Stock Item"
                ? `In stock · ${formatNumber(product.stock)} units`
                : "Made-to-Order · 15% surcharge in price"}
            </span>
            <a href="#" className="inline-flex items-center gap-1 text-clay" onClick={(e) => e.preventDefault()}>
              <FileDown className="size-4" /> Spec sheet PDF
            </a>
          </div>

          <div className="mt-6 rounded-xl border border-line p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Truck className="size-4" /> Delivery estimate
            </p>
            <div className="mt-3 flex gap-2">
              <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="Postcode" />
            </div>
            <p className="mt-3 text-sm text-mortar">
              {quote.quoted
                ? `${quote.yard} · ${quote.time} · ${quote.fee === 0 ? "Free" : formatZar(quote.fee ?? 0)}`
                : "Quote will be confirmed within 1 business day (250 km+)."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex gap-1 overflow-x-auto border-b border-line">
          {[
            ["specs", "Technical specs"],
            ["description", "Description"],
            ["compliance", "Compliance"],
            ["reviews", "Reviews"],
            ["qa", "Q&A"],
            ["delivery", "Delivery"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "shrink-0 px-4 py-3 text-sm font-medium",
                tab === id ? "border-b-2 border-clay text-clay" : "text-mortar",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="py-6">
          {tab === "specs" && (
            <table className="w-full max-w-2xl text-sm">
              <tbody>
                {[
                  ["SKU", product.sku],
                  ["Standard", product.applicableStandard],
                  ["Size", product.sizeMm === "—" ? "—" : `${product.sizeMm} mm`],
                  ["Duty / load class", product.dutyLoadClass],
                  ["Sectors", product.sectorsServed.join(", ")],
                  ["Fulfilment", product.fulfilmentType],
                  ["Unit of sale", product.unitOfSale],
                  ["Units / pallet", String(product.unitsPerPallet)],
                  ["Mass / unit", `${product.weightKg} kg`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-line">
                    <th className="py-2 pr-4 text-left font-medium text-mortar">{k}</th>
                    <td className="py-2">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "description" && <p className="max-w-2xl text-mortar">{product.description}</p>}
          {tab === "compliance" && (
            <p className="max-w-2xl text-mortar">
              Sold against {product.applicableStandard}. SANS marks sit on this tab, not buried in a PDF.
              {product.categorySlug === "aac-blocks" || product.categorySlug === "cseb"
                ? " Agrément SA certification applies to this category."
                : ""}
            </p>
          )}
          {tab === "reviews" && <Reviews sku={product.sku} rating={product.rating} count={product.reviewCount} />}
          {tab === "qa" && <Questions sku={product.sku} />}
          {tab === "delivery" && (
            <p className="max-w-2xl text-mortar">
              Local 0–30 km R950 · Regional 30–100 km R1,850 · Extended 100–250 km R3,200 · Long-distance quoted live.
              Collection from {quote.yard} is free. Crane/Hiab offload is added at checkout when the cart needs it.
            </p>
          )}
        </div>
      </div>

      {matched.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-2xl">Colour-matched</h2>
          <p className="mt-1 text-sm text-mortar">Same colourway · face, semi-face, paver, slips, coping</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {matched.slice(0, 4).map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        </section>
      )}
      {fbt.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Frequently bought together</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {fbt.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        </section>
      )}
      <section className="mt-12">
        <h2 className="font-display text-2xl">You may also like</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.slice(0, 4).map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      </section>
      <div className="mx-auto mt-10 w-full max-w-[800px]">
        <AdBanner slot={crossSellBanner(product.categorySlug)} contained />
      </div>
    </div>
  );
}

function Reviews({ sku, rating, count }: { sku: string; rating: number; count: number }) {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<{ title: string | null; body: string; rating: number; verified: boolean }[]>([]);
  useEffect(() => {
    listReviews({ data: sku }).then(setRows).catch(() => setRows([]));
  }, [sku]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="font-display text-4xl tabular-nums">{rating.toFixed(1)}</span>
        <div>
          <Stars value={rating} />
          <p className="text-sm text-muted">{count} catalogue ratings</p>
        </div>
      </div>
      <div className="space-y-4">
        {SAMPLE_REVIEWS.map((r) => (
          <article key={r.name} className="rounded-xl border border-line p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{r.name}</p>
              <Stars value={r.rating} />
            </div>
            <p className="text-xs text-muted">
              {r.city} · Verified purchase
            </p>
            <p className="mt-2 font-medium">{r.title}</p>
            <p className="mt-1 text-sm text-mortar">{r.body}</p>
          </article>
        ))}
        {rows.map((r, i) => (
          <article key={i} className="rounded-xl border border-line p-4">
            <Stars value={r.rating} />
            <p className="mt-1 font-medium">{r.title}</p>
            <p className="text-sm text-mortar">{r.body}</p>
          </article>
        ))}
      </div>
      {!isPending && user && (
        <form
          className="mt-6 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await addReview({
              data: {
                sku,
                rating: Number(fd.get("rating")),
                title: String(fd.get("title")),
                body: String(fd.get("body")),
              },
            });
            toast.success("Review submitted");
            e.currentTarget.reset();
          }}
        >
          <p className="font-medium">Write a review</p>
          <Input name="title" placeholder="Title" required />
          <Input name="rating" type="number" min={1} max={5} defaultValue={5} />
          <Textarea name="body" required placeholder="How did it lay? Colour match? Yard experience?" />
          <Button type="submit">Publish</Button>
        </form>
      )}
    </div>
  );
}

function Questions({ sku }: { sku: string }) {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<{ body: string; answer: string | null; answered_by: string | null }[]>([]);
  useEffect(() => {
    listQuestions({ data: sku }).then(setRows).catch(() => setRows([]));
  }, [sku]);
  return (
    <div className="max-w-2xl space-y-4">
      <article className="rounded-xl bg-card p-4 text-sm">
        <p className="font-medium">Do you hold this colour in both face and paver?</p>
        <p className="mt-2 text-mortar">
          Yes — colour-matched SKUs are linked on this page. Look at the strip below the tabs.
        </p>
        <p className="mt-2 text-xs uppercase tracking-wider text-clay">Bricksplaza Team</p>
      </article>
      {rows.map((q, i) => (
        <article key={i} className="rounded-xl border border-line p-4 text-sm">
          <p className="font-medium">{q.body}</p>
          {q.answer && <p className="mt-2 text-mortar">{q.answer}</p>}
        </article>
      ))}
      {!isPending && user && (
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const body = String(new FormData(e.currentTarget).get("body"));
            await addQuestion({ data: { sku, body } });
            toast.success("Question posted");
            e.currentTarget.reset();
          }}
        >
          <Textarea name="body" required placeholder="Ask the yard…" />
          <Button type="submit">Ask</Button>
        </form>
      )}
    </div>
  );
}
