-- Migration: Add email field to product_offer_interests table
-- Created: 2026-10-12
-- Required fields: customerName, email, phone

-- Add email column to product_offer_interests table
ALTER TABLE product_offer_interests ADD COLUMN email TEXT NOT NULL DEFAULT '';

-- Update constraint: email should not be empty going forward
-- (Note: default '' is just for migration; app will enforce non-empty via validation)
