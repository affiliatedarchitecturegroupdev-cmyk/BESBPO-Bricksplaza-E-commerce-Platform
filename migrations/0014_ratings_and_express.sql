-- Real stars and written reviews. Catalogue scores start at zero.
-- AA 60/120 Express is a R1 000 fee on top of a quoted delivery, from a supplier pin within 30 km.

create table if not exists product_stars (
  user_id text not null,
  sku text not null,
  stars integer not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, sku)
);
create index if not exists product_stars_sku_idx on product_stars (sku);

delete from reviews;
update products set rating = 0, review_count = 0;

create unique index if not exists reviews_user_sku_uidx on reviews (user_id, sku);

create table if not exists express_suppliers (
  id serial primary key,
  name text not null,
  kind text not null default 'partner',
  city text not null,
  province text not null,
  lat double precision not null,
  lng double precision not null,
  active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now()
);

insert into express_suppliers (name, kind, city, province, lat, lng, notes)
select 'Midrand Distribution Yard', 'yard', 'Midrand', 'Gauteng', -25.989, 28.127, 'Bricksplaza yard. Partner pins are added from the desk when a supplier can prepare a load in 20 minutes.'
where not exists (select 1 from express_suppliers where name = 'Midrand Distribution Yard');

insert into express_suppliers (name, kind, city, province, lat, lng, notes)
select 'Cato Ridge Distribution Yard', 'yard', 'Cato Ridge', 'KwaZulu-Natal', -29.742, 30.601, 'Bricksplaza yard on the N3.'
where not exists (select 1 from express_suppliers where name = 'Cato Ridge Distribution Yard');

alter table orders add column if not exists express_fee numeric not null default 0;
alter table orders add column if not exists express_status text;
alter table orders add column if not exists express_supplier_id integer;
alter table orders add column if not exists express_supplier_name text;
alter table orders add column if not exists express_distance_km numeric;
alter table orders add column if not exists express_place text;
alter table orders add column if not exists express_lat double precision;
alter table orders add column if not exists express_lng double precision;
alter table orders add column if not exists express_confirmed_at timestamptz;
alter table orders add column if not exists express_delivered_at timestamptz;
