
-- Phase 1: Create a secure function to update user roles with proper validation and notifications

CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS JSON AS $$
DECLARE
  current_user_role TEXT;
  target_current_role TEXT;
  result JSON;
BEGIN
  -- Check if current user is admin
  current_user_role := public.get_current_user_role();
  IF current_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access denied. Admin role required.'
    );
  END IF;

  -- Validate the new role
  IF new_role NOT IN ('student', 'teacher', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be student, teacher, or admin.'
    );
  END IF;

  -- Prevent admins from removing their own admin privileges
  IF target_user_id = auth.uid() AND current_user_role = 'admin' AND new_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot remove your own admin privileges.'
    );
  END IF;

  -- Get current role for the target user
  SELECT role::text INTO target_current_role 
  FROM public.user_roles 
  WHERE user_id = target_user_id;

  -- If user already has this role, return success without changes
  IF target_current_role = new_role THEN
    RETURN json_build_object(
      'success', true,
      'message', 'User already has this role.'
    );
  END IF;

  -- Delete existing role(s) for the user
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role::app_role);

  -- Create a notification for the user about their role change
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    target_user_id,
    'Role Updated',
    'Your account role has been updated to ' || new_role || '. You may need to refresh your session.',
    'general'
  );

  -- Log the role change (for audit purposes)
  RAISE LOG 'Role changed: User % role updated from % to % by admin %', 
    target_user_id, COALESCE(target_current_role, 'none'), new_role, auth.uid();

  RETURN json_build_object(
    'success', true,
    'message', 'Role updated successfully',
    'old_role', target_current_role,
    'new_role', new_role
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in update_user_role: % %', SQLERRM, SQLSTATE;
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update role: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, TEXT) TO authenticated;

-- Enable realtime for user_roles table so we can listen for changes
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_roles;

-- Enable realtime for notifications table so users get instant notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notifications;
