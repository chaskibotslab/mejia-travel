'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * Página de cambio de contraseña tras hacer click en el correo de recuperación.
 *
 * Flujo:
 *  1. El correo de Supabase trae un token en el hash de la URL (#access_token=…&type=recovery).
 *  2. supabase-js procesa automáticamente ese hash al cargar y dispara el evento
 *     onAuthStateChange con event === 'PASSWORD_RECOVERY'.
 *  3. Ese evento nos da una sesión temporal para llamar a updateUser({ password }).
 */
export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 1) Escuchamos el evento de recovery / sign-in
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(true);
      }
    });
    // 2) Sondeamos la sesión durante ~3s por si la cookie tarda en propagarse
    (async () => {
      for (let i = 0; i < 6; i++) {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) { setHasSession(true); break; }
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [supabase]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.push('/cuenta'), 1800);
  }

  return (
    <div className="px-4 pt-8 pb-10 max-w-md mx-auto">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white grid place-items-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cambiar contraseña</h1>
            <p className="text-xs text-slate-500">Mejía Travel</p>
          </div>
        </div>

        {!ready ? (
          <div className="py-8 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : done ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">¡Contraseña actualizada!</p>
              <p>Te llevamos a tu cuenta…</p>
            </div>
          </div>
        ) : !hasSession ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900 text-sm flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-semibold">Enlace inválido o expirado</p>
              <p>El link de recuperación solo funciona durante poco tiempo. Vuelve a la pantalla de inicio de sesión y pide otro correo.</p>
              <button onClick={() => router.push('/cuenta')} className="underline font-semibold">Ir a iniciar sesión</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-slate-600">Escribe tu nueva contraseña. Mínimo 6 caracteres.</p>
            <label className="block">
              <span className="block text-xs font-semibold text-slate-600 mb-1">Nueva contraseña</span>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm"
                  autoFocus
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-slate-600 mb-1">Confirmar contraseña</span>
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Cambiar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
