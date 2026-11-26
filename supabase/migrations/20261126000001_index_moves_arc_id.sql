-- Covers the moves.arc_id foreign key (used when an Arc is deleted: ON DELETE SET NULL).
create index moves_arc_id_idx on public.moves (arc_id);
