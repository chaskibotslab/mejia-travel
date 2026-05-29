'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  if (typeof window !== 'undefined' && url.includes('placeholder')) {
    console.error(
      '%c[Supabase] ⚠️ NEXT_PUBLIC_SUPABASE_URL no fue inyectada en el build. Revisa Railway → Variables y dispara un redeploy.',
      'color:#dc2626;font-weight:bold;font-size:14px'
    );
  }
  return createBrowserClient(url, key);
}
