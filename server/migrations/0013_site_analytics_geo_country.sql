-- Migration: store ISO country code on site_analytics for GR-focused cleanup/filters
-- Created: 2026-03-21

ALTER TABLE site_analytics ADD COLUMN IF NOT EXISTS geo_country TEXT;

CREATE INDEX IF NOT EXISTS site_analytics_geo_country_idx ON site_analytics (geo_country);
