'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import EventRoute from './EventRoute';
import RouteCountdown from './RouteCountdown';

// Rutas evento que el servidor no pudo mostrar completas:
// - Ocultas (is_published = false): la RLS solo se las devuelve a admins.
// - Programadas (publish_at en el futuro): la RLS solo entrega las paradas a
//   admins hasta esa hora; el público ve la cuenta regresiva.
// La sesión vive en el cliente (igual que el panel admin), así que se resuelve aquí.
export default function RoutePreviewGate({ slug }: { slug: string }) {
  const [state, setState] = useState<'loading' | 'denied' | 'scheduled' | 'ok'>('loading');
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: r } = await supabase.from('tourist_routes').select('*').eq('slug', slug).maybeSingle();
    if (!r || r.display_mode !== 'event') return setState('denied');
    const { data: s } = await supabase
      .from('tourist_route_stops')
      .select('*')
      .eq('route_id', r.id)
      .order('stop_order');
    setRoute(r);
    if (s && s.length > 0) {
      setStops(s);
      setState('ok');
    } else if (r.is_published && r.publish_at) {
      setState('scheduled');
    } else {
      setState('denied');
    }
  }, [slug]);

  useEffect(() => {
    load().catch(() => setState('denied'));
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="py-24 grid place-items-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (state === 'scheduled') {
    return <RouteCountdown route={route} onCheck={() => load().catch(() => {})} />;
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
