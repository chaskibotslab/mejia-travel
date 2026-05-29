import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Clock, Mountain, Route, ChevronRight } from 'lucide-react';
import SafeImage from '@/components/SafeImage';

export const revalidate = 60;

const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: 'bg-emerald-100 text-emerald-700' },
  media: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
  dificil: { label: 'Difícil', color: 'bg-rose-100 text-rose-700' },
};

export default async function RoutesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('tourist_routes')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  const routes = (data ?? []) as any[];

  return (
    <div className="fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-fuchsia-600 text-xs font-bold uppercase tracking-wider mb-2">
          <Route className="w-4 h-4" />
          Rutas turísticas
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Descubre Mejía en circuitos
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          Rutas predefinidas con paradas mapeadas para que aproveches al máximo tu visita al cantón.
        </p>
      </header>

      {routes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-500">
          <p className="font-semibold mb-1">Aún no hay rutas publicadas</p>
          <p className="text-sm">Ejecuta el SQL <code className="bg-slate-100 px-1 rounded">tourist_routes.sql</code>.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((r) => {
            const diff = DIFFICULTY_LABEL[r.difficulty] ?? DIFFICULTY_LABEL.facil;
            return (
              <Link
                key={r.id}
                href={`/rutas/${r.slug}`}
                className="block group relative overflow-hidden rounded-3xl shadow-[0_8px_24px_rgba(120,40,200,0.15)] active:scale-[0.98] hover:scale-[1.01] transition-transform"
              >
                {/* Imagen de fondo */}
                <div className="relative h-56 overflow-hidden bg-slate-200">
                  <SafeImage
                    src={r.cover_image}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    fallback={
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${r.color || '#7c3aed'}, ${r.color || '#7c3aed'}cc)` }}>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
                        <Route className="absolute right-6 top-6 w-20 h-20 text-white/25" strokeWidth={1.5} />
                      </div>
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Badge dificultad */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${diff.color}`}>
                      {diff.label}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h2 className="text-2xl font-extrabold leading-tight drop-shadow-lg">{r.name}</h2>
                    {r.short_description && (
                      <p className="text-sm text-white/90 mt-1 drop-shadow line-clamp-2">{r.short_description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-white/95">
                      {r.duration_hours && (
                        <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {r.duration_hours}h
                        </span>
                      )}
                      {r.distance_km && (
                        <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Mountain className="w-3 h-3" />
                          {r.distance_km} km
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-0.5 font-bold">
                        Explorar <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
