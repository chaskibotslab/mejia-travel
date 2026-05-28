import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import { Clock, Mountain, MapPin, Compass, ChevronRight } from 'lucide-react';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false });

export const revalidate = 60;

export default async function TouristRoutePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: route } = await supabase
    .from('tourist_routes')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!route) notFound();

  const { data: stopsData } = await supabase
    .from('tourist_route_stops')
    .select('*')
    .eq('route_id', route.id)
    .order('stop_order');

  const stops = (stopsData ?? []) as any[];
  const totalTime = stops.reduce((acc, s) => acc + (s.estimated_time_min ?? 0), 0);

  return (
    <div className="fade-in -mx-4 -mt-4">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        {route.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={route.cover_image} alt={route.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 text-white/90">
            <Compass className="w-3.5 h-3.5" />
            Ruta turística
          </div>
          <h1 className="text-3xl font-extrabold drop-shadow-lg">{route.name}</h1>
          <div className="flex items-center gap-3 mt-3 text-xs">
            {route.duration_hours && (
              <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" /> {route.duration_hours}h
              </span>
            )}
            {route.distance_km && (
              <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Mountain className="w-3 h-3" /> {route.distance_km} km
              </span>
            )}
            <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {stops.length} paradas
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 pt-6 space-y-8">
        {/* Descripción */}
        {route.description && (
          <section>
            <p className="text-sm text-slate-700 leading-relaxed">{route.description}</p>
          </section>
        )}

        {/* Mapa con polyline */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-fuchsia-600" />
            Recorrido en el mapa
          </h2>
          <RouteMap stops={stops} color={route.color || '#7c3aed'} height="380px" />
        </section>

        {/* Lista de paradas */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-fuchsia-600" />
            Paradas del recorrido
            {totalTime > 0 && (
              <span className="ml-auto text-xs font-medium text-slate-400">
                Total estimado: {Math.floor(totalTime / 60)}h {totalTime % 60}min
              </span>
            )}
          </h2>

          <ol className="relative space-y-4 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-fuchsia-400 before:via-purple-500 before:to-indigo-500">
            {stops.map((s, i) => (
              <li key={s.id} className="relative pl-12">
                {/* Número */}
                <div
                  className="absolute left-0 top-1 w-9 h-9 rounded-full text-white font-extrabold text-sm grid place-items-center shadow-lg border-2 border-white"
                  style={{ background: route.color || '#7c3aed' }}
                >
                  {s.stop_order}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 leading-tight">{s.name}</h3>
                    {s.estimated_time_min > 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        {s.estimated_time_min} min
                      </span>
                    )}
                  </div>
                  {s.description && <p className="text-xs text-slate-500 mt-1.5">{s.description}</p>}

                  {s.business_slug && (
                    <Link
                      href={`/n/${s.business_slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 mt-2.5"
                    >
                      Ver lugar <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}

                  {/* Botón cómo llegar */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 mt-1 ml-3"
                  >
                    <MapPin className="w-3 h-3" /> Cómo llegar
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Cerrar */}
        <div className="text-center pt-4 pb-2">
          <Link href="/rutas" className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700">
            ← Ver todas las rutas
          </Link>
        </div>
      </div>
    </div>
  );
}
