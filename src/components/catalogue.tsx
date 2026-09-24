import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "@/data/catalogue";

const CatalogueContext = createContext<Product[] | null>(null);

export function CatalogueProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  return <CatalogueContext.Provider value={products}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue() {
  const products = useContext(CatalogueContext);
  if (!products) throw new Error("Catalogue is not loaded");
  return products;
}
