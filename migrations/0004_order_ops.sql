-- Orders can be placed before an account exists. Payment capture stays simulated
-- until a merchant account is connected. Stock moves with the order, not the payment.

alter table orders alter column user_id drop not null;
alter table orders add column if not exists payment_status text not null default 'simulated';
alter table orders add column if not exists stock_applied boolean not null default false;

alter table customers add column if not exists yard_role text not null default 'customer';

create table if not exists order_events (
  id serial primary key,
  order_id text not null,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_id_idx on order_events (order_id);
