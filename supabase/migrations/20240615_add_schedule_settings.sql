
-- Add new columns to automation_settings table
ALTER TABLE IF EXISTS public.automation_settings 
ADD COLUMN IF NOT EXISTS scan_hour integer NOT NULL DEFAULT 3,
ADD COLUMN IF NOT EXISTS scan_frequency text NOT NULL DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS batch_size integer NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS retry_failed boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS max_retries integer NOT NULL DEFAULT 3;

-- Create or replace the updated function to handle the new scheduling options
CREATE OR REPLACE FUNCTION public.update_next_scan_time()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _scan_hour integer;
    _scan_frequency text;
    _next_scan timestamp with time zone;
BEGIN
    -- Get the current schedule settings
    SELECT scan_hour, scan_frequency 
    INTO _scan_hour, _scan_frequency
    FROM public.automation_settings
    LIMIT 1;
    
    -- Calculate the next scan date based on frequency
    CASE _scan_frequency
        WHEN 'daily' THEN
            -- If current hour is past the scan hour, move to next day
            IF EXTRACT(HOUR FROM NOW()) >= _scan_hour THEN
                _next_scan := (NOW() + INTERVAL '1 day')::date + (_scan_hour * INTERVAL '1 hour');
            ELSE
                _next_scan := NOW()::date + (_scan_hour * INTERVAL '1 hour');
            END IF;
            
        WHEN 'weekly' THEN
            -- Set to next Monday at the specified hour
            _next_scan := NOW();
            -- Add days until we reach Monday (1 = Monday in PostgreSQL)
            WHILE EXTRACT(DOW FROM _next_scan) != 1 LOOP
                _next_scan := _next_scan + INTERVAL '1 day';
            END LOOP;
            -- Set the correct hour
            _next_scan := _next_scan::date + (_scan_hour * INTERVAL '1 hour');
            -- If today is Monday and current hour is before scan hour, use today
            IF EXTRACT(DOW FROM NOW()) = 1 AND EXTRACT(HOUR FROM NOW()) < _scan_hour THEN
                _next_scan := NOW()::date + (_scan_hour * INTERVAL '1 hour');
            -- If today is Monday and current hour is past scan hour, use next Monday
            ELSIF EXTRACT(DOW FROM NOW()) = 1 AND EXTRACT(HOUR FROM NOW()) >= _scan_hour THEN
                _next_scan := (NOW() + INTERVAL '7 days')::date + (_scan_hour * INTERVAL '1 hour');
            END IF;
            
        WHEN 'biweekly' THEN
            -- For simplicity, set to next Monday then add 7 more days
            _next_scan := NOW();
            -- Add days until we reach Monday (1 = Monday in PostgreSQL)
            WHILE EXTRACT(DOW FROM _next_scan) != 1 LOOP
                _next_scan := _next_scan + INTERVAL '1 day';
            END LOOP;
            -- Add another week to make it biweekly
            _next_scan := _next_scan + INTERVAL '7 days';
            -- Set the correct hour
            _next_scan := _next_scan::date + (_scan_hour * INTERVAL '1 hour');
            
        WHEN 'monthly' THEN
            -- Set to 1st of next month at the specified hour
            IF EXTRACT(DAY FROM NOW()) = 1 AND EXTRACT(HOUR FROM NOW()) < _scan_hour THEN
                -- If today is 1st and before scan hour, use today
                _next_scan := NOW()::date + (_scan_hour * INTERVAL '1 hour');
            ELSE
                -- Otherwise, use 1st of next month
                _next_scan := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::date + 
                             (_scan_hour * INTERVAL '1 hour');
            END IF;
            
        ELSE
            -- Default to daily
            IF EXTRACT(HOUR FROM NOW()) >= _scan_hour THEN
                _next_scan := (NOW() + INTERVAL '1 day')::date + (_scan_hour * INTERVAL '1 hour');
            ELSE
                _next_scan := NOW()::date + (_scan_hour * INTERVAL '1 hour');
            END IF;
    END CASE;
    
    -- Update the automation settings
    UPDATE public.automation_settings
    SET 
        next_scheduled_scan = _next_scan,
        updated_at = NOW();
END;
$$;

-- Create or replace the toggle function to work with new schedule settings
CREATE OR REPLACE FUNCTION public.toggle_scanning_schedule(enabled_param boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _scan_hour integer;
BEGIN
    -- Get the current scan hour
    SELECT scan_hour INTO _scan_hour FROM public.automation_settings LIMIT 1;
    
    -- Update the automation settings
    UPDATE public.automation_settings
    SET 
        scanning_enabled = enabled_param,
        next_scheduled_scan = CASE 
            WHEN enabled_param THEN
                CASE 
                    WHEN EXTRACT(HOUR FROM NOW()) >= _scan_hour 
                    THEN (NOW() + INTERVAL '1 day')::date + (_scan_hour * INTERVAL '1 hour')
                    ELSE NOW()::date + (_scan_hour * INTERVAL '1 hour')
                END
            ELSE NULL 
        END,
        updated_at = NOW();
    
    -- Return the new enabled status
    RETURN enabled_param;
END;
$$;
