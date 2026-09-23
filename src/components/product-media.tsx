import type { Product } from "@/data/catalogue";
import { productImage } from "@/data/catalogue";
import { cn } from "@/lib/utils";

function inkOn(hex: string) {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#26211E";
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y > 165 ? "#26211E" : "#EDE1D3";
}

/** Shows `public/images/products/{SKU}.jpg` when that file exists. Otherwise a colour placeholder. */
export function ProductMedia({
  product,
  className,
  alt,
  labelled = true,
}: {
  product: Product;
  className?: string;
  alt?: string;
  labelled?: boolean;
}) {
  const ink = inkOn(product.colourHex);
  const src = productImage(product);

  return (
    <div
      role="img"
      aria-label={alt ?? `${product.productType}, ${product.colourFinish}`}
      className={cn("relative overflow-hidden bg-card", className)}
      style={{ background: product.colourHex }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(38,33,30,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(38,33,30,.35) 1px, transparent 1px)",
          backgroundSize: "24px 14px",
        }}
      />
      {src ? (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        labelled && (
          <div className="absolute inset-0 flex flex-col justify-end p-3" style={{ color: ink }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">Photo coming</p>
            <p className="font-display text-sm leading-tight">{product.colourFinish}</p>
            <p className="font-mono text-[10px] opacity-75">{product.sku}</p>
          </div>
        )
      )}
    </div>
  );
}
