-- Environments that already applied 20260420120000 before we assigned back to NEW.first_name
-- get the same trigger body; new installs get it from the original migration, this is idempotent.

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
