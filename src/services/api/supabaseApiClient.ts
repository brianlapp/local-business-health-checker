
import { supabase } from '@/lib/supabase';

/**
 * Wrapper for Supabase Edge Function invocation
 * Provides type-safe interface to edge functions
 */
export async function invokeEdgeFunction<T = any, U = any>(
  functionName: string, 
  payload: T
): Promise<{ data: U | null; error: Error | null }> {
  try {
    console.log(`Invoking edge function: ${functionName}`, payload);
    const response = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    if (response.error) {
      console.error(`Edge function error (${functionName}):`, response.error);
    }
    
    return response;
  } catch (error) {
    console.error(`Failed to invoke edge function ${functionName}:`, error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
