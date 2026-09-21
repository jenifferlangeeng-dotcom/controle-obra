import { createClient } from '@supabase/supabase-js'

// Chaves entram quando o Supabase do projeto existir (etapa seguinte, com banco).
// Até lá este arquivo fica pronto mas não é importado por nenhuma tela.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
