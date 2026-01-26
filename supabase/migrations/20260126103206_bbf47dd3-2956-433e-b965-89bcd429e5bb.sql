-- Allow donors to update their own donations when in draft or verification_rejected status
CREATE POLICY "Donors can update their own draft donations"
ON public.donations
FOR UPDATE
TO authenticated
USING (auth.uid() = donor_id AND status IN ('draft', 'verification_rejected'))
WITH CHECK (auth.uid() = donor_id);