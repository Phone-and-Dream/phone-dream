-- Create donor_waitlist table
CREATE TABLE public.donor_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  donor_type TEXT NOT NULL CHECK (donor_type IN ('individual', 'company', 'community')),
  organization_name TEXT,
  organization_role TEXT,
  devices_interested TEXT[] NOT NULL,
  donation_timing TEXT,
  estimated_devices TEXT,
  support_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipient_waitlist table
CREATE TABLE public.recipient_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  age_range TEXT NOT NULL CHECK (age_range IN ('under_18', '18_24', '25_35', '35+')),
  current_status TEXT NOT NULL CHECK (current_status IN ('student', 'unemployed', 'self_learning', 'freelancer', 'early_founder', 'other')),
  current_status_other TEXT,
  learning_interest TEXT NOT NULL CHECK (learning_interest IN ('tech', 'content_creation', 'education', 'business', 'other')),
  learning_interest_other TEXT,
  device_usage_plan TEXT NOT NULL,
  device_needed TEXT[] NOT NULL,
  current_device_status TEXT NOT NULL CHECK (current_device_status IN ('none', 'broken', 'shared', 'slow')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.donor_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipient_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into donor_waitlist
CREATE POLICY "Anyone can insert into donor_waitlist"
ON public.donor_waitlist
FOR INSERT
WITH CHECK (true);

-- Allow anyone to insert into recipient_waitlist
CREATE POLICY "Anyone can insert into recipient_waitlist"
ON public.recipient_waitlist
FOR INSERT
WITH CHECK (true);

-- Only admins can read donor_waitlist
CREATE POLICY "Admins can read donor_waitlist"
ON public.donor_waitlist
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can read recipient_waitlist
CREATE POLICY "Admins can read recipient_waitlist"
ON public.recipient_waitlist
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update donor_waitlist
CREATE POLICY "Admins can update donor_waitlist"
ON public.donor_waitlist
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update recipient_waitlist
CREATE POLICY "Admins can update recipient_waitlist"
ON public.recipient_waitlist
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can delete from donor_waitlist
CREATE POLICY "Admins can delete from donor_waitlist"
ON public.donor_waitlist
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can delete from recipient_waitlist
CREATE POLICY "Admins can delete from recipient_waitlist"
ON public.recipient_waitlist
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);