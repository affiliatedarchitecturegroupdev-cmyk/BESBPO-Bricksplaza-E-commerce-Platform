import type { ColourName, DutyClass, Fulfilment } from "./taxonomy";
import { PRODUCT_PHOTO_FILES } from "./product-photos";

export type Product = {
  sku: string;
  categorySlug: string;
  category: string;
  family: string;
  productType: string;
  productName: string;
  colourFinish: ColourName | string;
  colourHex: string;
  sizeMm: string;
  thicknessMm: string;
  lengthMm: number;
  widthMm: number;
  unitOfSale: string;
  applicableStandard: string;
  dutyLoadClass: DutyClass;
  sectorsServed: string[];
  fulfilmentType: Fulfilment;
  unitCost: number;
  retailPrice: number;
  tradePrice: number;
  volumePrice: number;
  coveragePerM2: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew: boolean;
  isClearance: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  weightKg: number;
  unitsPerPallet: number;
  description: string;
  /** When the SKU was entered on the master catalogue. Newest first on /catalogue. */
  listedAt?: string;
};

const PRODUCT_PHOTOS = import.meta.glob("../../public/images/products/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const PHOTO_BY_SKU = new Map(
  Object.entries(PRODUCT_PHOTOS).map(([path, url]) => {
    const file = path.split("/").pop() ?? "";
    const sku = file.replace(/\.(jpe?g|png|webp)$/i, "");
    return [sku, url] as const;
  }),
);

/** Price-list photo codes. Semi-face and clay maxi share the face-brick pool; there is no separate set. */
const CATEGORY_PHOTO: Record<string, string> = {
  "clay-face-bricks": "CFB",
  "semi-face-bricks": "CFB",
  "clay-maxi-bricks": "CFB",
  "stock-bricks": "CCB",
  "engineering-bricks": "CEB",
  "fire-bricks": "FBR",
  "clay-specials": "SSB",
  "concrete-blocks": "CMB",
  "concrete-maxi": "CNB",
  "aac-blocks": "AAC",
  cseb: "CSE",
  "mortar-accessories": "MJS",
  "clay-pavers": "CPB",
  "concrete-pavers": "ICP",
  cobbles: "CST",
  slabs: "CPS",
  "retaining-blocks": "RWB",
  "brick-slips": "BST",
  "braai-kits": "BFK",
};

function photoKey(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A file named `{SKU}.jpg` wins. Otherwise a stable photo from that category's library. */
export function productImage(p: Product): string | null {
  const own = PHOTO_BY_SKU.get(p.sku);
  if (own) return own;
  const pool = PRODUCT_PHOTO_FILES[CATEGORY_PHOTO[p.categorySlug] ?? ""];
  if (!pool?.length) return null;
  const file = pool[photoKey(`${p.productType}|${p.colourFinish}`) % pool.length];
  return file ? `/images/products/library/${file}` : null;
}

export function findProduct(products: Product[], sku: string) {
  return products.find((p) => p.sku === sku);
}

export function productsByCategory(products: Product[], slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}

export function colourMatched(products: Product[], p: Product, limit = 6): Product[] {
  const relatedCats =
    p.family === "clay-masonry" || p.categorySlug === "clay-pavers" || p.categorySlug === "brick-slips"
      ? ["clay-face-bricks", "semi-face-bricks", "clay-pavers", "brick-slips", "coping"]
      : [p.categorySlug];
  const order = ["clay-face-bricks", "semi-face-bricks", "clay-pavers", "brick-slips", "coping"];
  return products
    .filter(
      (o) =>
        o.sku !== p.sku &&
        o.colourFinish === p.colourFinish &&
        relatedCats.includes(o.categorySlug),
    )
    .sort((a, b) => order.indexOf(a.categorySlug) - order.indexOf(b.categorySlug) || a.sku.localeCompare(b.sku))
    .slice(0, limit);
}

export function relatedProducts(products: Product[], p: Product, limit = 8): Product[] {
  return products
    .filter((o) => o.sku !== p.sku && o.categorySlug === p.categorySlug)
    .sort((a, b) => Math.abs(a.retailPrice - p.retailPrice) - Math.abs(b.retailPrice - p.retailPrice))
    .slice(0, limit);
}

export function frequentlyBought(products: Product[], p: Product): Product[] {
  const extras = products.filter((o) => {
    if (p.categorySlug.includes("paver") || p.categorySlug === "cobbles" || p.categorySlug === "slabs") {
      return (
        o.productType === "Jointing Sand" ||
        o.productType === "Paver Sealer" ||
        (o.categorySlug === "clay-face-bricks" && o.colourFinish === p.colourFinish)
      );
    }
    if (p.categorySlug.includes("brick") || p.categorySlug === "clay-face-bricks") {
      return o.productType === "Class II Masonry Mortar" || o.productType === "Face Brick Sealer";
    }
    return false;
  });
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const e of extras) {
    if (seen.has(e.productType)) continue;
    seen.add(e.productType);
    out.push(e);
    if (out.length >= 3) break;
  }
  return out;
}
