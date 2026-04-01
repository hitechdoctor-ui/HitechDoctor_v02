-- Πίνακας express-session (connect-pg-simple).
-- Χειροκίνητα: psql "$DATABASE_URL" -f table.sql
-- Ισοδύναμο με node_modules/connect-pg-simple/table.sql (με IF NOT EXISTS για ασφαλή επανεκτέλεση)

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
