-- Προσθήκη στηλών Viber (τρέξτε χειροκίνητα αν το drizzle-kit push δεν είναι διαθέσιμο)
-- psql "$DATABASE_URL" -f script/add-viber-columns.sql

ALTER TABLE customers ADD COLUMN IF NOT EXISTS viber_user_id text;
ALTER TABLE repair_requests ADD COLUMN IF NOT EXISTS viber_user_id text;
