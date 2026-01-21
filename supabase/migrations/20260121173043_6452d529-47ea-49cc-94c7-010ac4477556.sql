-- Phase 1: Device Verification Pipeline Database Changes

-- 1. Create new expanded donation_status enum with all 14 states
-- First, we need to rename the old enum and create a new one since PostgreSQL 
-- doesn't allow easy enum modification

-- Create a new enum type with all the states
CREATE TYPE donation_status_new AS ENUM (
  'draft',
  'media_submitted', 
  'under_verification',
  'verification_rejected',
  'verified',
  'matchable',
  'matched',
  'logistics_pending',
  'pickup_scheduled',
  'in_transit',
  'received_at_hub',
  'out_for_delivery',
  'delivered',
  'impact_confirmed'
);

-- Add new columns to donations table for device media
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS media_front_url TEXT,
ADD COLUMN IF NOT EXISTS media_back_url TEXT,
ADD COLUMN IF NOT EXISTS media_screen_url TEXT,
ADD COLUMN IF NOT EXISTS media_serial_url TEXT,
ADD COLUMN IF NOT EXISTS media_video_url TEXT,
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS linked_dream_request_id UUID REFERENCES public.dream_requests(id);

-- Add the new status column (we'll migrate data then drop old)
ALTER TABLE public.donations 
ADD COLUMN status_new donation_status_new DEFAULT 'draft';

-- Migrate existing status values to new enum
UPDATE public.donations SET status_new = 
  CASE status::text
    WHEN 'pending' THEN 'draft'::donation_status_new
    WHEN 'matched' THEN 'matched'::donation_status_new
    WHEN 'in_transit' THEN 'in_transit'::donation_status_new
    WHEN 'delivered' THEN 'delivered'::donation_status_new
    ELSE 'draft'::donation_status_new
  END;

-- Drop the old status column and rename new one
ALTER TABLE public.donations DROP COLUMN status;
ALTER TABLE public.donations RENAME COLUMN status_new TO status;

-- Drop the old enum type
DROP TYPE donation_status;

-- Rename new enum to the original name
ALTER TYPE donation_status_new RENAME TO donation_status;

-- 2. Create device-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('device-media', 'device-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies for device-media bucket
-- Allow authenticated users to upload their own device media
CREATE POLICY "Users can upload device media for their donations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'device-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own device media
CREATE POLICY "Users can update their own device media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'device-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own device media
CREATE POLICY "Users can delete their own device media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'device-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to device media
CREATE POLICY "Device media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'device-media');

-- 4. Add new admin action types to the enum for audit logging
ALTER TYPE admin_action_type ADD VALUE IF NOT EXISTS 'verify_device';
ALTER TYPE admin_action_type ADD VALUE IF NOT EXISTS 'reject_device';

-- 5. Create index for faster verification queries
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_verified_by ON public.donations(verified_by);