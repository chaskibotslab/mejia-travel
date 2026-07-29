'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Store, Users, Bus, Tags, Calendar, ShoppingBag, Image as ImageIcon, Megaphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminHome() {
  const supabase = createClient();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const tables = ['businesses', 'professionals', 'transport_cooperatives', 'categories', 'events', 'marketplace_items', 'banners'];
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).select('*', { count: 'exact', head: true }))
      );
      const c: Record<string, number> = {};
      tables.forEach((t, i) => (c[t] = results[i].count ?? 0));
      setCounts(c);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    { href: '/admin/categorias',    label: 'Categorías',    icon: Tags,         count: counts.categories,             color: 'bg-amber-500' },
    { href: '/admin/negocios',      label: 'Negocios',      icon: Store,        count: counts.businesses,             color: 'bg-brand-600' },
    { href: '/admin/profesionales', label: 'Profesionales', icon: Users,        count: counts.professionals,          color: 'bg-purple-600' },
    { href: '/admin/cooperativas',  label: 'Cooperativas',  icon: Bus,          count: counts.transport_cooperatives, color: 'bg-emerald-600' },
    { href: '/admin/candidatos/nuevo', label: 'Candidatos', icon: Megaphone,     count: null,                           color: 'bg-indigo-600' },
    { href: '/admin/eventos',       label: 'Eventos',       icon: Calendar,     count: counts.events,                 color: 'bg-rose-600' },
    { href: '/admin/mercado',       label: 'Mercado',       icon: ShoppingBag,  count: counts.marketplace_items,      color: 'bg-orange-500' },
    { href: '/admin/banners',       label: 'Banners',       icon: ImageIcon,    count: counts.banners,                color: 'bg-cyan-600' },
  ];

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold mb-3">Panel de administración</h1>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map(({ href, label, icon: Icon, count, color }) => (
            <Link key={href} href={href} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-soft active:scale-[0.98] transition">
              <div className={`w-9 h-9 rounded-xl ${color} text-white grid place-items-center mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{count ?? 0}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
