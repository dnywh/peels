-- Only the donor/initiator may insert a chat thread (matches ChatWindow.initializeChat).
-- Previously, owner_id inserts satisfied (auth.uid() <> initiator_id OR rate_limit) without
-- evaluating the thread-initiation limit. Initiator-only insert applies that limit to everyone
-- who can create a thread.
--
-- Hygiene: 20260420120000 was updated in Git to the same policy, so a full local `db reset` runs
-- this twice in spirit (idempotent). This file still matters for any database that had already
-- applied an older version of 20260420120000 before that edit (e.g. preview/prod). Safe to keep.

DROP POLICY IF EXISTS "Users can create threads they're involved in" ON public.chat_threads;

CREATE POLICY "Users can create threads they're involved in" ON public.chat_threads
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = initiator_id
    AND public.check_message_rate_limit(auth.uid())
    AND public.check_thread_initiation_rate_limit(auth.uid())
  );
