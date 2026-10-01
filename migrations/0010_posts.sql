create table if not exists posts (
  id serial primary key,
  slug text not null unique,
  title text not null,
  tag text not null,
  excerpt text not null,
  body text not null,
  cover_type text not null,
  cover bytea not null,
  skus text not null default '',
  status text not null default 'draft',
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_idx on posts (status, published_at desc);
