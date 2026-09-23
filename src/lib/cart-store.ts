import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = { sku: string; qty: number };

type CartState = {
  lines: CartLine[];
  add: (sku: string, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  replace: (lines: CartLine[]) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (sku, qty = 1) => {
        const lines = [...get().lines];
        const i = lines.findIndex((l) => l.sku === sku);
        if (i >= 0) lines[i] = { sku, qty: lines[i]!.qty + qty };
        else lines.push({ sku, qty });
        set({ lines });
      },
      setQty: (sku, qty) => {
        if (qty <= 0) set({ lines: get().lines.filter((l) => l.sku !== sku) });
        else
          set({
            lines: get().lines.map((l) => (l.sku === sku ? { sku, qty } : l)),
          });
      },
      remove: (sku) => set({ lines: get().lines.filter((l) => l.sku !== sku) }),
      clear: () => set({ lines: [] }),
      replace: (lines) => set({ lines }),
    }),
    { name: "bp-cart" },
  ),
);

export const useViewed = create<{ skus: string[]; push: (sku: string) => void }>()(
  persist(
    (set, get) => ({
      skus: [],
      push: (sku) => {
        const next = [sku, ...get().skus.filter((s) => s !== sku)].slice(0, 16);
        set({ skus: next });
      },
    }),
    { name: "bp-viewed" },
  ),
);

export const useWishlistLocal = create<{
  skus: string[];
  toggle: (sku: string) => void;
  has: (sku: string) => boolean;
}>()(
  persist(
    (set, get) => ({
      skus: [],
      toggle: (sku) => {
        const has = get().skus.includes(sku);
        set({ skus: has ? get().skus.filter((s) => s !== sku) : [...get().skus, sku] });
      },
      has: (sku) => get().skus.includes(sku),
    }),
    { name: "bp-wish" },
  ),
);
