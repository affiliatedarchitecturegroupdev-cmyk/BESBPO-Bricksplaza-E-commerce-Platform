import type { Product } from "@/data/catalogue";
import type { CustomerTier } from "@/data/taxonomy";
import { TIER_DISCOUNT } from "@/data/taxonomy";
import { round2 } from "./format";

export function priceFor(product: Product, tier: CustomerTier) {
  if (tier === "volume") return product.volumePrice;
  if (tier === "trade") return product.tradePrice;
  return product.retailPrice;
}

export function lineTotal(product: Product, qty: number, tier: CustomerTier) {
  return round2(priceFor(product, tier) * qty);
}

export function discountLabel(tier: CustomerTier) {
  const d = TIER_DISCOUNT[tier];
  return d === 0 ? null : `${Math.round(d * 100)}% off list`;
}
