'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Prioridad: 1) runtime inyectado en HTML por layout.tsx, 2) build-time env var, 3) placeholder
  const runtimeUrl = typeof window !== 'undefined' ? (window as any).__SUPABASE_URL__ : '';
  const runtimeKey = typeof window !== 'undefined' ? (window as any).__SUPABASE_ANON__ : '';
  const url = runtimeUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = runtimeKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createBrowserClient(url, key);
}
