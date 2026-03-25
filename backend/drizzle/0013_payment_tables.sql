-- Create payment_records table
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"amount_cents" integer NOT NULL,
	"payment_method" text DEFAULT 'cash' NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payment_records_payment_method_check" CHECK ("payment_method" IN ('cash', 'card', 'transfer', 'insurance', 'other'))
);
--> statement-breakpoint
-- Create payment_plans table
CREATE TABLE "payment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"total_amount_cents" integer NOT NULL,
	"installment_amount_cents" integer NOT NULL,
	"frequency" text DEFAULT 'monthly' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"next_payment_date" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"on_time_payments" integer DEFAULT 0 NOT NULL,
	"late_payments" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payment_plans_frequency_check" CHECK ("frequency" IN ('weekly', 'biweekly', 'monthly')),
	CONSTRAINT "payment_plans_status_check" CHECK ("status" IN ('active', 'completed', 'delinquent', 'cancelled'))
);
--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_payment_records_tenant" ON "payment_records" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "idx_payment_records_patient" ON "payment_records" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "idx_payment_records_payment_date" ON "payment_records" USING btree ("payment_date");
--> statement-breakpoint
CREATE INDEX "idx_payment_plans_tenant" ON "payment_plans" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "idx_payment_plans_patient" ON "payment_plans" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "idx_payment_plans_status" ON "payment_plans" USING btree ("status");
