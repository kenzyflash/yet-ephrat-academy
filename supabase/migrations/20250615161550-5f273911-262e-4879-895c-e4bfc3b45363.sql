
-- Add RLS policy to allow admin users to SELECT from contact_inquiries table
CREATE POLICY "Admins can view all contact inquiries" 
  ON public.contact_inquiries 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'admin'
  );

-- Add RLS policy to allow admin users to UPDATE contact inquiry status
CREATE POLICY "Admins can update contact inquiries" 
  ON public.contact_inquiries 
  FOR UPDATE 
  USING (
    public.get_current_user_role() = 'admin'
  );
