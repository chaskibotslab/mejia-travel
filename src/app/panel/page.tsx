'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Phone, MessageCircle, Edit3, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function OwnerPanelPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/cuenta?redirect=/panel');
        return;
      }
      // Solo admins pueden acceder al panel de negocios
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role !== 'admin') {
        router.push('/cuenta');
        return;
      }
      setUser(data.user);
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      setBusinesses(biz ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Mi panel de negocio</h1>
          <p className="text-xs text-slate-500">Gestiona tus emprendimientos</p>
        </div>
        <Link
          href="/panel/nuevo"
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-3 py-2 text-sm font-semibold shadow-card"
        >
          <Plus className="w-4 h-4" /> Agregar
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500">
          <p className="font-semibold mb-1">Aún no tienes negocios registrados</p>
          <p className="text-sm mb-4">Registra tu emprendimiento y aparece en Mejía Travel.</p>
          <Link
            href="/panel/nuevo"
            className="inline-block rounded-xl bg-brand-600 text-white px-4 py-2 font-semibold"
          >
            Registrar negocio
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {businesses.map((b) => (
            <li
              key={b.id}
              className="rounded-2xl bg-white border border-slate-200 p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{b.name}</h3>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        b.is_published
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {b.is_published ? 'Publicado' : 'Borrador'}
                    </span>
                    {b.is_verified && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        ✓ Verificado
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                      {b.plan}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/panel/editar/${b.id}`}
                  className="p-2 rounded-lg hover:bg-slate-100"
                  aria-label="Editar"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <Stat icon={Eye} label="Vistas" value={b.views_count} />
                <Stat icon={Phone} label="Llamadas" value={b.calls_count} />
                <Stat icon={MessageCircle} label="WhatsApp" value={b.whatsapp_count} />
              </div>

              {b.is_published && (
                <Link
                  href={`/n/${b.slug}`}
                  className="block text-center text-sm text-brand-600 font-medium mt-3"
                >
                  Ver perfil público →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 text-center">
      <Icon className="w-4 h-4 mx-auto text-slate-500 mb-0.5" />
      <div className="text-lg font-bold leading-none">{value || 0}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
