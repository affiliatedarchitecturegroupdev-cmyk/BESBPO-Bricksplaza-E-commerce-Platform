import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Product } from "@/data/catalogue";
import { ProductMedia } from "@/components/product-media";
import { formatZar } from "@/lib/format";
import { Stars } from "./stars";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  tierPrice,
}: {
  product: Product;
  tierPrice?: number;
}) {
  const price = tierPrice ?? product.retailPrice;
  return (
    <Link
      to="/product/$sku"
      params={{ sku: product.sku }}
      className="group flex flex-col overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-card">
        <ProductMedia product={product} className="absolute inset-0" alt={product.productName} />
        <span
          className="absolute left-3 top-3 size-6 rounded-full ring-2 ring-paper"
          style={{ background: product.colourHex }}
          title={product.colourFinish}
        />
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          {product.isNew && <Tag>New</Tag>}
          {product.isClearance && <Tag tone="gold">Clearance</Tag>}
          {product.fulfilmentType === "Made-to-Order" && <Tag tone="dark">MTO</Tag>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{product.category}</p>
        <h3 className="font-display text-base leading-snug text-kiln group-hover:text-clay">{product.productType}</h3>
        <p className="text-sm text-mortar">
          {product.colourFinish}
          {product.sizeMm !== "—" ? ` · ${product.sizeMm} mm` : ""}
        </p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="font-display text-lg tabular-nums text-kiln">{formatZar(price, price >= 1000)}</p>
            <p className="text-[11px] text-muted">{product.unitOfSale}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Stars value={product.rating} />
            <span className="tabular-nums">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Tag({ children, tone }: { children: ReactNode; tone?: "gold" | "dark" }) {
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tone === "gold" && "bg-gold text-kiln",
        tone === "dark" && "bg-kiln/85 text-bisque",
        !tone && "bg-clay text-paper",
      )}
    >
      {children}
    </span>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="rounded-xl border border-line bg-card px-6 py-16 text-center">
        <p className="font-display text-xl">No matching SKUs</p>
        <p className="mt-2 text-sm text-mortar">Try clearing a filter, or send a bulk quote instead.</p>
        <Link to="/rfq" className="mt-4 inline-flex text-sm font-medium text-clay hover:underline">
          Request a quote
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.sku} product={p} />
      ))}
    </div>
  );
}
