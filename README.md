# Bricksplaza

South African e-commerce storefront for bricks, pavers, blocks and related masonry.

The 2,044-SKU catalogue is generated in the app and can be loaded into the `products` table with `node scripts/seed-products.mjs` when `DATABASE_URL` is set. Accounts, carts, orders and reviews use Postgres (PGLite in local preview, Supabase when `DATABASE_URL` is set). Do not commit secrets or connection strings.
