-- Public contact form. The yard reads these on /desk/inbox.
create table if not exists contacts (
  id serial primary key,
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists contacts_status_idx on contacts (status);
