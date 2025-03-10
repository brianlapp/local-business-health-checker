
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = 'https://vsahwqkuojwfeiusyfib.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYWh3cWt1b2p3ZmVpdXN5ZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjY2MjMsImV4cCI6MjA1NzIwMjYyM30.4NRrWYshF6FJl57xprg2fFPiYXBmXFl0ial0Iah7tzM';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
