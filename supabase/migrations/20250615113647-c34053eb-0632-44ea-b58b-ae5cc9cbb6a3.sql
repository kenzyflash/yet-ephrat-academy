
-- Fix RLS policies for proper admin access to profiles and user roles

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Create a security definer function to get user role for current user
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::text FROM public.user_roles 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create enhanced admin policies for profiles table
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id OR 
    public.get_current_user_role() = 'admin'
  );

-- Create enhanced admin policies for user_roles table
CREATE POLICY "Admins can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.get_current_user_role() = 'admin'
  );

-- Create a security definer function to get all users with roles for admins
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  school text,
  grade text,
  created_at timestamptz,
  role text
) AS $$
BEGIN
  -- Check if current user is admin
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.school,
    p.grade,
    p.created_at,
    COALESCE(ur.role::text, 'student') as role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;
