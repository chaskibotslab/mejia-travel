'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, LogOut, UserCircle, ShieldCheck, Loader2, Mail, KeyRound, Store, Tag, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>}>
      <AccountInner />
    </Suspense>
  );
}

function AccountInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const authError = params.get('auth_error');

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState<string | null>(authError ? `⚠️ ${authError}` : null);
  // Recovery con OTP (código de 6 dígitos por correo, sin links)
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recovery, setRecovery] = useState({ token: '', newPassword: '', confirm: '' });
  const [showRecoveryPwd, setShowRecoveryPwd] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setProfile(p);
    }
    setLoading(false);
  }

  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name, phone: form.phone },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/cuenta`,
        },
      });
      if (error) {
        setMsg(error.message);
      } else if (data.user && (data.user.identities?.length ?? 0) === 0) {
        // Supabase devuelve éxito silencioso cuando el email YA está registrado
        // (para evitar enumeración). Detectamos ese caso por identities vacío.
        setMsg('⚠️ Ese correo ya tiene una cuenta. Inicia sesión o usa "¿Olvidaste tu contraseña?".');
        setMode('signin');
      } else if (data.session) {
        // Auto-confirm activado: el usuario ya está logueado
        router.push(redirect);
      } else {
        setMsg('✉️ Cuenta creada. Revisa tu correo para confirmar antes de iniciar sesión.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) setMsg(error.message);
      else router.push(redirect);
    }
    setBusy(false);
    refresh();
  }

  async function sendMagicLink() {
    if (!form.email) { setMsg('Escribe tu correo primero'); return; }
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/cuenta` },
    });
    if (error) setMsg(error.message);
    else setMsg('✉️ Revisa tu correo y pulsa el enlace para entrar.');
    setBusy(false);
  }

  // Paso 1: envía un código OTP de 6 dígitos al correo del usuario
  async function sendRecoveryCode() {
    if (!form.email) { setMsg('Escribe tu correo primero'); return; }
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(form.email);
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setRecoverySent(true);
    setMsg('🔑 Te enviamos un código a tu correo. Funciona desde cualquier dispositivo.');
  }

  // Paso 2: valida el código y cambia la contraseña
  async function verifyRecoveryAndChange(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) { setMsg('Falta el correo'); return; }
    if (!recovery.token || recovery.token.length < 6) { setMsg('Ingresa el código que recibiste por correo'); return; }
    if (recovery.newPassword.length < 6) { setMsg('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (recovery.newPassword !== recovery.confirm) { setMsg('Las contraseñas no coinciden'); return; }
    setBusy(true); setMsg(null);
    const { error: vErr } = await supabase.auth.verifyOtp({
      email: form.email,
      token: recovery.token.trim(),
      type: 'recovery',
    });
    if (vErr) { setBusy(false); setMsg('Código incorrecto o expirado: ' + vErr.message); return; }
    const { error: uErr } = await supabase.auth.updateUser({ password: recovery.newPassword });
    setBusy(false);
    if (uErr) { setMsg('No se pudo cambiar la contraseña: ' + uErr.message); return; }
    setRecoveryOpen(false);
    setRecoverySent(false);
    setRecovery({ token: '', newPassword: '', confirm: '' });
    setMsg('✅ Contraseña cambiada. Te llevamos a tu cuenta…');
    setTimeout(() => router.push(redirect), 1200);
    refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  if (loading) {
    return (
      <div className="px-4 pt-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="px-4 pt-4 fade-in">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white p-5 shadow-card mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 grid place-items-center text-2xl">
              {(profile?.full_name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{profile?.full_name || 'Usuario'}</p>
              <p className="text-xs text-white/80">{user.email}</p>
              <p className="text-xs text-white/80 capitalize mt-0.5">Rol: {profile?.role || 'user'}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <MenuItem href="/mercado/publicar" icon={Store} label="Vender en el Mercado" highlight />
          <MenuItem href="/cuenta/mis-articulos" icon={Tag} label="Mis publicaciones del mercado" />
          <MenuItem href="/mercado" icon={UserCircle} label="Ver Mercado de Mejía" />
          {profile?.role === 'admin' && (
            <MenuItem href="/admin" icon={ShieldCheck} label="Panel de administración" />
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 text-red-600 shadow-soft"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Cerrar sesión</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold mb-1">
        {mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        {mode === 'signin'
          ? 'Accede para publicar, opinar y guardar favoritos.'
          : 'Únete a Mejía Travel en segundos.'}
      </p>

      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <>
            <input
              required
              placeholder="Nombre completo"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm"
            />
            <input
              placeholder="Teléfono (opcional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm"
            />
          </>
        )}
        <input
          required
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm"
        />
        <div className="relative">
          <input
            required
            type={showPwd ? 'text' : 'password'}
            placeholder="Contraseña"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 bg-white text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {msg && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg">{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand-600 text-white py-3 font-semibold shadow-card flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <LogIn className="w-4 h-4" />
          {busy ? 'Procesando…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="w-full text-center mt-4 text-sm text-brand-600 font-medium"
      >
        {mode === 'signin' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>

      <div className="my-4 flex items-center gap-2 text-xs text-slate-400">
        <div className="h-px bg-slate-200 flex-1" />
        <span>O entra sin contraseña</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <button
        type="button"
        onClick={sendMagicLink}
        disabled={busy}
        className="w-full rounded-xl bg-white border border-slate-200 py-3 font-semibold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-60"
      >
        <Mail className="w-4 h-4 text-fuchsia-600" />
        Enviarme un enlace mágico al correo
      </button>

      {mode === 'signin' && !recoveryOpen && (
        <button
          type="button"
          onClick={() => { setRecoveryOpen(true); setMsg(null); }}
          disabled={busy}
          className="w-full text-center mt-3 text-xs text-slate-500 hover:text-brand-600 flex items-center justify-center gap-1"
        >
          <KeyRound className="w-3 h-3" />
          ¿Olvidaste tu contraseña?
        </button>
      )}

      {recoveryOpen && (
        <div className="mt-5 rounded-2xl border border-fuchsia-200 bg-fuchsia-50/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm flex items-center gap-2"><KeyRound className="w-4 h-4 text-fuchsia-600" /> Recuperar contraseña</h2>
            <button
              type="button"
              onClick={() => { setRecoveryOpen(false); setRecoverySent(false); setRecovery({ token: '', newPassword: '', confirm: '' }); setMsg(null); }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          {!recoverySent ? (
            <>
              <p className="text-xs text-slate-600 mb-3">
                Escribe tu correo arriba y pulsa <b>Enviar código</b>. Te llegará un código numérico
                que podrás ingresar desde <b>cualquier dispositivo</b>.
              </p>
              <button
                type="button"
                onClick={sendRecoveryCode}
                disabled={busy || !form.email}
                className="w-full rounded-xl bg-fuchsia-600 text-white py-2.5 font-semibold disabled:opacity-60 text-sm"
              >
                {busy ? 'Enviando…' : 'Enviar código a mi correo'}
              </button>
            </>
          ) : (
            <form onSubmit={verifyRecoveryAndChange} className="space-y-2.5">
              <p className="text-xs text-slate-600">
                Ingresa el código que recibiste en <b>{form.email}</b> y tu nueva contraseña.
              </p>
              <input
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Código del correo"
                value={recovery.token}
                onChange={(e) => setRecovery({ ...recovery, token: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm tracking-widest text-center font-mono"
              />
              <div className="relative">
                <input
                  required
                  type={showRecoveryPwd ? 'text' : 'password'}
                  placeholder="Nueva contraseña (mín. 6)"
                  minLength={6}
                  value={recovery.newPassword}
                  onChange={(e) => setRecovery({ ...recovery, newPassword: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 bg-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowRecoveryPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  aria-label="Ver contraseña"
                >
                  {showRecoveryPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                required
                type={showRecoveryPwd ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                minLength={6}
                value={recovery.confirm}
                onChange={(e) => setRecovery({ ...recovery, confirm: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-fuchsia-600 text-white py-2.5 font-semibold disabled:opacity-60 text-sm"
              >
                {busy ? 'Verificando…' : 'Cambiar contraseña'}
              </button>
              <button
                type="button"
                onClick={sendRecoveryCode}
                disabled={busy}
                className="w-full text-xs text-fuchsia-700 underline"
              >
                Reenviar código
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, icon: Icon, label, highlight }: { href: string; icon: any; label: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-soft hover:shadow-card ${highlight ? 'bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0' : 'bg-white border border-slate-200'}`}
    >
      <Icon className={`w-5 h-5 ${highlight ? 'text-white' : 'text-brand-600'}`} />
      <span className="font-semibold flex-1">{label}</span>
      <span className={highlight ? 'text-white/70' : 'text-slate-300'}>›</span>
    </Link>
  );
}
