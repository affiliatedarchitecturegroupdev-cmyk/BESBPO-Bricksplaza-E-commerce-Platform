import { createServerFn } from "@tanstack/react-start";

/** Guest-visible catalogue. No auth middleware: product rows are not per-user data. */
export const loadCatalogue = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchProducts } = await import("./products.server");
  return fetchProducts();
});
