import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const isBrowser = typeof window !== "undefined";

// O Expo Router também renderiza páginas web no Node. Nesse contexto não há
// `window` nem localStorage; este adaptador evita a falha durante o SSR.
const serverStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => undefined,
  removeItem: async (_key: string) => undefined,
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "A configuração do Supabase está em falta. Define EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no ficheiro .env.",
  );
}

/**
 * Cliente Supabase partilhado pelo app Expo.
 *
 * O AsyncStorage mantém a sessão entre reinícios no Expo Go, evitando que o
 * utilizador tenha de iniciar sessão sempre que fecha a aplicação.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isBrowser ? AsyncStorage : serverStorage,
    autoRefreshToken: isBrowser,
    persistSession: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});
