import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Reconstruye el origin público real detrás de un proxy (Railway, Vercel, etc.).
// `request.url` en muchos hostings trae la URL interna (http://localhost:PORT),
// por lo que hay que leer los headers x-forwarded-* o el Host original.
function publicOrigin(request: Request): string {
  const headers = request.headers;
  const fwdProto = headers.get('x-forwarded-proto');
  const fwdHost = headers.get('x-forwarded-host');
  const host = headers.get('host');
  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

  // 1) Si los proxies pasan x-forwarded-host con el dominio público, úsalo
  if (fwdHost) {
    const proto = fwdProto || 'https';
    return `${proto}://${fwdHost}`;
  }

  // 2) Si el Host header viene con un dominio externo (no localhost), úsalo
  if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    const proto = fwdProto || 'https';
    return `${proto}://${host}`;
  }

  // 3) Fallback al env var (configurada en Railway/Vercel)
  if (envSite) return envSite;

  // 4) Último recurso: lo que diga request.url (puede ser localhost en dev)
  return new URL(request.url).origin;
}

// Maneja el redirect de Supabase tras confirmar email, magic link o recovery.
// Supabase envía ?code=... (PKCE) y aquí lo intercambiamos por una sesión válida
// que queda guardada en cookies. Después redirigimos al destino.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
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
      // PKCE error: el enlace se abrió en otro navegador/dispositivo
      const isPKCE = error.message.includes('PKCE') || error.message.includes('code verifier');
      const url = new URL('/cuenta', origin);
      url.searchParams.set(
        'auth_error',
        isPKCE
          ? 'El enlace debe abrirse en el mismo navegador donde lo solicitaste. Usa el código de 6 dígitos del correo en su lugar.'
          : error.message
      );
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
