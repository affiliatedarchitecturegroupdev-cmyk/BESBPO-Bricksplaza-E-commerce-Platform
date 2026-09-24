# Bricksplaza

South African e-commerce storefront for bricks, pavers, blocks and related masonry.

Product pages read the `products` table. The generated SKU list has been removed from the shop. `node scripts/seed-products.mjs` only reports how many rows are already loaded. Accounts, carts, orders and reviews use Postgres (PGLite in local preview when `DATABASE_URL` is unset, Supabase when it is set). Do not commit secrets or connection strings.
