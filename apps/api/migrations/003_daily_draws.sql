CREATE TABLE daily_draws (
  id uuid PRIMARY KEY,
  owner_hash text NOT NULL,
  draw_date date NOT NULL,
  card jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_hash, draw_date)
);
