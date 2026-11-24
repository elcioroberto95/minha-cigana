CREATE TABLE accounts (
  owner_hash text PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash bytea NOT NULL,
  password_salt bytea NOT NULL
);

CREATE TABLE account_sessions (
  token_hash text PRIMARY KEY,
  owner_hash text NOT NULL REFERENCES accounts(owner_hash) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE INDEX account_sessions_owner_expiry_idx ON account_sessions (owner_hash, expires_at);
