-- Spaces: top-level life areas (e.g. Work, Personal). Moves and Arcs can
-- belong to one Space. Each person creates their own; nothing is seeded.
-- Colour keys must match src/config/spaceColors.ts.

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null default 'slate'
    check (color in ('slate', 'sage', 'sky', 'lavender', 'sand', 'rose', 'teal', 'stone')),
  position integer not null default 0,
  archived boolean not null default false,
  source text not null default 'app' check (source in ('app', 'ai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index spaces_user_position_idx on public.spaces (user_id, position);

create trigger spaces_set_updated_at before update on public.spaces
  for each row execute function public.set_updated_at();

alter table public.spaces enable row level security;

create policy "Own spaces: select" on public.spaces for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own spaces: insert" on public.spaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own spaces: update" on public.spaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own spaces: delete" on public.spaces for delete to authenticated using ((select auth.uid()) = user_id);

-- Moves and Arcs can belong to one Space (cleared if the Space is deleted).
alter table public.moves add column space_id uuid references public.spaces (id) on delete set null;
alter table public.arcs add column space_id uuid references public.spaces (id) on delete set null;

create index moves_space_id_idx on public.moves (space_id);
create index arcs_space_id_idx on public.arcs (space_id);

-- Rule (mirrors effectiveSpaceId in src/features/spaces/spaceRules.ts):
-- a Move inside an Arc uses the Arc's Space. Also rejects a Space that
-- belongs to someone else. Runs for every writer: the app, or an AI.
create function public.moves_apply_space_rules() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.arc_id is not null then
    -- Join on spaces so a Space being deleted right now resolves to null.
    select a.space_id into new.space_id
    from public.arcs a
    join public.spaces s on s.id = a.space_id
    where a.id = new.arc_id;
  end if;

  if new.space_id is not null and not exists (
    select 1 from public.spaces s where s.id = new.space_id and s.user_id = new.user_id
  ) then
    raise exception 'Space % not found', new.space_id using errcode = 'foreign_key_violation';
  end if;

  return new;
end;
$$;

create trigger moves_apply_space_rules before insert or update of arc_id, space_id on public.moves
  for each row execute function public.moves_apply_space_rules();

-- When an Arc changes Space, its Moves follow.
create function public.arcs_propagate_space() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.space_id is not null and not exists (
    select 1 from public.spaces s where s.id = new.space_id and s.user_id = new.user_id
  ) then
    raise exception 'Space % not found', new.space_id using errcode = 'foreign_key_violation';
  end if;

  if tg_op = 'UPDATE' and new.space_id is distinct from old.space_id then
    update public.moves set space_id = new.space_id where arc_id = new.id;
  end if;

  return new;
end;
$$;

create trigger arcs_propagate_space after insert or update of space_id on public.arcs
  for each row execute function public.arcs_propagate_space();
