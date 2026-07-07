import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Durante el build, si las variables no están configuradas, usar placeholders sintácticamente válidos
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-ref.supabase.co';
const finalAnonKey = supabaseAnonKey || 'placeholder-anon-key';
const finalServiceKey = supabaseServiceKey || 'placeholder-service-key';

if (!supabaseUrl) {
  console.warn('Advertencia: NEXT_PUBLIC_SUPABASE_URL no está configurada o es inválida.');
}

// Cliente público estándar
export const supabase = createClient(finalUrl, finalAnonKey);

// Cliente administrador para operaciones en servidor
export const supabaseAdmin = createClient(finalUrl, finalServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
