create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  color text,
  priority smallint not null default 3,
  weekly_target_minutes integer,
  exam_date date,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_name_length check (char_length(btrim(name)) between 1 and 100),
  constraint subjects_color_hex check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint subjects_priority_range check (priority between 1 and 5),
  constraint subjects_weekly_target_range check (weekly_target_minutes is null or weekly_target_minutes between 1 and 10080)
  , constraint subjects_id_user_unique unique (id, user_id)
);

create index subjects_user_active_idx on public.subjects (user_id, is_archived, name);
alter table public.subjects enable row level security;
revoke all on public.subjects from anon;
grant select, insert, update, delete on public.subjects to authenticated;
create policy "Users can view own subjects" on public.subjects for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create own subjects" on public.subjects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own subjects" on public.subjects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own subjects" on public.subjects for delete to authenticated using ((select auth.uid()) = user_id);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'not_started',
  is_difficult boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint topics_status_valid check (status in ('not_started', 'in_progress', 'completed', 'needs_revision')),
  constraint topics_position_nonnegative check (position >= 0),
  constraint topics_subject_user_unique unique (id, subject_id, user_id),
  constraint topics_subject_owner_fk foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete cascade
);

create index topics_subject_order_idx on public.topics (subject_id, position, created_at);
create index topics_user_id_idx on public.topics (user_id);
alter table public.topics enable row level security;
revoke all on public.topics from anon;
grant select, insert, update, delete on public.topics to authenticated;
create policy "Users can view own topics" on public.topics for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create own topics" on public.topics for insert to authenticated with check (
  (select auth.uid()) = user_id and exists (select 1 from public.subjects s where s.id = subject_id and s.user_id = (select auth.uid()))
);
create policy "Users can update own topics" on public.topics for update to authenticated using ((select auth.uid()) = user_id) with check (
  (select auth.uid()) = user_id and exists (select 1 from public.subjects s where s.id = subject_id and s.user_id = (select auth.uid()))
);
create policy "Users can delete own topics" on public.topics for delete to authenticated using ((select auth.uid()) = user_id);

create trigger subjects_updated_at before update on public.subjects for each row execute function public.set_profile_updated_at();
create trigger topics_updated_at before update on public.topics for each row execute function public.set_profile_updated_at();
