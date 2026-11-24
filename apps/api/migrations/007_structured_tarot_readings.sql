ALTER TABLE tarot_draws
  ADD COLUMN structured_reading jsonb CHECK (
    structured_reading IS NULL OR (
      format = 'tres-cartas' AND reading IS NOT NULL AND jsonb_typeof(structured_reading) = 'object'
    )
  );
