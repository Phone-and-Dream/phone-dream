-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'donor', 'recipient');
CREATE TYPE public.donation_status AS ENUM ('pending', 'matched', 'in_transit', 'delivered');
CREATE TYPE public.device_condition AS ENUM ('new', 'used', 'refurbished');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.dream_status AS ENUM ('open', 'matched', 'fulfilled');
CREATE TYPE public.creator_type AS ENUM ('student', 'artist', 'entrepreneur', 'developer', 'educator', 'other');
CREATE TYPE public.recipient_rank AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum');
CREATE TYPE public.donor_type AS ENUM ('individual', 'organization');
CREATE TYPE public.skill_category AS ENUM ('technical', 'creative', 'business', 'language', 'other');
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE public.course_status AS ENUM ('in_progress', 'completed');
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'completed', 'on_hold');
CREATE TYPE public.career_event_category AS ENUM ('conference', 'workshop', 'hackathon', 'webinar', 'meetup', 'certification', 'other');
CREATE TYPE public.recommendation_status AS ENUM ('pending', 'approved', 'verified');
CREATE TYPE public.journey_event_type AS ENUM ('device_received', 'skill_learned', 'project_completed', 'course_completed', 'job_obtained', 'milestone', 'other');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles (base user info, linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    location TEXT,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles (separate table for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Recipient Profiles (extended recipient data)
CREATE TABLE public.recipient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    tagline TEXT,
    creator_type creator_type DEFAULT 'other',
    school_or_career TEXT,
    institution TEXT,
    bio TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    xp INTEGER NOT NULL DEFAULT 0,
    rank recipient_rank NOT NULL DEFAULT 'Bronze',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    device_received_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Donor Profiles (extended donor data)
CREATE TABLE public.donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_name TEXT,
    donor_type donor_type NOT NULL DEFAULT 'individual',
    total_donated INTEGER NOT NULL DEFAULT 0,
    recipients_helped INTEGER NOT NULL DEFAULT 0,
    regions_reached INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- APPLICATION & REFERENCE TABLES
-- =====================================================

-- Applications
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'pending',
    device_needed TEXT NOT NULL,
    purpose TEXT NOT NULL,
    reference_letter_url TEXT,
    additional_info TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    admin_notes TEXT
);

-- Application References
CREATE TABLE public.application_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    contact TEXT NOT NULL,
    is_validated BOOLEAN NOT NULL DEFAULT false,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- DONATION & DREAM TABLES
-- =====================================================

-- Donations
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_type TEXT NOT NULL,
    device_specs TEXT,
    condition device_condition NOT NULL DEFAULT 'used',
    status donation_status NOT NULL DEFAULT 'pending',
    matched_recipient_id UUID REFERENCES auth.users(id),
    matched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    needs_refurbishing BOOLEAN NOT NULL DEFAULT false,
    repair_contribution DECIMAL(10, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for device_received_id after donations table exists
ALTER TABLE public.recipient_profiles 
ADD CONSTRAINT fk_device_received 
FOREIGN KEY (device_received_id) REFERENCES public.donations(id);

-- Dream Requests
CREATE TABLE public.dream_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_needed TEXT NOT NULL,
    purpose TEXT NOT NULL,
    milestones JSONB,
    timeline TEXT,
    needs_refurbishing BOOLEAN NOT NULL DEFAULT false,
    status dream_status NOT NULL DEFAULT 'open',
    matched_donation_id UUID REFERENCES public.donations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attestations (blockchain SBT records)
CREATE TABLE public.attestations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    tx_hash TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'base',
    schema_id TEXT,
    attestation_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- SKILLS, COURSES, PROJECTS TABLES
-- =====================================================

-- Skills
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category skill_category NOT NULL DEFAULT 'other',
    level skill_level NOT NULL DEFAULT 'beginner',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    status course_status NOT NULL DEFAULT 'in_progress',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completion_date DATE,
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    tech_stack TEXT[],
    status project_status NOT NULL DEFAULT 'planning',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    live_url TEXT,
    github_url TEXT,
    built_with_donated_device BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- XP SYSTEM TABLES
-- =====================================================

-- XP Rules (admin-configurable)
CREATE TABLE public.xp_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL UNIQUE,
    xp_value INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- XP Transactions (earning history)
CREATE TABLE public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.xp_rules(id),
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CAREER & JOURNEY TABLES
-- =====================================================

-- Career Events
CREATE TABLE public.career_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT,
    description TEXT,
    category career_event_category NOT NULL DEFAULT 'other',
    skills_gained TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recommendations
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommender_name TEXT NOT NULL,
    recommender_title TEXT,
    recommender_organization TEXT,
    recommender_email TEXT,
    relationship TEXT NOT NULL,
    message TEXT NOT NULL,
    status recommendation_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journey Events (timeline)
CREATE TABLE public.journey_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    event_type journey_event_type NOT NULL DEFAULT 'other',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKS
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: PROFILES
-- =====================================================

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES: USER_ROLES
-- =====================================================

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow users to insert their own role during signup (service role or specific check)
CREATE POLICY "Users can insert their own initial role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: RECIPIENT_PROFILES
-- =====================================================

CREATE POLICY "Recipient profiles are viewable by everyone"
ON public.recipient_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own recipient profile"
ON public.recipient_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipient profile"
ON public.recipient_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: DONOR_PROFILES
-- =====================================================

CREATE POLICY "Donor profiles are viewable by everyone"
ON public.donor_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own donor profile"
ON public.donor_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own donor profile"
ON public.donor_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: APPLICATIONS
-- =====================================================

CREATE POLICY "Users can view their own applications"
ON public.applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own application"
ON public.applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending application"
ON public.applications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update any application"
ON public.applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: APPLICATION_REFERENCES
-- =====================================================

CREATE POLICY "Users can view their own application references"
ON public.application_references FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.applications a 
    WHERE a.id = application_id AND a.user_id = auth.uid()
));

