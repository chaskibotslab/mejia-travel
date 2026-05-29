import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Maneja el redirect de Supabase después de confirmar email o magic link.
// Supabase envía ?code=... y aquí lo intercambiamos por una sesión válida.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/cuenta';

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
