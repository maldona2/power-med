-- Create session_photos table
CREATE TABLE "session_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"s3_key" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"mime_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "session_photos_mime_type_check" CHECK ("mime_type" IN ('image/jpeg', 'image/png', 'image/webp')),
	CONSTRAINT "session_photos_status_check" CHECK ("status" IN ('pending', 'confirmed'))
);
--> statement-breakpoint
ALTER TABLE "session_photos" ADD CONSTRAINT "session_photos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session_photos" ADD CONSTRAINT "session_photos_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session_photos" ADD CONSTRAINT "session_photos_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_session_photos_tenant" ON "session_photos" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "idx_session_photos_session" ON "session_photos" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "idx_session_photos_status" ON "session_photos" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "idx_session_photos_created_at" ON "session_photos" USING btree ("created_at");
