
import { supabase } from '@/lib/supabase';

// This file exports the SQL function definition that we need to create in Supabase
// This is just a reference for what we've created in the database

/*
CREATE OR REPLACE FUNCTION delete_all_businesses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM businesses;
END;
$$;
*/

// Helper function to check if the RPC exists
export async function checkDeleteAllBusinessesRpc(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('delete_all_businesses');
    
    if (error && error.message.includes('function "delete_all_businesses" does not exist')) {
      console.error('The delete_all_businesses RPC function does not exist yet.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking RPC:', error);
    return false;
  }
}
