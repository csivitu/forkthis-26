CREATE TABLE "game_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"selected_index" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"response_ms" integer NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_answers_selected_index_check" CHECK ("game_answers"."selected_index" between 0 and 3),
	CONSTRAINT "game_answers_response_ms_check" CHECK ("game_answers"."response_ms" >= 0)
);
--> statement-breakpoint
CREATE TABLE "game_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"duration_seconds" integer NOT NULL,
	"position" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_questions_prompt_length_check" CHECK (char_length(trim("game_questions"."prompt")) between 1 and 500),
	CONSTRAINT "game_questions_options_check" CHECK (jsonb_typeof("game_questions"."options") = 'array' and jsonb_array_length("game_questions"."options") = 4),
	CONSTRAINT "game_questions_correct_index_check" CHECK ("game_questions"."correct_index" between 0 and 3),
	CONSTRAINT "game_questions_duration_check" CHECK ("game_questions"."duration_seconds" between 5 and 300),
	CONSTRAINT "game_questions_position_check" CHECK ("game_questions"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "game_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"duration_seconds" integer NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"pushed_by" uuid NOT NULL,
	CONSTRAINT "game_rounds_options_check" CHECK (jsonb_typeof("game_rounds"."options") = 'array' and jsonb_array_length("game_rounds"."options") = 4),
	CONSTRAINT "game_rounds_correct_index_check" CHECK ("game_rounds"."correct_index" between 0 and 3),
	CONSTRAINT "game_rounds_window_check" CHECK ("game_rounds"."ends_at" > "game_rounds"."started_at")
);
--> statement-breakpoint
ALTER TABLE "game_answers" ADD CONSTRAINT "game_answers_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_answers" ADD CONSTRAINT "game_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_questions" ADD CONSTRAINT "game_questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_questions" ADD CONSTRAINT "game_questions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_question_id_game_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."game_questions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_pushed_by_users_id_fk" FOREIGN KEY ("pushed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "game_answers_round_user_unique" ON "game_answers" USING btree ("round_id","user_id");--> statement-breakpoint
CREATE INDEX "game_answers_user_idx" ON "game_answers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_questions_position_idx" ON "game_questions" USING btree ("position");--> statement-breakpoint
CREATE INDEX "game_questions_created_by_idx" ON "game_questions" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "game_rounds_started_at_idx" ON "game_rounds" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "game_rounds_question_id_idx" ON "game_rounds" USING btree ("question_id");