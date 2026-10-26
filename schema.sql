CREATE TABLE parties (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  event_date text NOT NULL,
  location text NOT NULL DEFAULT '',
  budget text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL,
  join_token uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE participants (
  id uuid PRIMARY KEY,
  party_id uuid NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  access_token uuid NOT NULL UNIQUE,
  recipient_id uuid REFERENCES participants (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX participants_party_email_idx ON participants (party_id, lower(email));

CREATE TABLE exclusions (
  id uuid PRIMARY KEY,
  party_id uuid NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  participant_a_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  participant_b_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  UNIQUE (party_id, participant_a_id, participant_b_id)
);

CREATE TABLE wishlist_items (
  id uuid PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  label text NOT NULL,
  url text,
  taken boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id uuid PRIMARY KEY,
  party_id uuid NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wishlist_mail (
  id uuid PRIMARY KEY,
  party_id uuid NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  giftee_id uuid NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  attempts int NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
