

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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_party_owners_auth_id"("party_uuid" "uuid") RETURNS TABLE("auth_user_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT u.auth_user_id 
  FROM parties p
  JOIN users u ON p.user_id = u.id
  WHERE p.id = party_uuid;
END;
$$;


ALTER FUNCTION "public"."get_party_owners_auth_id"("party_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_abandoned_sessions"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    UPDATE public.party_tracking
    SET status = 'abandoned'
    WHERE status IN ('browsing', 'checkout')
      AND last_activity < NOW() - INTERVAL '30 minutes'
      AND status != 'abandoned';
  END;
  $$;


ALTER FUNCTION "public"."mark_abandoned_sessions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sanitize_supplier_data"("supplier_data" "jsonb", "supplier_auth_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  IF auth.uid() = supplier_auth_user_id THEN
    RETURN supplier_data;
  END IF;
  
  -- Strip ALL sensitive fields including Outlook
  RETURN supplier_data - 'googleCalendarSync' 
                        - 'outlookCalendarSync'
                        - 'outlookTokens'
                        - 'notifications' 
                        - 'accessToken'
                        - 'refreshToken'
                        - 'verification'
                        - 'termsAcceptance'
                        || jsonb_build_object(
                          'owner', jsonb_build_object(
                            'name', supplier_data->'owner'->>'name'
                          )
                        );
END;
$$;


ALTER FUNCTION "public"."sanitize_supplier_data"("supplier_data" "jsonb", "supplier_auth_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "permissions" "text"[] DEFAULT ARRAY['verification_review'::"text"],
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "notes" "text",
    "last_active" timestamp with time zone
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "legacy_id" "text",
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "auth_user_id" "uuid",
    "business_type" character varying(20) DEFAULT 'primary'::character varying,
    "is_primary" boolean DEFAULT true,
    "parent_business_id" "uuid",
    "created_from_theme" character varying(50),
    "business_slug" character varying(100),
    "business_name" character varying(255),
    "is_active" boolean DEFAULT true,
    "fcm_token" "text",
    "last_token_update" timestamp without time zone,
    "profile_status" character varying(20) DEFAULT 'draft'::character varying,
    "profile_completion_percentage" integer DEFAULT 0,
    "can_go_live" boolean DEFAULT false,
    "went_live_at" timestamp without time zone,
    CONSTRAINT "chk_business_type" CHECK ((("business_type")::"text" = ANY ((ARRAY['primary'::character varying, 'themed'::character varying])::"text"[])))
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_verification_queue" AS
 SELECT "id",
    "business_name",
    "auth_user_id",
    ("data" ->> 'serviceType'::"text") AS "service_type",
    ("data" ->> 'category'::"text") AS "category",
    (("data" -> 'verification'::"text") ->> 'status'::"text") AS "verification_status",
    (("data" -> 'verification'::"text") -> 'documents'::"text") AS "documents",
    (("data" -> 'verification'::"text") ->> 'submittedAt'::"text") AS "submitted_at",
    "created_at",
    "updated_at",
    "data" AS "full_data"
   FROM "public"."suppliers" "s"
  WHERE ("auth_user_id" IS NOT NULL)
  ORDER BY "updated_at" DESC;


ALTER VIEW "public"."admin_verification_queue" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."business_summary" AS
 SELECT "id" AS "business_id",
    "business_name",
    "business_type",
    "is_primary",
    "auth_user_id" AS "owner_id",
    "parent_business_id",
    "created_from_theme",
    "business_slug",
    "created_at",
    "updated_at"
   FROM "public"."suppliers";


ALTER VIEW "public"."business_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "party_id" "uuid",
    "supplier_id" "uuid",
    "supplier_category" "text" NOT NULL,
    "package_id" "text",
    "addon_ids" "text"[],
    "message" "text",
    "special_requests" "text",
    "quoted_price" numeric(10,2),
    "final_price" numeric(10,2),
    "status" "text" DEFAULT 'pending'::"text",
    "supplier_response" "text",
    "supplier_response_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "addon_details" "jsonb",
    "replacement_processed" boolean DEFAULT false,
    "payment_status" character varying(20) DEFAULT 'unpaid'::character varying,
    "auto_accepted" boolean DEFAULT false,
    "googleeventid" "text",
    "outlookeventid" "text",
    CONSTRAINT "enquiries_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'withdrawn'::"text"])))
);


ALTER TABLE "public"."enquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gift_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "price" numeric(10,2),
    "price_range" character varying(50),
    "age_min" integer,
    "age_max" integer,
    "category" character varying(100),
    "subcategory" character varying(100),
    "themes" "text"[],
    "gender" character varying(20) DEFAULT 'unisex'::character varying,
    "image_url" "text",
    "popularity" integer DEFAULT 50,
    "tags" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."gift_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "your_name" "text",
    "business_name" "text",
    "phone" "text",
    "postcode" "text",
    "supplier_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "terms_accepted" "jsonb",
    "venue_address" "jsonb"
);


ALTER TABLE "public"."onboarding_drafts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."onboarding_drafts"."venue_address" IS 'Venue address data for venue-type suppliers';



CREATE TABLE IF NOT EXISTS "public"."parties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "child_name" "text" NOT NULL,
    "child_age" integer NOT NULL,
    "party_date" "date" NOT NULL,
    "party_time" time without time zone,
    "guest_count" integer NOT NULL,
    "location" "text" NOT NULL,
    "postcode" "text",
    "theme" "text" NOT NULL,
    "budget" numeric(10,2),
    "special_requirements" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "party_plan" "jsonb" DEFAULT '{}'::"jsonb",
    "estimated_cost" numeric(10,2) DEFAULT 0,
    "total_paid" numeric(10,2) DEFAULT 0,
    "deposit_amount" numeric(10,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "payment_date" timestamp with time zone,
    "payment_intent_id" "text",
    "payment_status" "text",
    "end_time" time without time zone,
    "start_time" time without time zone,
    "delivery_address_line_1" "text",
    "delivery_address_line_2" "text",
    "delivery_city" "text",
    "delivery_postcode" "text",
    "dietary_requirements" "jsonb",
    "accessibility_requirements" "jsonb",
    "full_delivery_address" "text",
    "parent_name" "text",
    "parent_email" "text",
    "parent_phone" "text",
    "dietary_requirements_array" "text"[],
    "accessibility_requirements_array" "text"[],
    "has_dietary_requirements" boolean DEFAULT false,
    "has_accessibility_requirements" boolean DEFAULT false,
    "submitted_at" timestamp with time zone,
    "child_photo" "text",
    "terms_accepted" boolean DEFAULT false,
    "terms_accepted_at" timestamp with time zone,
    "marketing_consent" boolean DEFAULT false,
    CONSTRAINT "parties_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'planned'::"text", 'booked'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."parties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."party_gift_registries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "party_id" "uuid",
    "name" character varying(255) DEFAULT 'Gift Registry'::character varying,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "header_image" "text",
    "personalization_data" "jsonb"
);


ALTER TABLE "public"."party_gift_registries" OWNER TO "postgres";


COMMENT ON COLUMN "public"."party_gift_registries"."header_image" IS 'URL of the child photo used as registry 
  header background';



CREATE TABLE IF NOT EXISTS "public"."party_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text" NOT NULL,
    "email" "text",
    "current_step" "text",
    "party_data" "jsonb",
    "status" "text" DEFAULT 'browsing'::"text",
    "started_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_activity" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "device_info" "jsonb",
    "referrer" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "action_timeline" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."party_tracking" OWNER TO "postgres";


COMMENT ON COLUMN "public"."party_tracking"."action_timeline" IS 'Array of actions: [{ action: 
  "supplier_added|supplier_removed|theme_changed", timestamp: ISO8601, data: {...} }]';



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "party_id" "uuid",
    "stripe_payment_intent_id" "text",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'gbp'::"text",
    "payment_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "payments_payment_type_check" CHECK (("payment_type" = ANY (ARRAY['deposit'::"text", 'final_payment'::"text", 'refund'::"text"]))),
    CONSTRAINT "payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'succeeded'::"text", 'failed'::"text", 'cancelled'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."public_invites" (
    "id" "text" NOT NULL,
    "theme" "text" NOT NULL,
    "invite_data" "jsonb" NOT NULL,
    "generated_image" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "invite_slug" "text"
);


