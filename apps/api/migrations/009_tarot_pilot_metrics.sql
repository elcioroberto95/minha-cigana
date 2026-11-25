ALTER TABLE tarot_draws
  ADD COLUMN pilot_started_at timestamptz,
  ADD COLUMN pilot_completed_at timestamptz,
  ADD COLUMN generation_ms integer,
  ADD COLUMN estimated_compute_cost_brl numeric;

ALTER TABLE tarot_draws ALTER COLUMN pilot_started_at SET DEFAULT now();

CREATE TABLE tarot_pilot_attempts (
  id uuid PRIMARY KEY,
  owner_hash text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tarot_pilot_events (
  draw_id uuid NOT NULL REFERENCES tarot_draws(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('audio_started', 'chat_continued')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (draw_id, event)
);
