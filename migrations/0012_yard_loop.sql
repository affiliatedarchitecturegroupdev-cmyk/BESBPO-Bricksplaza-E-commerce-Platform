create table if not exists outbound_mail (
  id serial primary key,
  kind text not null,
  to_email text not null,
  subject text not null,
  body text not null,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

alter table rfqs add column if not exists reply text;

-- Brochure figures that failed a consistency check must not stay on the shop as a size.
update brand_skus
set dimensions = null,
    mass_kg = null,
    units_per_m2 = null,
    units_per_pallet = null,
    spec_status = 'brochure_name_only',
    notes = case
      when notes ilike '%Size removed:%' then notes
      else rtrim(notes) || ' Size removed: the brochure reading was not consistent enough to publish.'
    end
where dimensions is not null
  and (
    notes ilike '%not physically consistent%'
    or notes ilike '%confirm before quoting%'
    or dimensions like '%98.5%'
    or dimensions like '%708%'
  );