CREATE POLICY "Admins can view all references"
ON public.application_references FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert references for their own application"
ON public.application_references FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.applications a 
    WHERE a.id = application_id AND a.user_id = auth.uid()
));

-- =====================================================
-- RLS POLICIES: DONATIONS
-- =====================================================

CREATE POLICY "Donors can view their own donations"
ON public.donations FOR SELECT
TO authenticated
USING (auth.uid() = donor_id);

CREATE POLICY "Recipients can view donations matched to them"
ON public.donations FOR SELECT
TO authenticated
USING (auth.uid() = matched_recipient_id);

CREATE POLICY "Admins can view all donations"
ON public.donations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Donors can insert their own donations"
ON public.donations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Admins can update any donation"
ON public.donations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: DREAM_REQUESTS
-- =====================================================

CREATE POLICY "Dream requests are viewable by everyone"
ON public.dream_requests FOR SELECT
USING (true);

CREATE POLICY "Recipients can insert their own dream requests"
ON public.dream_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update their own dream requests"
ON public.dream_requests FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their own dream requests"
ON public.dream_requests FOR DELETE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can update any dream request"
ON public.dream_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: ATTESTATIONS
-- =====================================================

CREATE POLICY "Attestations are viewable by everyone"
ON public.attestations FOR SELECT
USING (true);

CREATE POLICY "Admins can insert attestations"
ON public.attestations FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: SKILLS
-- =====================================================

CREATE POLICY "Skills are viewable by everyone"
ON public.skills FOR SELECT
USING (true);

CREATE POLICY "Recipients can insert their own skills"
ON public.skills FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update their own skills"
ON public.skills FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their own skills"
ON public.skills FOR DELETE
TO authenticated
USING (auth.uid() = recipient_id);

-- =====================================================
-- RLS POLICIES: COURSES
-- =====================================================

CREATE POLICY "Courses are viewable by everyone"
ON public.courses FOR SELECT
USING (true);

CREATE POLICY "Recipients can insert their own courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update their own courses"
ON public.courses FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their own courses"
ON public.courses FOR DELETE
TO authenticated
USING (auth.uid() = recipient_id);

-- =====================================================
-- RLS POLICIES: PROJECTS
-- =====================================================

CREATE POLICY "Projects are viewable by everyone"
ON public.projects FOR SELECT
USING (true);

CREATE POLICY "Recipients can insert their own projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update their own projects"
ON public.projects FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their own projects"
ON public.projects FOR DELETE
TO authenticated
USING (auth.uid() = recipient_id);

-- =====================================================
-- RLS POLICIES: XP_RULES
-- =====================================================

CREATE POLICY "XP rules are viewable by everyone"
ON public.xp_rules FOR SELECT
USING (true);

CREATE POLICY "Admins can insert XP rules"
ON public.xp_rules FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update XP rules"
ON public.xp_rules FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete XP rules"
ON public.xp_rules FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: XP_TRANSACTIONS
-- =====================================================

