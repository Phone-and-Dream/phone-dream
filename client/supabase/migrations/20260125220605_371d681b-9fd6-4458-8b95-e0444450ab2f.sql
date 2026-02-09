-- Update attestations table default network from 'base' to 'avalanche'
-- Existing records keep their current network value

ALTER TABLE public.attestations 
ALTER COLUMN network SET DEFAULT 'avalanche';