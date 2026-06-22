// Página de diagnóstico — ver qué env vars llegaron al build
// y qué Site URL tiene Supabase configurado realmente.
// Acceder a /debug
export const dynamic = 'force-dynamic';

async function fetchSupabaseSettings(url: string) {
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
      cache: 'no-store',
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const data = await res.json();
    return { data };
  } catch (e: any) {
    return { error: e?.message || 'unknown error' };
  }
}

export default async function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '(no definida)';
  const anonLen = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '(no definida)';
  const ok = !url.includes('placeholder') && anonLen > 50;

  const settings = ok ? await fetchSupabaseSettings(url) : { error: 'sin URL válida' };
  const supabaseSiteUrl = (settings as any).data?.site_url || (settings as any).data?.SITE_URL || '(no recibido)';
  const siteUrlOk = typeof supabaseSiteUrl === 'string' && supabaseSiteUrl.includes('mejia.chaskibots.com');

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 13 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>🔧 Diagnóstico Mejía Travel</h1>

      <div style={{ padding: 16, borderRadius: 12, background: ok ? '#dcfce7' : '#fee2e2', marginBottom: 16 }}>
        <strong style={{ fontSize: 16 }}>{ok ? '✅ Variables OK' : '❌ Variables FALTANTES en el build'}</strong>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 16 }}>Variables de Railway</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}><b>NEXT_PUBLIC_SUPABASE_URL</b></td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0', wordBreak: 'break-all' }}>{url}</td></tr>
          <tr><td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}><b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b></td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{anonLen > 0 ? `(longitud: ${anonLen} chars)` : '(no definida)'}</td></tr>
          <tr><td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}><b>NEXT_PUBLIC_SITE_URL</b></td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{siteUrl}</td></tr>
          <tr><td style={{ padding: 8 }}><b>Request time</b></td>
              <td style={{ padding: 8 }}>{new Date().toISOString()}</td></tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Site URL REAL en Supabase</h2>
      <div style={{ padding: 16, borderRadius: 12, background: siteUrlOk ? '#dcfce7' : '#fee2e2', marginBottom: 16 }}>
        <p style={{ margin: 0 }}><b>Site URL guardado en Supabase:</b></p>
        <p style={{ margin: '8px 0', fontSize: 16, wordBreak: 'break-all' }}>
          <code>{String(supabaseSiteUrl)}</code>
        </p>
        {(settings as any).error && (
          <p style={{ color: '#991b1b' }}>Error al consultar: {(settings as any).error}</p>
        )}
        <p style={{ margin: 0, marginTop: 8 }}>
          {siteUrlOk
            ? '✅ Es el correcto, los correos deberían usar este dominio.'
            : '❌ Esto NO es mejia.chaskibots.com — ve a Supabase → Authentication → URL Configuration y cámbialo.'}
        </p>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Datos crudos de /auth/v1/settings</h2>
      <pre style={{ padding: 12, background: '#0f172a', color: '#e2e8f0', borderRadius: 8, overflow: 'auto', fontSize: 11 }}>
        {JSON.stringify(settings, null, 2)}
      </pre>
    </div>
  );
}
