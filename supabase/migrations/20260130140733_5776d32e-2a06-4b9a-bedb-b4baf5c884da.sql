-- Create funding type enum
CREATE TYPE public.funding_type AS ENUM ('physical_device', 'impact_pool');

-- Create wallet type enum
CREATE TYPE public.wallet_type AS ENUM ('created', 'connected');

-- Create minter type enum
CREATE TYPE public.minter_type AS ENUM ('donor', 'recipient');

-- Create devices table
CREATE TABLE public.devices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_type TEXT NOT NULL,
    condition public.device_condition NOT NULL DEFAULT 'used',
    funding_type public.funding_type NOT NULL DEFAULT 'physical_device',
    donation_id UUID REFERENCES public.donations(id),
    cash_donation_ids UUID[] DEFAULT '{}',
    assigned_recipient_id UUID REFERENCES public.profiles(id),
    recipient_career_at_assignment TEXT,
    handover_date TIMESTAMPTZ,
    admin_confirmed BOOLEAN NOT NULL DEFAULT false,
    minting_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_wallets table
CREATE TABLE public.user_wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    wallet_type public.wallet_type NOT NULL DEFAULT 'created',
    encrypted_seed TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, wallet_address)
);

-- Create impact_badges table
CREATE TABLE public.impact_badges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id),
    minter_user_id UUID NOT NULL REFERENCES auth.users(id),
    minter_type public.minter_type NOT NULL,
    wallet_address TEXT NOT NULL,
    token_id TEXT,
    tx_hash TEXT,
    network TEXT NOT NULL DEFAULT 'avalanche_testnet',
    minted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB,
    UNIQUE(device_id, minter_user_id)
);

-- Create impact_pool_contributors table
CREATE TABLE public.impact_pool_contributors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id),
    donor_id UUID NOT NULL REFERENCES public.profiles(id),
    contribution_amount NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(device_id, donor_id)
);

-- Enable RLS on all tables
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_pool_contributors ENABLE ROW LEVEL SECURITY;

-- Devices policies
CREATE POLICY "Devices are viewable by everyone"
    ON public.devices FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert devices"
    ON public.devices FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update devices"
    ON public.devices FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete devices"
    ON public.devices FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- User wallets policies
CREATE POLICY "Users can view their own wallets"
    ON public.user_wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets"
    ON public.user_wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
    ON public.user_wallets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets"
    ON public.user_wallets FOR DELETE
    USING (auth.uid() = user_id);

-- Impact badges policies
CREATE POLICY "Impact badges are viewable by everyone"
    ON public.impact_badges FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own badges"
    ON public.impact_badges FOR INSERT
    WITH CHECK (auth.uid() = minter_user_id);

-- Impact pool contributors policies
CREATE POLICY "Contributors are viewable by everyone"
    ON public.impact_pool_contributors FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert contributors"
    ON public.impact_pool_contributors FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contributors"
    ON public.impact_pool_contributors FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contributors"
    ON public.impact_pool_contributors FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger for devices
CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();