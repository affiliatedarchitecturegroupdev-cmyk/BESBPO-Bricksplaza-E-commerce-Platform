create table if not exists products (
  sku text primary key,
  category_slug text not null,
  category text not null,
  family text not null,
  product_type text not null,
  product_name text not null,
  colour_finish text not null,
  colour_hex text not null,
  size_mm text not null,
  thickness_mm text not null,
  length_mm integer not null,
  width_mm integer not null,
  unit_of_sale text not null,
  applicable_standard text not null,
  duty_load_class text not null,
  sectors_served text[] not null,
  fulfilment_type text not null,
  unit_cost numeric not null,
  retail_price numeric not null,
  trade_price numeric not null,
  volume_price numeric not null,
  coverage_per_m2 numeric,
  rating numeric not null,
  review_count integer not null,
  stock integer not null,
  is_new boolean not null,
  is_clearance boolean not null,
  is_trending boolean not null,
  is_best_seller boolean not null,
  weight_kg numeric not null,
  units_per_pallet integer not null,
  description text not null
);

create index if not exists products_category_slug_idx on products (category_slug);
create index if not exists products_colour_finish_idx on products (colour_finish);
create index if not exists products_flags_idx on products (is_new, is_clearance, is_trending, is_best_seller);
