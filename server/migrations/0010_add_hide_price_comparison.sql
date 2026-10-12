-- Migration: Add hide_price_comparison column to products table
-- Created: 2026-10-12

ALTER TABLE products ADD COLUMN IF NOT EXISTS hide_price_comparison BOOLEAN DEFAULT FALSE;

-- Update iPhone 18 Pro Burgundy to hide price comparison
UPDATE products 
SET hide_price_comparison = TRUE 
WHERE slug = 'apple-iphone-18-pro-12-256gb-burgundy';
