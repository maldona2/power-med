-- Create appointment_cancellation_tokens table for one-click WA cancel links
CREATE TABLE "appointment_cancellation_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "appointment_cancellation_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "appointment_cancellation_tokens" ADD CONSTRAINT "appointment_cancellation_tokens_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "appointment_cancellation_tokens" ADD CONSTRAINT "appointment_cancellation_tokens_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_act_appointment" ON "appointment_cancellation_tokens" USING btree ("appointment_id");
--> statement-breakpoint
CREATE INDEX "idx_act_token_hash" ON "appointment_cancellation_tokens" USING btree ("token_hash");
--> statement-breakpoint
CREATE INDEX "idx_act_expires_at" ON "appointment_cancellation_tokens" USING btree ("expires_at");
