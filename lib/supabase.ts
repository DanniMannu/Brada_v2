/*import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);*/

import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://jznsruuokfgdtvgrgphj.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bnNydXVva2ZnZHR2Z3JncGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDEzNzEsImV4cCI6MjA5Mzk3NzM3MX0.MC2RdPIU04ACWt10sgI-z_z5pCUJu9EN-nyWNSHzT88";

export const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );