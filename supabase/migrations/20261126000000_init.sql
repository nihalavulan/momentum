-- Momentum: initial schema. Every row belongs to one user; RLS keeps each
-- person's data private. `source` records whether the app or an AI wrote it.

create table public.arcs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  start_date date not null,
  end_date date not null,
  source text not null default 'app' check (source in ('app', 'ai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint arcs_dates_valid check (end_date >= start_date)
);

create table public.moves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  date date, -- null = no date yet
  done boolean not null default false,
  done_at timestamptz,
  arc_id uuid references public.arcs (id) on delete set null,
  source text not null default 'app' check (source in ('app', 'ai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint moves_done_at_matches check ((done and done_at is not null) or (not done and done_at is null))
);

create index moves_user_date_idx on public.moves (user_id, date);
create index moves_user_arc_idx on public.moves (user_id, arc_id);
create index arcs_user_idx on public.arcs (user_id);

-- Keep updated_at current on every change.
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger moves_set_updated_at before update on public.moves
  for each row execute function public.set_updated_at();
create trigger arcs_set_updated_at before update on public.arcs
  for each row execute function public.set_updated_at();

-- Row level security: a person can only see and change their own rows.
alter table public.moves enable row level security;
alter table public.arcs enable row level security;

create policy "Own moves: select" on public.moves for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own moves: insert" on public.moves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own moves: update" on public.moves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own moves: delete" on public.moves for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Own arcs: select" on public.arcs for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own arcs: insert" on public.arcs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own arcs: update" on public.arcs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own arcs: delete" on public.arcs for delete to authenticated using ((select auth.uid()) = user_id);
