-- Match Supabase's new Data API exposure model for future objects created by
-- postgres in public. Existing grants are unchanged; future access to tables,
-- sequences, and functions must opt in with explicit grants in the migration
-- that creates them.

alter default privileges for role postgres in schema public
  revoke all on tables from service_role;

alter default privileges for role postgres in schema public
  revoke all on sequences from service_role;

alter default privileges for role postgres in schema public
  revoke all on functions from service_role;

comment on table public.pending_media_uploads is
  'Server-owned temporary media state. Client roles are intentionally denied; trusted server-side code uses explicit service-role grants.';

comment on table private.growth_tracking is
  'Internal analytics state outside the Data API surface. Client roles are intentionally denied; trusted server-side code uses explicit service-role grants.';
