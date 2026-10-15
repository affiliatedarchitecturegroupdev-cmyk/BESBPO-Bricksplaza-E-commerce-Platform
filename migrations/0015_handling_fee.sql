alter table returns add column if not exists fault text not null default 'customer';
alter table returns add column if not exists handling_rate numeric;
alter table returns add column if not exists handling_fee numeric not null default 0;
alter table returns add column if not exists paid_total numeric;
