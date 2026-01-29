-- 1. Add career TEXT column to recipient_profiles
ALTER TABLE public.recipient_profiles ADD COLUMN IF NOT EXISTS career TEXT;

-- 2. Create employment_history table
CREATE TABLE public.employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employment_history
CREATE POLICY "Users can view all employment history" 
ON public.employment_history FOR SELECT USING (true);

CREATE POLICY "Users can insert their own employment history" 
ON public.employment_history FOR INSERT WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own employment history" 
ON public.employment_history FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own employment history" 
ON public.employment_history FOR DELETE USING (auth.uid() = recipient_id);

-- 3. Create awards table
CREATE TABLE public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  date_received DATE,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for awards
CREATE POLICY "Users can view all awards" 
ON public.awards FOR SELECT USING (true);

CREATE POLICY "Users can insert their own awards" 
ON public.awards FOR INSERT WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own awards" 
ON public.awards FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own awards" 
ON public.awards FOR DELETE USING (auth.uid() = recipient_id);

-- 4. Update XP rules (standardize to 10 XP, device_received stays 100)
UPDATE public.xp_rules SET xp_value = 10 WHERE action != 'device_received';
UPDATE public.xp_rules SET xp_value = 100 WHERE action = 'device_received';