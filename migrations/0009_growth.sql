create table if not exists ad_events (
  id bigserial primary key,
  slot_id text not null,
  event text not null,
  path text,
  created_at timestamptz not null default now()
);
create index if not exists ad_events_slot_idx on ad_events (slot_id, event);

create table if not exists enquiries (
  id serial primary key,
  kind text not null,
  role text,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create index if not exists enquiries_kind_idx on enquiries (kind, status);
