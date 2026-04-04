-- Add PesaPal payment tracking columns to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT,
  ADD COLUMN IF NOT EXISTS pesapal_merchant_ref TEXT;
