-- Create enum for admin action types
CREATE TYPE public.admin_action_type AS ENUM (
  'approve_application',
  'reject_application',
  'validate_reference',
  'match_device',
  'confirm_delivery',
  'update_xp_rule',
  'adjust_xp',
  'login',
  'logout'
);

-- Create admin audit log table
CREATE TABLE public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type admin_action_type NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_action_type ON public.admin_audit_logs(action_type);
CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);

-- Enable Row Level Security
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- For prototype: allow all authenticated users to insert and read audit logs
-- In production, this should be restricted to admin roles only
CREATE POLICY "Authenticated users can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (true);

-- Also allow anonymous access for prototype demo mode
CREATE POLICY "Anonymous can insert audit logs for demo"
ON public.admin_audit_logs
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anonymous can view audit logs for demo"
ON public.admin_audit_logs
FOR SELECT
TO anon
USING (true);