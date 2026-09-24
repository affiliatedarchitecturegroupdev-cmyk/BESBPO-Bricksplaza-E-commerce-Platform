import { useEffect, useState } from "react";
import type { Product } from "@/data/catalogue";
import { loadBySkus } from "@/lib/products";

/** Resolve a handful of SKUs (cart, wishlist, recently viewed) without shipping the whole catalogue. */
export function useProductsBySku(skus: string[]) {
  const key = skus.join("\n");
  const [state, setState] = useState<{ key: string; products: Product[] }>({ key: "", products: [] });

  useEffect(() => {
    if (!key) return;
    let cancel = false;
    loadBySkus({ data: { skus: key.split("\n") } })
      .then((rows) => {
        if (!cancel) setState({ key, products: rows });
      })
      .catch(() => {
        if (!cancel) setState({ key, products: [] });
      });
    return () => {
      cancel = true;
    };
  }, [key]);

  const ready = !key || state.key === key;
  return { products: state.key === key ? state.products : [], ready };
}
