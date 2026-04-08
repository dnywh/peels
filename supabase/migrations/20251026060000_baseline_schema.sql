-- Baseline public schema imported from the linked Peels project on 2026-04-07.
-- Generated via `supabase db dump --schema public`.

CREATE SCHEMA IF NOT EXISTS "extensions";

CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."color_source" AS ENUM (
    '99COLORS_NET',
    'ART_PAINTS_YG07S',
    'BYRNE',
    'CRAYOLA',
    'CMYK_COLOR_MODEL',
    'COLORCODE_IS',
    'COLORHEXA',
    'COLORXS',
    'CORNELL_UNIVERSITY',
    'COLUMBIA_UNIVERSITY',
    'DUKE_UNIVERSITY',
    'ENCYCOLORPEDIA_COM',
    'ETON_COLLEGE',
    'FANTETTI_AND_PETRACCHI',
    'FINDTHEDATA_COM',
    'FERRARIO_1919',
    'FEDERAL_STANDARD_595',
    'FLAG_OF_INDIA',
    'FLAG_OF_SOUTH_AFRICA',
    'GLAZEBROOK_AND_BALDRY',
    'GOOGLE',
    'HEXCOLOR_CO',
    'ISCC_NBS',
    'KELLY_MOORE',
    'MATTEL',
    'MAERZ_AND_PAUL',
    'MILK_PAINT',
    'MUNSELL_COLOR_WHEEL',
    'NATURAL_COLOR_SYSTEM',
    'PANTONE',
    'PLOCHERE',
    'POURPRE_COM',
    'RAL',
    'RESENE',
    'RGB_COLOR_MODEL',
    'THOM_POOLE',
    'UNIVERSITY_OF_ALABAMA',
    'UNIVERSITY_OF_CALIFORNIA_DAVIS',
    'UNIVERSITY_OF_CAMBRIDGE',
    'UNIVERSITY_OF_NORTH_CAROLINA',
    'UNIVERSITY_OF_TEXAS_AT_AUSTIN',
    'X11_WEB',
    'XONA_COM'
);


ALTER TYPE "public"."color_source" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_if_email_exists"("email_to_check" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.email = email_to_check
  );
END;
$$;


ALTER FUNCTION "public"."check_if_email_exists"("email_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_message_rate_limit"("_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$SELECT (
    SELECT count(*)
    FROM chat_messages
    WHERE sender_id = _user_id
    AND created_at >= now() - interval '1 hour'
  ) < 10;$$;


ALTER FUNCTION "public"."check_message_rate_limit"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_user_listings"("_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.listings WHERE owner_id = _user_id);
END;
$$;


ALTER FUNCTION "public"."count_user_listings"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_verified_users_with_listings"() RETURNS TABLE("verified_users" bigint, "listing_count" bigint, "host_count" bigint, "donor_count" bigint, "chat_thread_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT u.id) AS verified_users,
        COUNT(DISTINCT l.id) AS listing_count,
        COUNT(DISTINCT CASE WHEN l.id IS NOT NULL THEN u.id END) AS host_count,
        COUNT(DISTINCT CASE WHEN l.id IS NULL THEN u.id END) AS donor_count,
        COUNT(DISTINCT ct.id) AS chat_thread_count  -- Count of chat threads
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    LEFT JOIN public.listings l ON u.id = l.owner_id
    LEFT JOIN public.chat_threads ct ON (ct.initiator_id != p.id AND ct.owner_id != p.id)  -- Exclude chat threads with admin users
    WHERE u.confirmed_at IS NOT NULL  -- Check for verified users
      AND (p.is_admin IS NULL OR p.is_admin = FALSE)  -- Exclude admin users
      AND (l.is_stub IS NULL OR l.is_stub = FALSE);  -- Exclude stub listings
END;
$$;


ALTER FUNCTION "public"."count_verified_users_with_listings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_slug"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER := 0;
    success BOOLEAN := false;
