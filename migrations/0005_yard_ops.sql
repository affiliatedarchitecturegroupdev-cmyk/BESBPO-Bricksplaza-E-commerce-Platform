-- Yard operations that do not depend on a payment merchant.
-- EFT is a reference the yard confirms. Card capture stays simulated.

alter table orders add column if not exists payment_reference text;
alter table orders add column if not exists collection_slot text;

alter table returns add column if not exists qty integer not null default 1;
alter table returns add column if not exists decision_note text;

create table if not exists ad_schedule (
  slot_id text primary key,
  paused boolean not null default false,
  active_from text,
  active_to text,
  headline text,
  subtext text,
  cta_text text,
  cta_link text,
  updated_at timestamptz not null default now()
);

create table if not exists stock_events (
  id serial primary key,
  sku text not null,
  delta integer not null,
  reason text not null,
  user_id text,
  created_at timestamptz not null default now()
);
create index if not exists stock_events_sku_idx on stock_events (sku);
