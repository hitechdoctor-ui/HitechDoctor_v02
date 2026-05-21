-- Μετά το deploy: ο νέος default ρόλος στον κώδικα είναι `customer`.
-- Τρέξτε εφάπαξ στη Neon αν η στήλη έχει ακόμα DEFAULT 'admin':
ALTER TABLE admin_users ALTER COLUMN role SET DEFAULT 'customer';

-- Ελέγξτε χειροκίνητα για λογαριασμούς που δεν πρέπει να είναι admin/staff:
-- SELECT id, email, role FROM admin_users ORDER BY created_at DESC;
