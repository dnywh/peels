-- growth_tracking is internal analytics state, not a Data API surface.
-- Move the existing table and identity sequence without rewriting or deleting rows.

alter table if exists public.growth_tracking set schema private;
alter sequence if exists public.growth_tracking_id_seq set schema private;

revoke all privileges on table private.growth_tracking from anon, authenticated, public;
revoke all privileges on sequence private.growth_tracking_id_seq from anon, authenticated, public;

grant all privileges on table private.growth_tracking to service_role;
grant all privileges on sequence private.growth_tracking_id_seq to service_role;
