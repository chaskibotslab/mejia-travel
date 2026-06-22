import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Maneja el redirect de Supabase tras confirmar email, magic link o recovery.
// Supabase envía ?code=... (PKCE) y aquí lo intercambiamos por una sesión válida
// que queda guardada en cookies. Después redirigimos al destino.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/cuenta';

  // Supabase también puede mandar errores directos sin code
  if (errorParam) {
    const url = new URL('/cuenta', origin);
    url.searchParams.set('auth_error', errorDesc ?? errorParam);
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL('/cuenta', origin);
      url.searchParams.set('auth_error', error.message);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
