# Bricksplaza

South African e-commerce storefront for bricks, pavers, blocks and related masonry.

Product pages read the `products` table. The generated SKU list has been removed from the shop. `node scripts/seed-products.mjs` only reports how many rows are already loaded. Accounts, carts, orders and reviews use Postgres (PGLite in local preview when `DATABASE_URL` is unset, Supabase when it is set). Do not commit secrets or connection strings.

## Render

Production hosting is a [Render Blueprint](https://render.com/docs/infrastructure-as-code). `render.yaml` defines one Node web service in Frankfurt. It does not create a database — `DATABASE_URL` is the existing Supabase **session pooler** URI.

1. Push `main`.
2. In Render: New → Blueprint → this repository.
3. When prompted, set `DATABASE_URL` to the Supabase session pooler URI. `BETTER_AUTH_SECRET` is generated. Add `COMPANY_VAT_NUMBER` in the dashboard when Besbpo supplies it — the tax invoice prints it, and leaves the line blank until then.
4. The public URL is `RENDER_EXTERNAL_URL`. Set `BETTER_AUTH_URL` to a custom domain later if you add one.

`npm run build` applies `migrations/` and emits `.output/server/index.mjs`. The health check is `GET /healthz`. Card capture stays off until a merchant account exists. EFT is a reference the yard confirms. Email and password sign-in uses the same Postgres database.
