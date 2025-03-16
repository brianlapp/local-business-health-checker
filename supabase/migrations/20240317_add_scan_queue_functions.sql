
-- Add function to add a business to the scan queue
CREATE OR REPLACE FUNCTION public.add_to_scan_queue(
  business_id_param UUID,
  scan_type_param TEXT,
  url_param TEXT,
  priority_param TEXT DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Insert into scan queue and return the ID
  INSERT INTO public.scan_queue (
    business_id,
    scan_type,
    url,
    priority,
    status,
    created_at
  ) VALUES (
    business_id_param,
    scan_type_param,
    url_param,
    priority_param,
    'pending',
    NOW()
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Add function to get scan queue statistics
CREATE OR REPLACE FUNCTION public.get_scan_queue_stats(today_date TIMESTAMP WITH TIME ZONE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  pending_count INTEGER;
  in_progress_count INTEGER;
  completed_count INTEGER;
  failed_count INTEGER;
BEGIN
  -- Count pending scans
  SELECT COUNT(*) INTO pending_count
  FROM public.scan_queue
  WHERE status = 'pending';
  
  -- Count in-progress scans
  SELECT COUNT(*) INTO in_progress_count
  FROM public.scan_queue
  WHERE status = 'processing';
  
  -- Count completed scans today
  SELECT COUNT(*) INTO completed_count
  FROM public.scan_queue
  WHERE status = 'completed'
  AND completed_at >= today_date;
  
  -- Count failed scans today
  SELECT COUNT(*) INTO failed_count
  FROM public.scan_queue
  WHERE status = 'failed'
  AND updated_at >= today_date;
  
  -- Construct the result JSON
  result := json_build_object(
    'pending_scans', pending_count,
    'in_progress_scans', in_progress_count,
    'completed_today', completed_count,
    'failed_today', failed_count
  );
  
  RETURN result;
END;
$$;
