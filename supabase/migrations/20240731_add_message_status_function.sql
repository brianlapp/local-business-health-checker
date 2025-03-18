
-- Function to get message status by tracking_id
CREATE OR REPLACE FUNCTION public.get_message_status(tracking_id_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    message_status TEXT;
BEGIN
    SELECT status INTO message_status
    FROM public.outreach_messages
    WHERE tracking_id = tracking_id_param
    LIMIT 1;
    
    RETURN COALESCE(message_status, 'unknown');
END;
$$;