BEGIN
    -- Keep trying until we get a unique ID
    WHILE NOT success LOOP
        -- Generate a 12-character random string
        result := '';
        FOR i IN 1..12 LOOP
            result := result || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
        END LOOP;
        
        -- Check if this slug already exists
        IF NOT EXISTS (SELECT 1 FROM listings WHERE slug = result) THEN
            success := true;
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_unique_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.profiles (
    id,
    first_name,
    is_newsletter_subscribed,
    http_referrer,
    utm_source,
    utm_medium,
    utm_campaign
  )
  values (
    new.id,
    (new.raw_user_meta_data->>'first_name')::text,
    (new.raw_user_meta_data->>'is_newsletter_subscribed')::boolean,
    (new.raw_user_meta_data->>'http_referrer')::text,
    (new.raw_user_meta_data->>'utm_source')::text,
    (new.raw_user_meta_data->>'utm_medium')::text,
    (new.raw_user_meta_data->>'utm_campaign')::text
  );
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."listings_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) RETURNS TABLE("id" bigint, "latitude" double precision, "longitude" double precision, "type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  return query
  select 
    l.id,
    ST_Y(l.location::geometry) as latitude,
    ST_X(l.location::geometry) as longitude,
    l.type
  from public.listings_public_data l
  where 
    -- Excluding listings with false visibility is handled in above view
    l.location && 
    ST_MakeEnvelope(
      min_long, 
      min_lat, 
      max_long, 
      max_lat, 
      4326
    );
end;$$;


ALTER FUNCTION "public"."listings_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_slug_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.slug := generate_unique_slug();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_slug_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_cleanup_orphaned_files"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
    file record;
begin
    -- Print out orphaned profile avatars
    raise notice 'Orphaned profile avatars:';
    for file in
        select name 
        from storage.objects 
        where bucket_id = 'avatars'
        and name not in (
            select avatar from profiles
            where avatar is not null
        )
    loop
        raise notice '%', file.name;  -- Print the file name instead of deleting
    end loop;

    -- Print out orphaned listing avatars
    raise notice 'Orphaned listing avatars:';
    for file in
        select name 
        from storage.objects 
        where bucket_id = 'listing_avatars'
        and name not in (
            select split_part(avatar, '/', -1) from listings
            where avatar is not null
        )
    loop
        raise notice '%', file.name;  -- Print the file name instead of deleting
    end loop;

    -- Print out orphaned listing photos
    raise notice 'Orphaned listing photos:';
    for file in
        select name 
        from storage.objects 
        where bucket_id = 'listing_photos'
        and name not in (
            select unnest(photos) from listings
            where photos is not null
        )
    loop
        raise notice '%', file.name;  -- Print the file name instead of deleting
    end loop;
end;$$;


ALTER FUNCTION "public"."test_cleanup_orphaned_files"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


COMMENT ON COLUMN "public"."chat_messages"."content" IS 'The message content.';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "avatar" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_admin" boolean DEFAULT false,
    "http_referrer" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "is_newsletter_subscribed" boolean DEFAULT false,
    "emailed_latest_issue" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."chat_messages_with_senders" WITH ("security_invoker"='on') AS
 SELECT "chat_messages"."id",
    "chat_messages"."created_at",
    "chat_messages"."thread_id",
    "chat_messages"."sender_id",
    "chat_messages"."content",
    "chat_messages"."read_at",
    "profiles"."first_name" AS "sender_first_name",
    "profiles"."avatar" AS "sender_avatar"
   FROM ("public"."chat_messages"
     JOIN "public"."profiles" ON (("chat_messages"."sender_id" = "profiles"."id")));


ALTER VIEW "public"."chat_messages_with_senders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_threads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "listing_id" bigint NOT NULL,
    "initiator_id" "uuid" NOT NULL,
    "owner_id" "uuid" NOT NULL
);


ALTER TABLE "public"."chat_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_id" "uuid",
    "name" "text",
    "description" "text",
    "location" "extensions"."geography" NOT NULL,
    "accepted_items" "text"[],
    "rejected_items" "text"[],
    "photos" "text"[],
    "links" "text"[],
    "visibility" boolean DEFAULT true,
    "type" "text",
    "avatar" "text",
    "slug" "text",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "country_code" "text",
    "area_name" "text",
    "is_stub" boolean DEFAULT false,
    CONSTRAINT "max_photos_per_listing" CHECK (("array_length"("photos", 1) <= 5))
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."listings"."slug" IS 'Autogenerated with the set_slug_on_insert() function, which calls generate_unique_slug(). Useful for URLs';