CREATE POLICY "Recipients can view their own XP transactions"
ON public.xp_transactions FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can view all XP transactions"
ON public.xp_transactions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert XP transactions"
ON public.xp_transactions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: CAREER_EVENTS
-- =====================================================

CREATE POLICY "Career events are viewable by everyone"
ON public.career_events FOR SELECT
USING (true);

CREATE POLICY "Recipients can insert their own career events"
ON public.career_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update their own career events"
ON public.career_events FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their own career events"
ON public.career_events FOR DELETE
TO authenticated
USING (auth.uid() = recipient_id);

-- =====================================================
-- RLS POLICIES: RECOMMENDATIONS
-- =====================================================

CREATE POLICY "Recommendations are viewable by everyone"
ON public.recommendations FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert recommendations"
ON public.recommendations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update recommendations"
ON public.recommendations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: JOURNEY_EVENTS
-- =====================================================

CREATE POLICY "Journey events are viewable by everyone"
ON public.journey_events FOR SELECT
USING (true);

CREATE POLICY "Recipients can insert their own journey events"
ON public.journey_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update their own journey events"
ON public.journey_events FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their own journey events"
ON public.journey_events FOR DELETE
TO authenticated
USING (auth.uid() = recipient_id);

-- =====================================================
-- TRIGGERS: AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, now(), now());
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGERS: UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipient_profiles_updated_at
BEFORE UPDATE ON public.recipient_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donor_profiles_updated_at
BEFORE UPDATE ON public.donor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dream_requests_updated_at
BEFORE UPDATE ON public.dream_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_xp_rules_updated_at
BEFORE UPDATE ON public.xp_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_events_updated_at
BEFORE UPDATE ON public.career_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TRIGGERS: XP CALCULATION ON TRANSACTION INSERT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_recipient_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_xp INTEGER;
    new_rank recipient_rank;
BEGIN
    -- Calculate new total XP
    SELECT COALESCE(SUM(amount), 0) INTO new_xp
    FROM public.xp_transactions
    WHERE recipient_id = NEW.recipient_id;

    -- Determine new rank based on XP
    IF new_xp >= 5000 THEN
        new_rank := 'Platinum';
    ELSIF new_xp >= 2000 THEN
        new_rank := 'Gold';
    ELSIF new_xp >= 500 THEN
        new_rank := 'Silver';
    ELSE
        new_rank := 'Bronze';
    END IF;

    -- Update recipient profile
    UPDATE public.recipient_profiles
    SET xp = new_xp, rank = new_rank, updated_at = now()
    WHERE user_id = NEW.recipient_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_xp_transaction_insert
AFTER INSERT ON public.xp_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_recipient_xp();

-- =====================================================
-- SEED: DEFAULT XP RULES
-- =====================================================

INSERT INTO public.xp_rules (action, xp_value, description, is_active) VALUES
('device_received', 100, 'Received a donated device', true),
('application_approved', 50, 'Application was approved', true),
('profile_completed', 25, 'Completed all profile fields', true),
('skill_added', 10, 'Added a new skill', true),
('course_started', 15, 'Started a new course', true),
('course_completed', 50, 'Completed a course', true),
('project_created', 20, 'Created a new project', true),
('project_completed', 40, 'Completed a project', true),
('recommendation_received', 30, 'Received a recommendation', true),
('career_event_added', 15, 'Added a career event', true),
('dream_fulfilled', 75, 'Dream request was fulfilled', true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_recipient_profiles_user_id ON public.recipient_profiles(user_id);
CREATE INDEX idx_recipient_profiles_xp ON public.recipient_profiles(xp DESC);
CREATE INDEX idx_donor_profiles_user_id ON public.donor_profiles(user_id);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_matched_recipient ON public.donations(matched_recipient_id);
CREATE INDEX idx_dream_requests_recipient_id ON public.dream_requests(recipient_id);
CREATE INDEX idx_dream_requests_status ON public.dream_requests(status);
CREATE INDEX idx_attestations_donation_id ON public.attestations(donation_id);
CREATE INDEX idx_skills_recipient_id ON public.skills(recipient_id);
CREATE INDEX idx_courses_recipient_id ON public.courses(recipient_id);
CREATE INDEX idx_projects_recipient_id ON public.projects(recipient_id);
CREATE INDEX idx_xp_transactions_recipient_id ON public.xp_transactions(recipient_id);
CREATE INDEX idx_career_events_recipient_id ON public.career_events(recipient_id);
CREATE INDEX idx_recommendations_recipient_id ON public.recommendations(recipient_id);
CREATE INDEX idx_journey_events_recipient_id ON public.journey_events(recipient_id);