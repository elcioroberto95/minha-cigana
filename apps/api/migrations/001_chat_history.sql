CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY,
  owner_hash text NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  message_count integer NOT NULL CHECK (message_count > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_sessions_owner_updated_idx ON chat_sessions (owner_hash, updated_at DESC);

CREATE TABLE chat_messages (
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  PRIMARY KEY (session_id, position)
);
