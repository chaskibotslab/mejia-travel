'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck, LayoutDashboard, Store, Users, Bus, Tags, Calendar, ShoppingBag, Image as ImageIcon, Settings, Route } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/admin',                 label: 'Resumen',        icon: LayoutDashboard },
  { href: '/admin/categorias',      label: 'Categorías',     icon: Tags },
  { href: '/admin/negocios',        label: 'Negocios',       icon: Store },
  { href: '/admin/profesionales',   label: 'Profesionales',  icon: Users },
  { href: '/admin/cooperativas',    label: 'Cooperativas',   icon: Bus },
  { href: '/admin/eventos',         label: 'Eventos',        icon: Calendar },
  { href: '/admin/rutas',           label: 'Rutas turísticas', icon: Route },
  { href: '/admin/mercado',         label: 'Mercado',        icon: ShoppingBag },
  { href: '/admin/banners',         label: 'Banners',        icon: ImageIcon },
  { href: '/admin/ajustes',         label: 'Ajustes',        icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.push('/cuenta?redirect=' + encodeURIComponent(pathname));
        return;
      }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', u.user.id).single();
      setAuthorized(p?.role === 'admin');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authorized === null) {
    return <div className="px-4 pt-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;
  }
  if (authorized === false) {
    return (
      <div className="px-4 pt-10 text-center">
        <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold">No tienes permisos de administrador</p>
        <p className="text-sm text-slate-500">Pide a un admin que actualice tu rol.</p>
      </div>
    );
  }

  return (
    <div>
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 px-2 py-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                  active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </div>
  );
}
