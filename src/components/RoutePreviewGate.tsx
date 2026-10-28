'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import EventRoute from './EventRoute';

// Vista previa de rutas ocultas (is_published = false) para admins.
// La sesión vive en el cliente (igual que el panel admin), así que la
// verificación se hace aquí. La RLS solo devuelve rutas ocultas a admins.
export default function RoutePreviewGate({ slug }: { slug: string }) {
  const [state, setState] = useState<'loading' | 'denied' | 'ok'>('loading');
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setState('denied');
      const { data: p } = await supabase.from('profiles').select('role').eq('id', u.user.id).single();
      if (p?.role !== 'admin') return setState('denied');

      const { data: r } = await supabase.from('tourist_routes').select('*').eq('slug', slug).maybeSingle();
      if (!r || r.display_mode !== 'event') return setState('denied');
      const { data: s } = await supabase
        .from('tourist_route_stops')
        .select('*')
        .eq('route_id', r.id)
        .order('stop_order');
      setRoute(r);
      setStops(s ?? []);
      setState('ok');
    })().catch(() => setState('denied'));
  }, [slug]);

  if (state === 'loading') {
    return (
      <div className="py-24 grid place-items-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="py-20 text-center">
        <p className="text-5xl mb-3">🧭</p>
        <h1 className="text-xl font-extrabold text-slate-900">Ruta no encontrada</h1>
        <p className="text-sm text-slate-500 mt-1">Puede que ya no esté disponible.</p>
        <Link href="/rutas" className="inline-block mt-5 text-sm font-bold text-fuchsia-600">
          ← Ver todas las rutas
        </Link>
      </div>
    );
  }

  return <EventRoute route={route} stops={stops} />;
}
