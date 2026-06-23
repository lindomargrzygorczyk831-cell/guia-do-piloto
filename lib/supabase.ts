import { createBrowserClient } from '@supabase/ssr'

// Puxa as chaves que salvamos no arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cria o cliente de conexão que usaremos em todo o projeto
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)