CREATE OR REPLACE VIEW "public"."chat_threads_with_participants" WITH ("security_invoker"='on') AS
 SELECT "chat_threads"."id",
    "chat_threads"."created_at",
    "chat_threads"."listing_id",
    "chat_threads"."initiator_id",
    "chat_threads"."owner_id",
    "initiator"."first_name" AS "initiator_first_name",
    "owner"."first_name" AS "owner_first_name",
    "listings"."slug" AS "listing_slug",
    "listings"."avatar" AS "listing_avatar",
    "listings"."name" AS "listing_name",
    "listings"."type" AS "listing_type",
    "listings"."area_name" AS "listing_area_name",
    "owner"."avatar" AS "owner_avatar",
    "initiator"."avatar" AS "initiator_avatar",
    ( SELECT ("count"(*) >= 2)
           FROM "public"."listings" "owner_listings"
          WHERE (("owner_listings"."owner_id" = "chat_threads"."owner_id") AND ("owner_listings"."type" = ANY (ARRAY['community'::"text", 'business'::"text"])))) AS "owner_has_multiple_non_residential_listings"
   FROM ((("public"."chat_threads"
     JOIN "public"."profiles" "initiator" ON (("chat_threads"."initiator_id" = "initiator"."id")))
     JOIN "public"."profiles" "owner" ON (("chat_threads"."owner_id" = "owner"."id")))
     JOIN "public"."listings" ON (("chat_threads"."listing_id" = "listings"."id")));


ALTER VIEW "public"."chat_threads_with_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."growth_tracking" (
    "id" bigint NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "verified_users" bigint,
    "listing_count" bigint,
    "host_count" bigint,
    "donor_count" bigint,
    "chat_thread_count" bigint
);


ALTER TABLE "public"."growth_tracking" OWNER TO "postgres";


ALTER TABLE "public"."growth_tracking" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."growth_tracking_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."listings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."listings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."listings_private_data" WITH ("security_invoker"='on') AS
 SELECT "listings"."id",
    "listings"."owner_id",
    "listings"."name",
    "listings"."description",
    "listings"."location",
    "listings"."accepted_items",
    "listings"."rejected_items",
    "listings"."photos",
    "listings"."links",
    "listings"."visibility",
    "listings"."type",
    "listings"."avatar",
    "listings"."slug",
    "listings"."latitude",
    "listings"."longitude",
    "listings"."country_code",
    "listings"."area_name",
    "listings"."is_stub",
    "profiles"."first_name" AS "owner_first_name",
    "profiles"."avatar" AS "owner_avatar",
    ( SELECT ("count"(*) >= 2)
           FROM "public"."listings" "owner_listings"
          WHERE (("owner_listings"."owner_id" = "listings"."owner_id") AND ("owner_listings"."type" = ANY (ARRAY['community'::"text", 'business'::"text"])))) AS "owner_has_multiple_non_residential_listings"
   FROM ("public"."listings"
     LEFT JOIN "public"."profiles" ON (("listings"."owner_id" = "profiles"."id")));


ALTER VIEW "public"."listings_private_data" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."listings_public_data" WITH ("security_invoker"='on') AS
 SELECT "id",
    "created_at",
    "name",
    "description",
    "location",
    "accepted_items",
    "rejected_items",
        CASE
            WHEN ("type" = ANY (ARRAY['business'::"text", 'community'::"text"])) THEN "photos"
            ELSE NULL::"text"[]
        END AS "photos",
    "links",
    "type",
    "avatar",
    "slug",
    "latitude",
    "longitude",
    "country_code",
    "area_name",
    "is_stub",
    ( SELECT ("count"(*) >= 2)
           FROM "public"."listings" "other_listings"
          WHERE (("other_listings"."owner_id" = "listings"."owner_id") AND ("other_listings"."type" = ANY (ARRAY['community'::"text", 'business'::"text"])))) AS "owner_has_multiple_non_residential_listings"
   FROM "public"."listings"
  WHERE ("visibility" = true);


ALTER VIEW "public"."listings_public_data" OWNER TO "postgres";


ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_listing_id_initiator_id_owner_id_key" UNIQUE ("listing_id", "initiator_id", "owner_id");



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."growth_tracking"
    ADD CONSTRAINT "growth_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "unique_slug" UNIQUE ("slug");



CREATE INDEX "listings_geo_index" ON "public"."listings" USING "gist" ("location");



CREATE OR REPLACE TRIGGER "trigger_set_slug" BEFORE INSERT ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."set_slug_on_insert"();



