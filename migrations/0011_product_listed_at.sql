alter table products add column if not exists listed_at timestamptz;

-- Postgres rejects a window function written directly in UPDATE (42P20).
-- Rank inside a derived table, then join back on the primary key.
update products as p
set listed_at = ranked.stamp
from (
  select sku,
    timestamp '2025-06-01 00:00:00+00'
      + (row_number() over (order by sku) * interval '1 minute') as stamp
  from products
) as ranked
where p.sku = ranked.sku
  and p.listed_at is null;

alter table products alter column listed_at set default now();
