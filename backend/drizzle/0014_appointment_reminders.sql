-- Create reminder_deliveries table
CREATE TABLE "reminder_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"patient_email" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now(),
	"status" text DEFAULT 'sent' NOT NULL,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
-- Create reminder_opt_outs table
CREATE TABLE "reminder_opt_outs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"opted_out_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reminder_opt_outs_tenant_patient_unique" UNIQUE("tenant_id", "patient_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reminder_deliveries_appointment" ON "reminder_deliveries" USING btree ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reminder_deliveries_tenant" ON "reminder_deliveries" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reminder_deliveries_sent_at" ON "reminder_deliveries" USING btree ("sent_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reminder_deliveries_status" ON "reminder_deliveries" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reminder_opt_outs_patient" ON "reminder_opt_outs" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reminder_opt_outs_tenant" ON "reminder_opt_outs" USING btree ("tenant_id");
--> statement-breakpoint
ALTER TABLE "reminder_deliveries" ADD CONSTRAINT "reminder_deliveries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reminder_deliveries" ADD CONSTRAINT "reminder_deliveries_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reminder_deliveries" ADD CONSTRAINT "reminder_deliveries_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reminder_opt_outs" ADD CONSTRAINT "reminder_opt_outs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reminder_opt_outs" ADD CONSTRAINT "reminder_opt_outs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
