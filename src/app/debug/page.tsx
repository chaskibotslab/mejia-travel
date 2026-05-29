// Página de diagnóstico — ver qué env vars llegaron al build.
// Acceder a /debug
export const dynamic = 'force-dynamic';

export default function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '(no definida)';
  const anonLen = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '(no definida)';
  const ok = !url.includes('placeholder') && anonLen > 50;

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 13 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>🔧 Diagnóstico de variables</h1>

      <div style={{ padding: 16, borderRadius: 12, background: ok ? '#dcfce7' : '#fee2e2', marginBottom: 16 }}>
        <strong style={{ fontSize: 16 }}>{ok ? '✅ Variables OK' : '❌ Variables FALTANTES en el build'}</strong>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}><b>NEXT_PUBLIC_SUPABASE_URL</b></td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0', wordBreak: 'break-all' }}>{url}</td></tr>
          <tr><td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}><b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b></td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{anonLen > 0 ? `(longitud: ${anonLen} chars)` : '(no definida)'}</td></tr>
          <tr><td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}><b>NEXT_PUBLIC_SITE_URL</b></td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{siteUrl}</td></tr>
          <tr><td style={{ padding: 8 }}><b>Build time</b></td>
              <td style={{ padding: 8 }}>{new Date().toISOString()}</td></tr>
        </tbody>
      </table>

      {!ok && (
        <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 12 }}>
          <p><b>Si ves &quot;placeholder&quot; o &quot;no definida&quot;:</b></p>
          <ol>
            <li>Las variables NO llegaron al build de Railway.</li>
            <li>Verifica que en Railway → Variables están escritas exactamente:
              <ul>
                <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              </ul>
            </li>
            <li>Dispara un nuevo deploy desde Railway (Deployments → último → Redeploy).</li>
          </ol>
        </div>
      )}
    </div>
  );
}
