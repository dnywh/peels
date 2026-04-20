-- Tighten chat abuse controls: cap new threads per initiator per hour, keep message cap,
-- and enforce profile first-name rules at the database for direct API bypasses.

CREATE OR REPLACE FUNCTION public.check_message_rate_limit("_user_id" uuid) RETURNS boolean
    LANGUAGE "sql"
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $$SELECT (
    SELECT count(*)::integer
    FROM public.chat_messages
    WHERE chat_messages.sender_id = _user_id
      AND chat_messages.created_at >= now() - interval '1 hour'
  ) < 10$$;


ALTER FUNCTION public.check_message_rate_limit(uuid) OWNER TO postgres;


CREATE OR REPLACE FUNCTION public.check_thread_initiation_rate_limit("_user_id" uuid) RETURNS boolean
    LANGUAGE "sql"
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $$SELECT (
    SELECT count(*)::integer
    FROM public.chat_threads
    WHERE chat_threads.initiator_id = _user_id
      AND chat_threads.created_at >= now() - interval '1 hour'
  ) < 6$$;


ALTER FUNCTION public.check_thread_initiation_rate_limit(uuid) OWNER TO postgres;


GRANT ALL ON FUNCTION public.check_thread_initiation_rate_limit(uuid) TO anon;
GRANT ALL ON FUNCTION public.check_thread_initiation_rate_limit(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.check_thread_initiation_rate_limit(uuid) TO service_role;


DROP POLICY IF EXISTS "Users can create threads they're involved in" ON public.chat_threads;

CREATE POLICY "Users can create threads they're involved in" ON public.chat_threads
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = initiator_id
    AND public.check_message_rate_limit(auth.uid())
    AND public.check_thread_initiation_rate_limit(auth.uid())
  );


CREATE OR REPLACE FUNCTION public.enforce_profile_first_name_rules() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  v text;
  v_lower text;
BEGIN
  IF NEW.first_name IS NULL THEN
    RETURN NEW;
  END IF;

  v := trim(both FROM NEW.first_name);
  NEW.first_name := v;

  IF length(v) < 2 OR length(v) > 24 THEN
    RAISE EXCEPTION 'First name must be between 2 and 24 characters.'
      USING ERRCODE = '23514';
  END IF;

  v_lower := lower(v);

  IF v ~ '[0-9]' THEN
    RAISE EXCEPTION 'First name cannot include numbers.'
      USING ERRCODE = '23514';
  END IF;

  IF v ~ '[@#]' OR v ~* 'www\.' OR v ~* 'https?://' THEN
    RAISE EXCEPTION 'First name contains characters that are not allowed.'
      USING ERRCODE = '23514';
  END IF;

  IF v_lower ~ '\.(com|org|net|io|app)([[:space:]]|$)' THEN
    RAISE EXCEPTION 'First name contains characters that are not allowed.'
      USING ERRCODE = '23514';
  END IF;

  IF v_lower ~ 'p[e3]els|pe[e3]ls|pe[e3]l[s5]' THEN
    RAISE EXCEPTION 'This first name is reserved.'
      USING ERRCODE = '23514';
  END IF;

  IF v_lower = 'peels' OR v_lower LIKE 'peels %' OR v_lower LIKE 'peels-%' OR v_lower LIKE 'peels.%' THEN
    RAISE EXCEPTION 'This first name is reserved.'
      USING ERRCODE = '23514';
  END IF;

  IF v_lower ~ '(^|[[:space:]])peels($|[[:space:].-])' THEN
    RAISE EXCEPTION 'This first name is reserved.'
      USING ERRCODE = '23514';
  END IF;

  IF v_lower IN (
    'support',
    'admin',
    'administrator',
    'moderator',
    'team',
    'official',
    'staff',
    'helpdesk',
    'help',
    'trust',
    'safety',
    'security',
    'system',
    'service',
    'root',
    'moderation'
  ) OR v_lower LIKE '%peels support%' OR v_lower LIKE '%peels team%' OR v_lower LIKE '%customer service%' THEN
    RAISE EXCEPTION 'This first name is reserved.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.enforce_profile_first_name_rules() OWNER TO postgres;


DROP TRIGGER IF EXISTS trigger_enforce_profile_first_name_rules ON public.profiles;

CREATE TRIGGER trigger_enforce_profile_first_name_rules
  BEFORE INSERT OR UPDATE OF first_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_first_name_rules();