ALTER TABLE "public"."public_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registry_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registry_id" "uuid",
    "gift_item_id" "uuid",
    "custom_name" character varying(255),
    "custom_price" character varying(50),
    "custom_description" "text",
    "notes" "text",
    "priority" character varying(20) DEFAULT 'medium'::character varying,
    "quantity" integer DEFAULT 1,
    "is_claimed" boolean DEFAULT false,
    "claimed_by" character varying(255),
    "claimed_email" character varying(255),
    "claimed_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "external_product_id" character varying(255),
    "external_source" character varying(100),
    "external_image_url" "text",
    "external_buy_url" "text"
);


ALTER TABLE "public"."registry_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rsvps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invite_id" "text",
    "guest_name" "text" NOT NULL,
    "guest_email" "text",
    "guest_phone" "text",
    "attendance" "text" NOT NULL,
    "adults_count" integer DEFAULT 1,
    "children_count" integer DEFAULT 0,
    "dietary_requirements" "text",
    "message" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "child_name" "text",
    CONSTRAINT "rsvps_attendance_check" CHECK (("attendance" = ANY (ARRAY['yes'::"text", 'no'::"text", 'maybe'::"text"])))
);


ALTER TABLE "public"."rsvps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_message_templates" (
    "id" integer NOT NULL,
    "supplier_id" "uuid",
    "supplier_category" character varying(50) NOT NULL,
    "template_type" character varying(20) NOT NULL,
    "template_name" character varying(100) NOT NULL,
    "message_template" "text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "is_system_template" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."supplier_message_templates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."supplier_message_templates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."supplier_message_templates_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."supplier_message_templates_id_seq" OWNED BY "public"."supplier_message_templates"."id";



CREATE TABLE IF NOT EXISTS "public"."supplier_responses" (
    "id" integer NOT NULL,
    "enquiry_id" "uuid" NOT NULL,
    "party_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "response_type" character varying(20) NOT NULL,
    "response_message" "text" NOT NULL,
    "final_price" numeric(10,2),
    "sent_at" timestamp without time zone DEFAULT "now"(),
    "read_by_customer_at" timestamp without time zone,
    "email_sent_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "supplier_responses_response_type_check" CHECK ((("response_type")::"text" = ANY ((ARRAY['accepted'::character varying, 'declined'::character varying])::"text"[])))
);


ALTER TABLE "public"."supplier_responses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."supplier_responses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."supplier_responses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."supplier_responses_id_seq" OWNED BY "public"."supplier_responses"."id";



CREATE OR REPLACE VIEW "public"."suppliers_secure" AS
 SELECT "id",
    "legacy_id",
    "public"."sanitize_supplier_data"("data", "auth_user_id") AS "data",
    "created_at",
    "updated_at",
    "auth_user_id",
    "business_type",
    "is_primary",
    "parent_business_id",
    "created_from_theme",
    "business_slug",
    "business_name",
    "is_active",
    "fcm_token",
    "last_token_update",
    "profile_status",
    "profile_completion_percentage",
    "can_go_live",
    "went_live_at"
   FROM "public"."suppliers";


ALTER VIEW "public"."suppliers_secure" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."terms_acceptances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "user_email" "text" NOT NULL,
    "supplier_id" "uuid",
    "terms_version" "text" NOT NULL,
    "privacy_version" "text" NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "accepted_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "acceptance_context" "text",
    "booking_id" "uuid"
);


