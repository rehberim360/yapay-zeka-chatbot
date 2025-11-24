import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the current working directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Loading Supabase Client...');
console.log('CWD:', process.cwd());
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_KEY exists:', !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('FATAL: Missing Supabase environment variables.');
    console.error('Please ensure .env file exists in', process.cwd());
    throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client with optimized configuration
 * Requirements: 14.4 - Database connection pooling (max 20)
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false, // Server-side, no need to persist
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-application-name': 'smart-onboarding-v2',
    },
  },
  // Connection pooling is handled by Supabase's underlying PostgreSQL connection
  // The max connections are configured on the Supabase project settings
  // Default is typically 15-20 connections for the connection pool
});
