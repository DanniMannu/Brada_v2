import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

//garantir que o .env é carregado ANTES de usar process.env
dotenv.config();

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL não definida no .env");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida no .env");
}

/**
 * Cliente Supabase para BACKEND
 * Usa SEMPRE Service Role Key
 */
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