ALTER TABLE "public"."terms_acceptances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."urgent_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "party_id" "uuid",
    "enquiry_id" "uuid",
    "severity" character varying(20) DEFAULT 'normal'::character varying,
    "message" "text" NOT NULL,
    "data" "jsonb",
    "resolved" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "resolved_at" timestamp without time zone
);


ALTER TABLE "public"."urgent_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid",
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "postcode" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "address_line_1" "text",
    "address_line_2" "text",
    "city" "text",
    "child_photo" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."child_photo" IS 'URL or storage path for the child''s photo';



ALTER TABLE ONLY "public"."supplier_message_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."supplier_message_templates_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."supplier_responses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."supplier_responses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enquiries"
    ADD CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gift_items"
    ADD CONSTRAINT "gift_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_drafts"
    ADD CONSTRAINT "onboarding_drafts_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."onboarding_drafts"
    ADD CONSTRAINT "onboarding_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parties"
    ADD CONSTRAINT "parties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."party_gift_registries"
    ADD CONSTRAINT "party_gift_registries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."party_tracking"
    ADD CONSTRAINT "party_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."party_tracking"
    ADD CONSTRAINT "party_tracking_session_id_key" UNIQUE ("session_id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."public_invites"
    ADD CONSTRAINT "public_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."registry_items"
    ADD CONSTRAINT "registry_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rsvps"
    ADD CONSTRAINT "rsvps_invite_id_guest_email_key" UNIQUE ("invite_id", "guest_email");



ALTER TABLE ONLY "public"."rsvps"
    ADD CONSTRAINT "rsvps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_message_templates"
    ADD CONSTRAINT "supplier_message_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_responses"
    ADD CONSTRAINT "supplier_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_legacy_id_key" UNIQUE ("legacy_id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."terms_acceptances"
    ADD CONSTRAINT "terms_acceptances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_drafts"
    ADD CONSTRAINT "unique_email" UNIQUE ("email");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "uq_business_slug" UNIQUE ("business_slug");



ALTER TABLE ONLY "public"."urgent_alerts"
    ADD CONSTRAINT "urgent_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_id_unique" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_admin_users_active" ON "public"."admin_users" USING "btree" ("active");



CREATE INDEX "idx_admin_users_email" ON "public"."admin_users" USING "btree" ("email");



CREATE INDEX "idx_admin_users_user_id" ON "public"."admin_users" USING "btree" ("user_id");



CREATE INDEX "idx_enquiries_created_at" ON "public"."enquiries" USING "btree" ("created_at");



CREATE INDEX "idx_enquiries_google_event" ON "public"."enquiries" USING "btree" ("googleeventid");



CREATE INDEX "idx_enquiries_outlook_event" ON "public"."enquiries" USING "btree" ("outlookeventid");



CREATE INDEX "idx_enquiries_party_id" ON "public"."enquiries" USING "btree" ("party_id");



CREATE INDEX "idx_enquiries_status" ON "public"."enquiries" USING "btree" ("status");



CREATE INDEX "idx_enquiries_supplier_id" ON "public"."enquiries" USING "btree" ("supplier_id");



CREATE INDEX "idx_gift_items_age" ON "public"."gift_items" USING "btree" ("age_min", "age_max");



CREATE INDEX "idx_gift_items_category" ON "public"."gift_items" USING "btree" ("category");



CREATE INDEX "idx_gift_items_popularity" ON "public"."gift_items" USING "btree" ("popularity" DESC);



CREATE INDEX "idx_gift_items_themes" ON "public"."gift_items" USING "gin" ("themes");



CREATE INDEX "idx_onboarding_email" ON "public"."onboarding_drafts" USING "btree" ("email");



CREATE INDEX "idx_parties_party_date" ON "public"."parties" USING "btree" ("party_date");



CREATE INDEX "idx_parties_status" ON "public"."parties" USING "btree" ("status");



CREATE INDEX "idx_parties_theme" ON "public"."parties" USING "btree" ("theme");



CREATE INDEX "idx_parties_user_id" ON "public"."parties" USING "btree" ("user_id");



CREATE INDEX "idx_party_gift_registries_party_id" ON "public"."party_gift_registries" USING "btree" ("party_id");



CREATE INDEX "idx_party_gift_registries_personalization_data" ON "public"."party_gift_registries" USING "gin" ("personalization_data");



CREATE INDEX "idx_party_tracking_email" ON "public"."party_tracking" USING "btree" ("email");



CREATE INDEX "idx_party_tracking_last_activity" ON "public"."party_tracking" USING "btree" ("last_activity");



CREATE INDEX "idx_party_tracking_session" ON "public"."party_tracking" USING "btree" ("session_id");



CREATE INDEX "idx_party_tracking_status" ON "public"."party_tracking" USING "btree" ("status");



CREATE INDEX "idx_party_tracking_timeline" ON "public"."party_tracking" USING "gin" ("action_timeline");



CREATE INDEX "idx_payments_party_id" ON "public"."payments" USING "btree" ("party_id");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_payments_stripe_payment_intent_id" ON "public"."payments" USING "btree" ("stripe_payment_intent_id");



CREATE UNIQUE INDEX "idx_public_invites_invite_slug" ON "public"."public_invites" USING "btree" ("invite_slug") WHERE ("is_active" = true);



CREATE INDEX "idx_registry_items_external" ON "public"."registry_items" USING "btree" ("external_product_id", "external_source");



CREATE INDEX "idx_registry_items_registry_id" ON "public"."registry_items" USING "btree" ("registry_id");



CREATE INDEX "idx_rsvps_attendance" ON "public"."rsvps" USING "btree" ("attendance");



CREATE INDEX "idx_rsvps_invite_id" ON "public"."rsvps" USING "btree" ("invite_id");



CREATE INDEX "idx_supplier_responses_customer" ON "public"."supplier_responses" USING "btree" ("customer_id", "sent_at" DESC);



CREATE INDEX "idx_supplier_responses_enquiry" ON "public"."supplier_responses" USING "btree" ("enquiry_id");



CREATE INDEX "idx_supplier_responses_party" ON "public"."supplier_responses" USING "btree" ("party_id", "sent_at" DESC);



CREATE INDEX "idx_supplier_responses_unread" ON "public"."supplier_responses" USING "btree" ("customer_id", "read_by_customer_at") WHERE ("read_by_customer_at" IS NULL);



CREATE INDEX "idx_suppliers_auth_user" ON "public"."suppliers" USING "btree" ("auth_user_id");



CREATE INDEX "idx_suppliers_business_slug" ON "public"."suppliers" USING "btree" ("business_slug");



CREATE INDEX "idx_suppliers_business_type" ON "public"."suppliers" USING "btree" ("business_type");



CREATE INDEX "idx_suppliers_is_primary" ON "public"."suppliers" USING "btree" ("is_primary");



CREATE INDEX "idx_suppliers_parent_business" ON "public"."suppliers" USING "btree" ("parent_business_id");



CREATE INDEX "idx_terms_acceptances_booking_id" ON "public"."terms_acceptances" USING "btree" ("booking_id");



CREATE INDEX "idx_terms_acceptances_context" ON "public"."terms_acceptances" USING "btree" ("acceptance_context");



CREATE INDEX "idx_users_auth_user_id" ON "public"."users" USING "btree" ("auth_user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "suppliers_auth_user_id_idx" ON "public"."suppliers" USING "btree" ("auth_user_id");



CREATE INDEX "suppliers_data_idx" ON "public"."suppliers" USING "gin" ("data");



CREATE INDEX "suppliers_legacy_id_idx" ON "public"."suppliers" USING "btree" ("legacy_id");



CREATE OR REPLACE TRIGGER "handle_enquiries_updated_at" BEFORE UPDATE ON "public"."enquiries" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_parties_updated_at" BEFORE UPDATE ON "public"."parties" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_rsvps_updated_at" BEFORE UPDATE ON "public"."rsvps" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supplier_responses_updated_at" BEFORE UPDATE ON "public"."supplier_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enquiries"
    ADD CONSTRAINT "enquiries_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enquiries"
    ADD CONSTRAINT "enquiries_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "fk_parent_business" FOREIGN KEY ("parent_business_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."parties"
    ADD CONSTRAINT "parties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."party_gift_registries"
    ADD CONSTRAINT "party_gift_registries_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registry_items"
    ADD CONSTRAINT "registry_items_gift_item_id_fkey" FOREIGN KEY ("gift_item_id") REFERENCES "public"."gift_items"("id");



ALTER TABLE ONLY "public"."registry_items"
    ADD CONSTRAINT "registry_items_registry_id_fkey" FOREIGN KEY ("registry_id") REFERENCES "public"."party_gift_registries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rsvps"
    ADD CONSTRAINT "rsvps_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."public_invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_message_templates"
    ADD CONSTRAINT "supplier_message_templates_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."supplier_responses"
    ADD CONSTRAINT "supplier_responses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."supplier_responses"
    ADD CONSTRAINT "supplier_responses_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id");



ALTER TABLE ONLY "public"."supplier_responses"
    ADD CONSTRAINT "supplier_responses_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id");



ALTER TABLE ONLY "public"."supplier_responses"
    ADD CONSTRAINT "supplier_responses_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."terms_acceptances"
    ADD CONSTRAINT "terms_acceptances_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."parties"("id");



ALTER TABLE ONLY "public"."terms_acceptances"
    ADD CONSTRAINT "terms_acceptances_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."terms_acceptances"
    ADD CONSTRAINT "terms_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."urgent_alerts"
    ADD CONSTRAINT "urgent_alerts_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id");



ALTER TABLE ONLY "public"."urgent_alerts"
    ADD CONSTRAINT "urgent_alerts_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage admin users" ON "public"."admin_users" USING (("user_id" IN ( SELECT "admin_users_1"."user_id"
   FROM "public"."admin_users" "admin_users_1"
  WHERE (("admin_users_1"."active" = true) AND ('super_admin'::"text" = ANY ("admin_users_1"."permissions"))))));



CREATE POLICY "Admins can view admin users" ON "public"."admin_users" FOR SELECT USING (("user_id" IN ( SELECT "admin_users_1"."user_id"
   FROM "public"."admin_users" "admin_users_1"
  WHERE ("admin_users_1"."active" = true))));



CREATE POLICY "Allow all operations on onboarding_drafts" ON "public"."onboarding_drafts" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow insert during signup" ON "public"."suppliers" FOR INSERT WITH CHECK (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "Allow insert for authenticated users" ON "public"."onboarding_drafts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Anyone can create RSVPs" ON "public"."rsvps" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can create onboarding drafts" ON "public"."onboarding_drafts" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can submit RSVPs" ON "public"."rsvps" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can update RSVPs" ON "public"."rsvps" FOR UPDATE USING (true);



CREATE POLICY "Anyone can view RSVPs" ON "public"."rsvps" FOR SELECT USING (true);



