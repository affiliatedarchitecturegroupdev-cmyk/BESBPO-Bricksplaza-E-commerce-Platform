alter table products add column if not exists listed_at timestamptz;

update products
set listed_at = timestamp '2025-06-01 00:00:00+00'
  + (row_number() over (order by sku) * interval '1 minute')
where listed_at is null;

alter table products alter column listed_at set default now();
