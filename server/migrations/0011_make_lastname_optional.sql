-- Migration: Make lastName optional in all forms
-- Created: 2026-10-12
-- Required fields: firstName, email, phone
-- Optional fields: lastName

-- Make last_name nullable in repair_requests table
ALTER TABLE repair_requests ALTER COLUMN last_name DROP NOT NULL;

-- Make last_name nullable in website_inquiries table
ALTER TABLE website_inquiries ALTER COLUMN last_name DROP NOT NULL;

-- Set empty lastNames to NULL for cleaner data
UPDATE repair_requests SET last_name = NULL WHERE last_name = '';
UPDATE website_inquiries SET last_name = NULL WHERE last_name = '';