CREATE POLICY "Anyone can view active invites" ON "public"."public_invites" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view public invites" ON "public"."public_invites" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Authenticated users can create invites" ON "public"."public_invites" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can create terms" ON "public"."terms_acceptances" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can create terms acceptances" ON "public"."terms_acceptances" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can delete RSVPs" ON "public"."rsvps" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete invites" ON "public"."public_invites" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read RSVPs" ON "public"."rsvps" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can read all parties" ON "public"."parties" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read all profiles" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update invites" ON "public"."public_invites" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view all invites" ON "public"."public_invites" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable all for party_tracking" ON "public"."party_tracking" USING (true) WITH CHECK (true);



CREATE POLICY "Party owners can create enquiries" ON "public"."enquiries" FOR INSERT TO "authenticated" WITH CHECK (("party_id" IN ( SELECT "parties"."id"
   FROM "public"."parties"
  WHERE ("parties"."user_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_user_id" = "auth"."uid"()))))));



CREATE POLICY "Party owners can delete their enquiries" ON "public"."enquiries" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "public"."get_party_owners_auth_id"("enquiries"."party_id") AS "get_party_owners_auth_id")));



CREATE POLICY "Party owners can update their enquiries" ON "public"."enquiries" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "public"."get_party_owners_auth_id"("enquiries"."party_id") AS "get_party_owners_auth_id")));



