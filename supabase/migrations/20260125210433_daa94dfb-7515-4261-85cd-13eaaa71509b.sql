-- Add milestones field to applications table for "What They'll Achieve" (5 bullet points)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS milestones text[] DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.applications.milestones IS 'Array of 5 bullet points describing what the recipient will achieve with the device';