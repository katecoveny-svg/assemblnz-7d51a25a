-- ══════════════════════════════════════════════════════════════════════
-- VOYAGE — Assembl Travel Agent — Supabase Schema
--
-- Run this as a Supabase migration. All tables use RLS so only
-- trip members can access their own data.
-- ══════════════════════════════════════════════════════════════════════

-- ── TRIP PLANS (master record) ───────────────────────────────────────

create table public.trip_plans (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid references auth.users(id) not null,
  name          text not null,                          -- "European Grand Tour"
  travelers     text[] not null default '{}',           -- {"Kate", "Adrian"}
  currency      text not null default 'NZD',
  exchange_rate numeric(6,4) not null default 1.85,     -- EUR → local
  departure_date date not null,
  return_date    date not null,
  status        text not null default 'planning'        -- planning | active | completed
    check (status in ('planning', 'active', 'completed')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── TRIP MEMBERS (who can access this trip) ──────────────────────────

create table public.trip_members (
  id        uuid primary key default gen_random_uuid(),
  trip_id   uuid references public.trip_plans(id) on delete cascade not null,
  user_id   uuid references auth.users(id) not null,
  role      text not null default 'traveler'            -- owner | traveler | viewer
    check (role in ('owner', 'traveler', 'viewer')),
  display_name text not null,
  created_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- ── DESTINATIONS ─────────────────────────────────────────────────────

create table public.trip_destinations (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references public.trip_plans(id) on delete cascade not null,
  name        text not null,                            -- "Barcelona"
  color       text not null default '#00FF88',          -- hex accent colour
  dates_label text,                                     -- "15–18 Jun"
  nights      int not null default 1,
  sort_order  int not null default 0,
  lat         numeric(10,6),
  lng         numeric(10,6),
  created_at  timestamptz default now()
);

-- ── DAYS ─────────────────────────────────────────────────────────────

create table public.trip_days (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid references public.trip_plans(id) on delete cascade not null,
  destination_id  uuid references public.trip_destinations(id) on delete cascade,
  day_date        date not null,
  weekday         text,                                 -- "Mon"
  title           text not null,                        -- "Gaudí & Beaches"
  stay            text,                                 -- "Hotel Arts"
  sort_order      int not null default 0,
  created_at      timestamptz default now()
);

-- ── ACTIVITIES ───────────────────────────────────────────────────────

create table public.trip_activities (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references public.trip_plans(id) on delete cascade not null,
  day_id      uuid references public.trip_days(id) on delete cascade not null,
  name        text not null,                            -- "Sagrada Familia"
  cost_eur    numeric(10,2) not null default 0,
  type        text not null default 'free'
    check (type in ('free', 'ticket', 'food', 'experience', 'transport')),
  booked      boolean not null default false,
  urgent      boolean not null default false,
  link        text,                                     -- booking URL
  note        text,                                     -- tips, warnings
  map_url     text,                                     -- Google Maps link
  sort_order  int not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── ACCOMMODATION ────────────────────────────────────────────────────

create table public.trip_accommodation (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid references public.trip_plans(id) on delete cascade not null,
  destination_id  uuid references public.trip_destinations(id) on delete cascade not null,
  check_in        date not null,
  check_out       date not null,
  nights          int not null,
  status          text not null default 'needed'
    check (status in ('needed', 'selected', 'booked', 'confirmed')),
  selected_option text,                                 -- name of selected hotel
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table public.trip_accommodation_options (
  id                uuid primary key default gen_random_uuid(),
  accommodation_id  uuid references public.trip_accommodation(id) on delete cascade not null,
  name              text not null,                      -- "Hotel Arts Barcelona"
  tier              text not null default 'mid'
    check (tier in ('budget', 'mid', 'luxury')),
  price_per_night   numeric(10,2) not null,             -- in trip currency
  local_price       numeric(10,2),                      -- in local currency (EUR)
  stars             int default 0,
  perks             text[] default '{}',                -- {"Beachfront", "Pool"}
  site_url          text,
  sort_order        int not null default 0,
  created_at        timestamptz default now()
);

-- ── PACKING ──────────────────────────────────────────────────────────

create table public.trip_packing_categories (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references public.trip_plans(id) on delete cascade not null,
  label       text not null,                            -- "Clothes"
  sort_order  int not null default 0,
  created_at  timestamptz default now()
);

create table public.trip_packing_items (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.trip_packing_categories(id) on delete cascade not null,
  name        text not null,
  checked     boolean not null default false,
  checked_by  uuid references auth.users(id),
  sort_order  int not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── EXPENSES ─────────────────────────────────────────────────────────

create table public.trip_expenses (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid references public.trip_plans(id) on delete cascade not null,
  description   text not null,
  amount_eur    numeric(10,2) not null,
  category      text not null default 'other'
    check (category in ('accommodation', 'transport', 'food', 'activities', 'shopping', 'other')),
  paid_by       text not null,                          -- traveler name from trip_plans.travelers
  expense_date  date not null default current_date,
  created_by    uuid references auth.users(id) not null,
  created_at    timestamptz default now()
);

-- ── NOTES ────────────────────────────────────────────────────────────

create table public.trip_notes (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references public.trip_plans(id) on delete cascade not null,
  day_id      uuid references public.trip_days(id) on delete set null,  -- null = general note
  content     text not null,
  created_by  uuid references auth.users(id) not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);


-- ══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════

alter table public.trip_plans enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_destinations enable row level security;
alter table public.trip_days enable row level security;
alter table public.trip_activities enable row level security;
alter table public.trip_accommodation enable row level security;
alter table public.trip_accommodation_options enable row level security;
alter table public.trip_packing_categories enable row level security;
alter table public.trip_packing_items enable row level security;
alter table public.trip_expenses enable row level security;
alter table public.trip_notes enable row level security;

-- Helper: check if current user is a member of a trip
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
  );
$$;

-- ── POLICIES ─────────────────────────────────────────────────────────

-- trip_plans: members can read, owner can update
create policy "Members can view their trips"
  on public.trip_plans for select
  using (public.is_trip_member(id));

create policy "Owner can update trip"
  on public.trip_plans for update
  using (created_by = auth.uid());

create policy "Authenticated users can create trips"
  on public.trip_plans for insert
  with check (auth.uid() = created_by);

-- trip_members: members can see co-members
create policy "Members can view trip members"
  on public.trip_members for select
  using (public.is_trip_member(trip_id));

create policy "Owner can manage members"
  on public.trip_members for all
  using (
    exists (
      select 1 from public.trip_members m
      where m.trip_id = trip_members.trip_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- All child tables: trip members can read/write
-- (Using a macro pattern for brevity)

do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'trip_destinations', 'trip_days', 'trip_activities',
      'trip_accommodation', 'trip_packing_categories',
      'trip_expenses', 'trip_notes'
    ])
  loop
    execute format(
      'create policy "Members can view %1$s" on public.%1$s for select using (public.is_trip_member(trip_id))',
      tbl
    );
    execute format(
      'create policy "Members can insert %1$s" on public.%1$s for insert with check (public.is_trip_member(trip_id))',
      tbl
    );
    execute format(
      'create policy "Members can update %1$s" on public.%1$s for update using (public.is_trip_member(trip_id))',
      tbl
    );
    execute format(
      'create policy "Members can delete %1$s" on public.%1$s for delete using (public.is_trip_member(trip_id))',
      tbl
    );
  end loop;
end
$$;

-- Accommodation options and packing items need join-through policies
create policy "Members can view accommodation options"
  on public.trip_accommodation_options for select
  using (
    exists (
      select 1 from public.trip_accommodation a
      where a.id = accommodation_id
        and public.is_trip_member(a.trip_id)
    )
  );

create policy "Members can manage accommodation options"
  on public.trip_accommodation_options for all
  using (
    exists (
      select 1 from public.trip_accommodation a
      where a.id = accommodation_id
        and public.is_trip_member(a.trip_id)
    )
  );

create policy "Members can view packing items"
  on public.trip_packing_items for select
  using (
    exists (
      select 1 from public.trip_packing_categories c
      where c.id = category_id
        and public.is_trip_member(c.trip_id)
    )
  );

create policy "Members can manage packing items"
  on public.trip_packing_items for all
  using (
    exists (
      select 1 from public.trip_packing_categories c
      where c.id = category_id
        and public.is_trip_member(c.trip_id)
    )
  );


-- ══════════════════════════════════════════════════════════════════════
-- REALTIME SUBSCRIPTIONS
-- ══════════════════════════════════════════════════════════════════════

-- Enable realtime for tables that need live sync between travelers
alter publication supabase_realtime add table public.trip_activities;
alter publication supabase_realtime add table public.trip_accommodation;
alter publication supabase_realtime add table public.trip_packing_items;
alter publication supabase_realtime add table public.trip_expenses;
alter publication supabase_realtime add table public.trip_notes;


-- ══════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════

create index idx_trip_members_trip on public.trip_members(trip_id);
create index idx_trip_members_user on public.trip_members(user_id);
create index idx_trip_destinations_trip on public.trip_destinations(trip_id);
create index idx_trip_days_trip on public.trip_days(trip_id);
create index idx_trip_activities_day on public.trip_activities(day_id);
create index idx_trip_activities_trip on public.trip_activities(trip_id);
create index idx_trip_accommodation_trip on public.trip_accommodation(trip_id);
create index idx_trip_expenses_trip on public.trip_expenses(trip_id);
create index idx_trip_notes_trip on public.trip_notes(trip_id);


-- ══════════════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMPS
-- ══════════════════════════════════════════════════════════════════════

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.trip_plans
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.trip_activities
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.trip_accommodation
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.trip_packing_items
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.trip_notes
  for each row execute function public.handle_updated_at();