CREATE POLICY "Party owners can view responses to their enquiries" ON "public"."supplier_responses" FOR SELECT TO "authenticated" USING (("party_id" IN ( SELECT "parties"."id"
   FROM "public"."parties"
  WHERE ("parties"."user_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_user_id" = "auth"."uid"()))))));



CREATE POLICY "Party owners can view their enquiries" ON "public"."enquiries" FOR SELECT TO "authenticated" USING (("auth"."uid"() IN ( SELECT "public"."get_party_owners_auth_id"("enquiries"."party_id") AS "get_party_owners_auth_id")));



CREATE POLICY "Public can update drafts" ON "public"."onboarding_drafts" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Public can view drafts by email" ON "public"."onboarding_drafts" FOR SELECT USING (true);



CREATE POLICY "Suppliers can create responses" ON "public"."supplier_responses" FOR INSERT TO "authenticated" WITH CHECK (("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Suppliers can create their own templates" ON "public"."supplier_message_templates" FOR INSERT TO "authenticated" WITH CHECK ((("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))) AND ("is_system_template" = false)));



CREATE POLICY "Suppliers can delete their own responses" ON "public"."supplier_responses" FOR DELETE TO "authenticated" USING (("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Suppliers can delete their own templates" ON "public"."supplier_message_templates" FOR DELETE TO "authenticated" USING ((("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))) AND ("is_system_template" = false)));



CREATE POLICY "Suppliers can update enquiries sent to them" ON "public"."enquiries" FOR UPDATE TO "authenticated" USING (("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Suppliers can update own profile" ON "public"."suppliers" FOR UPDATE USING (("auth"."uid"() = "auth_user_id")) WITH CHECK (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "Suppliers can update their own responses" ON "public"."supplier_responses" FOR UPDATE TO "authenticated" USING (("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Suppliers can update their own templates" ON "public"."supplier_message_templates" FOR UPDATE TO "authenticated" USING ((("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))) AND ("is_system_template" = false)));



CREATE POLICY "Suppliers can view enquiries sent to them" ON "public"."enquiries" FOR SELECT TO "authenticated" USING (("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Suppliers can view their own responses" ON "public"."supplier_responses" FOR SELECT TO "authenticated" USING (("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Suppliers can view their own templates" ON "public"."supplier_message_templates" FOR SELECT TO "authenticated" USING ((("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))) OR ("is_system_template" = true)));



CREATE POLICY "Suppliers can view their own terms acceptances" ON "public"."terms_acceptances" FOR SELECT TO "authenticated" USING (("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Suppliers full access to own profile" ON "public"."suppliers" TO "authenticated" USING (("auth_user_id" = "auth"."uid"())) WITH CHECK (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Users can create payments for their parties" ON "public"."payments" FOR INSERT WITH CHECK (("party_id" IN ( SELECT "p"."id"
   FROM ("public"."parties" "p"
     JOIN "public"."users" "u" ON (("p"."user_id" = "u"."id")))
  WHERE ("u"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create public invites" ON "public"."public_invites" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can delete their own drafts" ON "public"."onboarding_drafts" FOR DELETE TO "authenticated" USING (("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text"));



CREATE POLICY "Users can insert own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "Users can manage their own parties" ON "public"."parties" TO "authenticated" USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "Users can update public invites" ON "public"."public_invites" FOR UPDATE USING (true);



CREATE POLICY "Users can update their own drafts" ON "public"."onboarding_drafts" FOR UPDATE TO "authenticated" USING (("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text")) WITH CHECK (("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text"));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "Users can view own terms" ON "public"."terms_acceptances" FOR SELECT TO "authenticated" USING ((("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_user_id" = "auth"."uid"()))) OR (("user_id")::"text" = ("auth"."uid"())::"text") OR ("supplier_id" IN ( SELECT "suppliers"."id"
   FROM "public"."suppliers"
  WHERE ("suppliers"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view payments for their parties" ON "public"."payments" FOR SELECT USING (("party_id" IN ( SELECT "p"."id"
   FROM ("public"."parties" "p"
     JOIN "public"."users" "u" ON (("p"."user_id" = "u"."id")))
  WHERE ("u"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own drafts by email" ON "public"."onboarding_drafts" FOR SELECT TO "authenticated" USING (("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text"));



CREATE POLICY "Users can view their own terms acceptances" ON "public"."terms_acceptances" FOR SELECT TO "authenticated" USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "View access for sanitized data" ON "public"."suppliers" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enquiries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."parties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."party_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rsvps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_message_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."terms_acceptances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."suppliers";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_party_owners_auth_id"("party_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_party_owners_auth_id"("party_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_party_owners_auth_id"("party_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_abandoned_sessions"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_abandoned_sessions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_abandoned_sessions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sanitize_supplier_data"("supplier_data" "jsonb", "supplier_auth_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."sanitize_supplier_data"("supplier_data" "jsonb", "supplier_auth_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sanitize_supplier_data"("supplier_data" "jsonb", "supplier_auth_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."admin_verification_queue" TO "anon";
GRANT ALL ON TABLE "public"."admin_verification_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_verification_queue" TO "service_role";



GRANT ALL ON TABLE "public"."business_summary" TO "anon";
GRANT ALL ON TABLE "public"."business_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."business_summary" TO "service_role";



GRANT ALL ON TABLE "public"."enquiries" TO "anon";
GRANT ALL ON TABLE "public"."enquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."enquiries" TO "service_role";



GRANT ALL ON TABLE "public"."gift_items" TO "anon";
GRANT ALL ON TABLE "public"."gift_items" TO "authenticated";
GRANT ALL ON TABLE "public"."gift_items" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_drafts" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_drafts" TO "service_role";



GRANT ALL ON TABLE "public"."parties" TO "anon";
GRANT ALL ON TABLE "public"."parties" TO "authenticated";
GRANT ALL ON TABLE "public"."parties" TO "service_role";



GRANT ALL ON TABLE "public"."party_gift_registries" TO "anon";
GRANT ALL ON TABLE "public"."party_gift_registries" TO "authenticated";
GRANT ALL ON TABLE "public"."party_gift_registries" TO "service_role";



GRANT ALL ON TABLE "public"."party_tracking" TO "anon";
GRANT ALL ON TABLE "public"."party_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."party_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."public_invites" TO "anon";
GRANT ALL ON TABLE "public"."public_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."public_invites" TO "service_role";



GRANT ALL ON TABLE "public"."registry_items" TO "anon";
GRANT ALL ON TABLE "public"."registry_items" TO "authenticated";
GRANT ALL ON TABLE "public"."registry_items" TO "service_role";



GRANT ALL ON TABLE "public"."rsvps" TO "anon";
GRANT ALL ON TABLE "public"."rsvps" TO "authenticated";
GRANT ALL ON TABLE "public"."rsvps" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_message_templates" TO "anon";
GRANT ALL ON TABLE "public"."supplier_message_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_message_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."supplier_message_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."supplier_message_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."supplier_message_templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_responses" TO "anon";
GRANT ALL ON TABLE "public"."supplier_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_responses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."supplier_responses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."supplier_responses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."supplier_responses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers_secure" TO "anon";
GRANT ALL ON TABLE "public"."suppliers_secure" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers_secure" TO "service_role";
GRANT SELECT ON TABLE "public"."suppliers_secure" TO PUBLIC;



GRANT ALL ON TABLE "public"."terms_acceptances" TO "anon";
GRANT ALL ON TABLE "public"."terms_acceptances" TO "authenticated";
GRANT ALL ON TABLE "public"."terms_acceptances" TO "service_role";



GRANT ALL ON TABLE "public"."urgent_alerts" TO "anon";
GRANT ALL ON TABLE "public"."urgent_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."urgent_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";

alter table "public"."supplier_responses" drop constraint "supplier_responses_response_type_check";

alter table "public"."suppliers" drop constraint "chk_business_type";

alter table "public"."supplier_responses" add constraint "supplier_responses_response_type_check" CHECK (((response_type)::text = ANY ((ARRAY['accepted'::character varying, 'declined'::character varying])::text[]))) not valid;

alter table "public"."supplier_responses" validate constraint "supplier_responses_response_type_check";

alter table "public"."suppliers" add constraint "chk_business_type" CHECK (((business_type)::text = ANY ((ARRAY['primary'::character varying, 'themed'::character varying])::text[]))) not valid;

alter table "public"."suppliers" validate constraint "chk_business_type";


