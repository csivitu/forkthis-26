ALTER TABLE "point_transactions" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_manual_note_check" CHECK ("point_transactions"."reason" <> 'admin_manual' or ("point_transactions"."note" is not null and length(trim("point_transactions"."note")) > 0)) NOT VALID;
