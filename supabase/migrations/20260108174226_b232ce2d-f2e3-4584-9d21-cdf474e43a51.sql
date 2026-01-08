-- Grant admin role to josephnssien@gmail.com
-- This will work if the user already exists, or can be re-run after signup
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM public.profiles 
WHERE email = 'josephnssien@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;