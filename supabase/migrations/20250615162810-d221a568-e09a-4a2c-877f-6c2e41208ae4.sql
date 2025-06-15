
-- First, drop the existing check constraint
ALTER TABLE public.contact_inquiries 
DROP CONSTRAINT IF EXISTS contact_inquiries_status_check;

-- Add a new check constraint that allows the status values used by the frontend
ALTER TABLE public.contact_inquiries 
ADD CONSTRAINT contact_inquiries_status_check 
CHECK (status IN ('new', 'in-progress', 'resolved'));
