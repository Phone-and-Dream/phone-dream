-- Fix overly permissive RLS policies on admin_audit_logs
-- Only admins should view and insert audit logs

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anonymous can insert audit logs for demo" ON admin_audit_logs;
DROP POLICY IF EXISTS "Anonymous can view audit logs for demo" ON admin_audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON admin_audit_logs;

-- Create proper admin-only policies
CREATE POLICY "Only admins can view audit logs"
  ON admin_audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert audit logs"
  ON admin_audit_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix overly permissive RLS policies on recommendations
-- Anyone can insert (for external recommenders), but viewing should be restricted

-- Drop existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Recommendations are viewable by everyone" ON recommendations;

-- Create restricted SELECT policies
-- Admins can see all recommendations
CREATE POLICY "Admins can view all recommendations"
  ON recommendations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Recipients can see their own recommendations (approved or pending)
CREATE POLICY "Recipients can view their own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = recipient_id);

-- Approved recommendations are publicly viewable (for public profiles)
CREATE POLICY "Approved recommendations are public"
  ON recommendations FOR SELECT
  USING (status = 'approved'::recommendation_status);