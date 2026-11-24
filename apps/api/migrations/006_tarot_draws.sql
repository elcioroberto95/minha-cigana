CREATE TABLE tarot_draws (
  id uuid PRIMARY KEY,
  owner_hash text NOT NULL,
  format text NOT NULL CHECK (format IN ('tres-cartas', 'sim-ou-nao', 'dez-cartas')),
  locale text NOT NULL CHECK (locale IN ('pt-BR', 'en-US')),
  topic text NOT NULL,
  question text NOT NULL,
  cards jsonb NOT NULL CHECK (jsonb_typeof(cards) = 'array'),
  reading text,
  model text,
  CHECK ((reading IS NULL) = (model IS NULL))
);
