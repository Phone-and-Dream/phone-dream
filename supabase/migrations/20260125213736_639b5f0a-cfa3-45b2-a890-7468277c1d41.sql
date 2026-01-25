-- Add admin role to bridgingfi@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'bridgingfi@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;