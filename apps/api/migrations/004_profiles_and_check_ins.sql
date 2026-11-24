CREATE TABLE visitor_profiles (
  owner_hash text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  sex text CHECK (sex IN ('female', 'male', 'other'))
);

CREATE TABLE visitor_memory (
  owner_hash text PRIMARY KEY,
  enabled boolean NOT NULL
);

CREATE TABLE daily_check_ins (
  owner_hash text NOT NULL,
  check_in_date date NOT NULL,
  state text NOT NULL DEFAULT 'offered' CHECK (state IN ('offered', 'answered', 'dismissed')),
  mood text CHECK (mood IN ('calm', 'happy', 'worried', 'sad', 'tired', 'mixed')),
  topic text CHECK (topic IN ('love', 'work', 'family', 'other')),
  PRIMARY KEY (owner_hash, check_in_date),
  CHECK ((state = 'answered' AND mood IS NOT NULL AND topic IS NOT NULL)
    OR (state <> 'answered' AND mood IS NULL AND topic IS NULL))
);
