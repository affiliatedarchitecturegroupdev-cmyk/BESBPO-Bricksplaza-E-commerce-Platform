create table if not exists customers (
  user_id text primary key,
  display_name text,
  company text,
  vat_number text,
  phone text,
  tier text not null default 'retail',
  credit_limit numeric not null default 0,
  float_balance numeric not null default 0,
  trade_status text not null default 'none',
  trade_terms text,
  created_at timestamptz not null default now()
);

create table if not exists addresses (
  id serial primary key,
  user_id text not null,
  label text not null default 'Delivery',
  recipient text,
  line1 text not null,
  line2 text,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean not null default false
);
create index if not exists addresses_user_id_idx on addresses (user_id);

create table if not exists cart_items (
  user_id text not null,
  sku text not null,
  qty integer not null,
  primary key (user_id, sku)
);

create table if not exists wishlists (
  user_id text not null,
  sku text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, sku)
);

create table if not exists orders (
  id text primary key,
  user_id text not null,
  status text not null,
  email text,
  phone text,
  delivery_method text not null,
  address_json text not null,
  payment_method text not null,
  subtotal numeric not null,
  delivery_fee numeric not null,
  vat numeric not null,
  total numeric not null,
  tier text not null,
  carrier text,
  tracking_ref text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_id_idx on orders (user_id);

create table if not exists order_lines (
  id serial primary key,
  order_id text not null,
  sku text not null,
  name text not null,
  qty integer not null,
  unit_price numeric not null,
  fulfilment text not null
);
create index if not exists order_lines_order_id_idx on order_lines (order_id);

create table if not exists reviews (
  id serial primary key,
  user_id text not null,
  sku text not null,
  rating integer not null,
  title text,
  body text not null,
  verified boolean not null default false,
  helpful integer not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now()
);
create index if not exists reviews_sku_idx on reviews (sku);

create table if not exists questions (
  id serial primary key,
  user_id text not null,
  sku text not null,
  body text not null,
  answer text,
  answered_by text,
  created_at timestamptz not null default now()
);
create index if not exists questions_sku_idx on questions (sku);

create table if not exists rfqs (
  id serial primary key,
  user_id text not null,
  name text not null,
  email text not null,
  company text,
  phone text,
  province text,
  message text not null,
  sku_list text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists rfqs_user_id_idx on rfqs (user_id);

create table if not exists returns (
  id serial primary key,
  user_id text not null,
  order_id text not null,
  sku text,
  reason text not null,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);
create index if not exists returns_user_id_idx on returns (user_id);

create table if not exists recently_viewed (
  user_id text not null,
  sku text not null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, sku)
);
