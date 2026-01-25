-- Phase 1-5: Complete database schema updates

-- Add serial_imei_text to donations (for text-based serial input)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS serial_imei_text text;

-- Add recipient selection columns to donations (Phase 2)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS recipient_selection_method text DEFAULT 'platform' CHECK (recipient_selection_method IN ('platform', 'donor_choice')),
ADD COLUMN IF NOT EXISTS pre_selected_recipient_id uuid REFERENCES public.profiles(id);

-- Add achievements column to dream_requests (Phase 4)
-- The milestones column already exists as jsonb, we'll use it for achievements too

-- Create cash_donations table (Phase 3)
CREATE TABLE IF NOT EXISTS public.cash_donations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  allocation_method text NOT NULL DEFAULT 'platform' CHECK (allocation_method IN ('platform', 'donor_choice')),
  linked_recipient_id uuid REFERENCES public.profiles(id),
  linked_dream_request_id uuid REFERENCES public.dream_requests(id),
  purpose text DEFAULT 'general' CHECK (purpose IN ('device_purchase', 'refurbishment', 'logistics', 'general')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  payment_intent_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on cash_donations
ALTER TABLE public.cash_donations ENABLE ROW LEVEL SECURITY;

-- Cash donation policies
CREATE POLICY "Donors can view their own cash donations" 
ON public.cash_donations FOR SELECT 
USING (auth.uid() = donor_id);

CREATE POLICY "Donors can insert their own cash donations" 
ON public.cash_donations FOR INSERT 
WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Admins can view all cash donations" 
ON public.cash_donations FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any cash donation" 
ON public.cash_donations FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create tasks table (Phase 5)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  xp_value integer NOT NULL DEFAULT 0,
  cash_reward numeric,
  requires_verification boolean NOT NULL DEFAULT false,
  verification_type text DEFAULT 'auto' CHECK (verification_type IN ('auto', 'manual')),
  task_type text NOT NULL DEFAULT 'custom' CHECK (task_type IN ('profile', 'social', 'platform', 'custom')),
  visibility text NOT NULL DEFAULT 'always' CHECK (visibility IN ('always', 'before_application', 'after_application')),
  action_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks are viewable by everyone
CREATE POLICY "Tasks are viewable by everyone" 
ON public.tasks FOR SELECT 
USING (true);

-- Admins can manage tasks
CREATE POLICY "Admins can insert tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tasks" 
ON public.tasks FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tasks" 
ON public.tasks FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create recipient_tasks table (Phase 5)
CREATE TABLE IF NOT EXISTS public.recipient_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'approved', 'rejected')),
  submission_data text,
  submitted_at timestamp with time zone,
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES public.profiles(id),
  xp_awarded integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(recipient_id, task_id)
);

-- Enable RLS on recipient_tasks
ALTER TABLE public.recipient_tasks ENABLE ROW LEVEL SECURITY;

-- Recipients can view their own task progress
CREATE POLICY "Recipients can view their own task progress" 
ON public.recipient_tasks FOR SELECT 
USING (auth.uid() = recipient_id);

-- Recipients can insert their own task progress
CREATE POLICY "Recipients can insert their own task progress" 
ON public.recipient_tasks FOR INSERT 
WITH CHECK (auth.uid() = recipient_id);

-- Recipients can update their own task progress
CREATE POLICY "Recipients can update their own task progress" 
ON public.recipient_tasks FOR UPDATE 
USING (auth.uid() = recipient_id);

-- Admins can view all task progress
CREATE POLICY "Admins can view all task progress" 
ON public.recipient_tasks FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any task progress (for verification)
CREATE POLICY "Admins can update any task progress" 
ON public.recipient_tasks FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default tasks
INSERT INTO public.tasks (title, description, xp_value, task_type, verification_type, visibility) VALUES
  ('Follow A Phone and A Dream on Twitter', 'Follow our official Twitter account @APhoneAndADream', 50, 'social', 'manual', 'always'),
  ('Repost pinned tweet', 'Repost our pinned tweet to help spread the word', 50, 'social', 'manual', 'always'),
  ('Complete your tagline', 'Add a tagline to your profile', 10, 'profile', 'auto', 'always'),
  ('Add your bio', 'Write a bio telling your story', 10, 'profile', 'auto', 'always'),
  ('Add your location', 'Set your location on your profile', 10, 'profile', 'auto', 'always'),
  ('Add your first skill', 'Add a skill to showcase your abilities', 10, 'profile', 'auto', 'always'),
  ('Add your first project', 'Create your first project entry', 10, 'profile', 'auto', 'always'),
  ('Add your first course', 'Log a course you are taking or completed', 10, 'profile', 'auto', 'always'),
  ('Add a career event', 'Log a conference, workshop, or hackathon you attended', 10, 'profile', 'auto', 'always'),
  ('Get a recommendation', 'Receive a recommendation from a mentor or colleague', 20, 'platform', 'auto', 'always')
ON CONFLICT DO NOTHING;