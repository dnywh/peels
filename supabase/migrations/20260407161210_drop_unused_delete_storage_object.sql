-- Delete paths already go through trusted Edge Functions using a service-role client.
-- Remove the unused SQL helper so no privileged storage delete function remains exposed.
DROP FUNCTION IF EXISTS public.delete_storage_object(text, text);