DROP TRIGGER IF EXISTS "webhook_new_chat_message" ON "public"."chat_messages";

DO $$
BEGIN
  -- Preview branches created via GitHub integration may not have the
  -- supabase_functions trigger helper available during migration replay.
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'supabase_functions'
      AND p.proname = 'http_request'
      AND pg_get_function_identity_arguments(p.oid) = ''
  ) THEN
    EXECUTE $trigger$
      CREATE TRIGGER "webhook_new_chat_message"
      AFTER INSERT ON "public"."chat_messages"
      FOR EACH ROW
      EXECUTE FUNCTION "supabase_functions"."http_request"(
        'http://kong:8000/functions/v1/send-email-for-new-chat-message',
        'POST',
        '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"}',
        '{}',
        '5000'
      )
    $trigger$;
  END IF;
END
$$;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_owner_id_fkey1" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view all active listings" ON "public"."listings" FOR SELECT USING (("visibility" = true));



CREATE POLICY "Anyone can view limited profile fields" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Limit non-admin users to 12 listings" ON "public"."listings" FOR INSERT TO "authenticated" WITH CHECK ((("public"."count_user_listings"("auth"."uid"()) < 12) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))));



CREATE POLICY "Only admins can create stub listings" ON "public"."listings" FOR INSERT TO "authenticated" WITH CHECK ((("is_stub" = false) OR (("is_stub" = true) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))))));



CREATE POLICY "Users can create messages in their threads with rate limit" ON "public"."chat_messages" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."chat_threads"
  WHERE (("chat_threads"."id" = "chat_messages"."thread_id") AND (("chat_threads"."initiator_id" = "auth"."uid"()) OR ("chat_threads"."owner_id" = "auth"."uid"()))))) AND "public"."check_message_rate_limit"("auth"."uid"()) AND ("content" IS NOT NULL) AND (TRIM(BOTH FROM "content") <> ''::"text")));



CREATE POLICY "Users can create threads they're involved in" ON "public"."chat_threads" FOR INSERT TO "authenticated" WITH CHECK (((("auth"."uid"() = "initiator_id") OR ("auth"."uid"() = "owner_id")) AND "public"."check_message_rate_limit"("auth"."uid"())));



CREATE POLICY "Users can delete their own listings" ON "public"."listings" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can mark received messages as read" ON "public"."chat_messages" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."chat_threads"
  WHERE (("chat_threads"."id" = "chat_messages"."thread_id") AND (("chat_threads"."initiator_id" = "auth"."uid"()) OR ("chat_threads"."owner_id" = "auth"."uid"()))))) AND ("sender_id" <> "auth"."uid"()))) WITH CHECK (("read_at" IS NOT NULL));



CREATE POLICY "Users can update their own listings" ON "public"."listings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view messages in their threads" ON "public"."chat_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."chat_threads"
  WHERE (("chat_threads"."id" = "chat_messages"."thread_id") AND (("chat_threads"."initiator_id" = "auth"."uid"()) OR ("chat_threads"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their own listings regardless of visibility" ON "public"."listings" FOR SELECT TO "authenticated" USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own threads" ON "public"."chat_threads" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "initiator_id") OR (( SELECT "auth"."uid"() AS "uid") = "owner_id")));



ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_threads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."growth_tracking" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_growth_tracking" ON "public"."growth_tracking" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."check_if_email_exists"("email_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_if_email_exists"("email_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_if_email_exists"("email_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_message_rate_limit"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_message_rate_limit"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_message_rate_limit"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."count_user_listings"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."count_user_listings"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_user_listings"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."count_verified_users_with_listings"() TO "anon";
GRANT ALL ON FUNCTION "public"."count_verified_users_with_listings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_verified_users_with_listings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."listings_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."listings_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."listings_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_slug_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_slug_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_slug_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_cleanup_orphaned_files"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_cleanup_orphaned_files"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_cleanup_orphaned_files"() TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages_with_senders" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages_with_senders" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages_with_senders" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads_with_participants" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads_with_participants" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads_with_participants" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."growth_tracking" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."growth_tracking" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."growth_tracking" TO "service_role";



GRANT ALL ON SEQUENCE "public"."growth_tracking_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."growth_tracking_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."growth_tracking_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."listings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."listings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."listings_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings_private_data" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings_private_data" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings_private_data" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings_public_data" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings_public_data" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."listings_public_data" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";

