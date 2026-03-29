-- ══════════════════════════════════════════════════════════════════════
-- HELM — Executive Home Assistant — Groceries, Appointments, Family Chat
-- ══════════════════════════════════════════════════════════════════════

-- ── GROCERY LISTS ───────────────────────────────────────────────────

create table public.helm_grocery_lists (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid references public.families(id) on delete cascade not null,
  name        text not null default 'Shopping List',
  store       text,                                        -- "PAK''nSAVE", "Countdown", etc.
  status      text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  due_date    date,
  assigned_to uuid references auth.users(id),
  created_by  uuid references auth.users(id) not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table public.helm_grocery_items (
  id          uuid primary key default gen_random_uuid(),
  list_id     uuid references public.helm_grocery_lists(id) on delete cascade not null,
  name        text not null,
  quantity    text default '1',                            -- "2", "500g", "1 bunch"
  category    text not null default 'other'
    check (category in ('produce', 'dairy', 'meat', 'bakery', 'pantry', 'frozen', 'drinks', 'household', 'health', 'baby', 'pet', 'other')),
  checked     boolean not null default false,
  checked_by  uuid references auth.users(id),
  note        text,
  sort_order  int not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── APPOINTMENTS / FAMILY CALENDAR ──────────────────────────────────

create table public.helm_appointments (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid references public.families(id) on delete cascade not null,
  title         text not null,                              -- "Max dentist", "Plumber visit"
  description   text,
  location      text,
  start_time    timestamptz not null,
  end_time      timestamptz,
  all_day       boolean not null default false,
  category      text not null default 'general'
    check (category in ('medical', 'school', 'sport', 'social', 'home', 'work', 'pet', 'general')),
  for_member    text,                                       -- child/family member name
  reminder_mins int default 60,                             -- minutes before to remind
  reminded      boolean not null default false,
  recurring     text                                        -- null, 'daily', 'weekly', 'fortnightly', 'monthly'
    check (recurring is null or recurring in ('daily', 'weekly', 'fortnightly', 'monthly')),
  status        text not null default 'upcoming'
    check (status in ('upcoming', 'confirmed', 'cancelled', 'completed')),
  booked_via    text,                                       -- 'app', 'sms', 'helm'
  created_by    uuid references auth.users(id) not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── FAMILY GROUP CHAT ───────────────────────────────────────────────

create table public.helm_family_chat (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid references public.families(id) on delete cascade not null,
  sender_id   uuid references auth.users(id),               -- null = HELM bot message
  sender_name text not null,                                 -- display name or "HELM"
  content     text not null,
  msg_type    text not null default 'text'
    check (msg_type in ('text', 'grocery_update', 'appointment_update', 'reminder', 'system')),
  metadata    jsonb default '{}',                            -- extra data (e.g., grocery list id, appt id)
  read_by     uuid[] default '{}',                           -- array of user IDs who've read it
  created_at  timestamptz default now()
);

-- ── FAMILY TASKS / TO-DO ────────────────────────────────────────────

create table public.helm_tasks (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid references public.families(id) on delete cascade not null,
  title       text not null,
  description text,
  assigned_to text,                                         -- family member name
  due_date    timestamptz,
  priority    text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  status      text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  category    text not null default 'general'
    check (category in ('chore', 'errand', 'school', 'admin', 'home', 'general')),
  created_by  uuid references auth.users(id) not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);


-- ══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════

alter table public.helm_grocery_lists enable row level security;
alter table public.helm_grocery_items enable row level security;
alter table public.helm_appointments enable row level security;
alter table public.helm_family_chat enable row level security;
alter table public.helm_tasks enable row level security;

-- Helper: check if current user is a family member
-- (may already exist from helm_sms migration, so use CREATE OR REPLACE)
create or replace function public.is_family_member(p_family_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.family_members
    where family_id = p_family_id
      and user_id = auth.uid()
  );
$$;

-- Policies for all HELM tables (family-scoped)
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'helm_grocery_lists', 'helm_appointments',
      'helm_family_chat', 'helm_tasks'
    ])
  loop
    execute format(
      'create policy "Family members can view %1$s" on public.%1$s for select using (public.is_family_member(family_id))',
      tbl
    );
    execute format(
      'create policy "Family members can insert %1$s" on public.%1$s for insert with check (public.is_family_member(family_id))',
      tbl
    );
    execute format(
      'create policy "Family members can update %1$s" on public.%1$s for update using (public.is_family_member(family_id))',
      tbl
    );
    execute format(
      'create policy "Family members can delete %1$s" on public.%1$s for delete using (public.is_family_member(family_id))',
      tbl
    );
  end loop;
end
$$;

-- Grocery items: access through list → family
create policy "Family can view grocery items"
  on public.helm_grocery_items for select
  using (exists (
    select 1 from public.helm_grocery_lists l
    where l.id = list_id and public.is_family_member(l.family_id)
  ));

create policy "Family can manage grocery items"
  on public.helm_grocery_items for all
  using (exists (
    select 1 from public.helm_grocery_lists l
    where l.id = list_id and public.is_family_member(l.family_id)
  ));


-- ══════════════════════════════════════════════════════════════════════
-- REALTIME
-- ══════════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table public.helm_grocery_items;
alter publication supabase_realtime add table public.helm_family_chat;
alter publication supabase_realtime add table public.helm_appointments;
alter publication supabase_realtime add table public.helm_tasks;


-- ══════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════

create index idx_helm_grocery_lists_family on public.helm_grocery_lists(family_id);
create index idx_helm_grocery_items_list on public.helm_grocery_items(list_id);
create index idx_helm_appointments_family on public.helm_appointments(family_id);
create index idx_helm_appointments_start on public.helm_appointments(start_time);
create index idx_helm_family_chat_family on public.helm_family_chat(family_id);
create index idx_helm_family_chat_created on public.helm_family_chat(created_at);
create index idx_helm_tasks_family on public.helm_tasks(family_id);


-- ══════════════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMPS
-- ══════════════════════════════════════════════════════════════════════

create trigger set_updated_at before update on public.helm_grocery_lists
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.helm_grocery_items
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.helm_appointments
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.helm_tasks
  for each row execute function public.handle_updated_at();
