'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, LogOut, UserCircle, ShieldCheck, Loader2, Mail, KeyRound, Store, Tag } from 'lucide-react';
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

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name, phone: form.phone } },
      });
      if (error) setMsg(error.message);
      else setMsg('Cuenta creada. Revisa tu correo para confirmar.');
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
      options: { emailRedirectTo: `${window.location.origin}/cuenta` },
    });
    if (error) setMsg(error.message);
    else setMsg('✉️ Revisa tu correo y pulsa el enlace para entrar.');
    setBusy(false);
  }

  async function sendPasswordReset() {
    if (!form.email) { setMsg('Escribe tu correo primero'); return; }
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/cuenta`,
    });
    if (error) setMsg(error.message);
    else setMsg('🔑 Te enviamos un correo para restablecer tu contraseña.');
    setBusy(false);
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
        <input
          required
          type="password"
          placeholder="Contraseña"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm"
        />

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

      {mode === 'signin' && (
        <button
          type="button"
          onClick={sendPasswordReset}
          disabled={busy}
          className="w-full text-center mt-3 text-xs text-slate-500 hover:text-brand-600 flex items-center justify-center gap-1"
        >
          <KeyRound className="w-3 h-3" />
          ¿Olvidaste tu contraseña?
        </button>
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
