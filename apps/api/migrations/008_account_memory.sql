ALTER TABLE visitor_memory
  ADD COLUMN learning_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN learned_context jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(learned_context) = 'object');
