'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Prioridad: 1) runtime inyectado en HTML por layout.tsx, 2) build-time env var, 3) placeholder
  const runtimeUrl = typeof window !== 'undefined' ? (window as any).__SUPABASE_URL__ : '';
  const runtimeKey = typeof window !== 'undefined' ? (window as any).__SUPABASE_ANON__ : '';
  const url = runtimeUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = runtimeKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  // Auto-recovery: si por algún motivo (SW viejo, HTML estale) caemos al placeholder,
  // limpiamos SW + caches y recargamos una sola vez para volver a pedir HTML fresco.
  if (typeof window !== 'undefined' && url.includes('placeholder.supabase.co')) {
    const KEY = '__mtravel_sw_recovered';
    if (!sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, '1');
      (async () => {
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } finally {
          window.location.reload();
        }
      })();
    }
  }

  return createBrowserClient(url, key);
}
