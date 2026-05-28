import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CategoryTile from '@/components/CategoryTile';
import HomeHero from '@/components/HomeHero';
import PlaceCard from '@/components/PlaceCard';
import EventCard from '@/components/EventCard';
import { ChevronRight, Calendar, Mountain, Compass, Route, Clock } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  const [
    { data: categoriesData },
    { data: bannersData },
    { data: featuredData },
    { data: eventsData },
    { data: routesData },
  ] = await Promise.all([
    supabase.from('categories').select('*').is('parent_id', null).order('sort_order'),
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('businesses').select('id, slug, name, cover_image, short_description, address, rating_avg, rating_count, is_verified, categories(name_es)').eq('is_published', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('events').select('*').eq('is_published', true).gte('starts_at', new Date().toISOString()).order('starts_at').limit(6),
    supabase.from('tourist_routes').select('*').eq('is_published', true).order('sort_order').limit(4),
  ]);

  const categories = (categoriesData ?? []) as any[];
  const banners = (bannersData ?? []) as any[];
  const featured = (featuredData ?? []) as any[];
  const events = (eventsData ?? []) as any[];
  const routes = (routesData ?? []) as any[];

  return (
    <div className="fade-in">
      <HomeHero banners={banners} />

      {/* Espaciado generoso entre secciones */}
      <div className="mt-10 sm:mt-12 space-y-12 sm:space-y-14">

        {/* LUGARES IMPERDIBLES — carrusel horizontal */}
        {featured.length > 0 && (
          <Section icon={Mountain} title="Lugares imperdibles" subtitle="Atractivos turísticos del cantón" href="/c/turismo">
            <HorizontalScroll>
              {featured.map((b: any) => (
                <div key={b.id} className="snap-start w-60 sm:w-64 flex-shrink-0">
                  <PlaceCard
                    href={`/n/${b.slug}`}
                    name={b.name}
                    image={b.cover_image}
                    short={b.short_description}
                    address={b.address}
                    rating={b.rating_avg}
                    ratingCount={b.rating_count}
                    verified={b.is_verified}
                    size="lg"
                  />
                </div>
              ))}
            </HorizontalScroll>
          </Section>
        )}

        {/* RUTAS TURÍSTICAS */}
        {routes.length > 0 && (
          <Section icon={Route} title="Rutas turísticas" subtitle="Circuitos predefinidos con paradas mapeadas" href="/rutas">
            <HorizontalScroll>
              {routes.map((r: any) => (
                <Link
                  key={r.id}
                  href={`/rutas/${r.slug}`}
                  className="snap-start flex-shrink-0 w-72 group relative h-44 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(120,40,200,0.18)] active:scale-[0.98]"
                >
                  {r.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover_image} alt={r.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${r.color || '#7c3aed'}, ${r.color || '#7c3aed'}cc)` }}>
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/15 rounded-full blur-2xl" />
                      <Route className="absolute right-4 top-4 w-12 h-12 text-white/30" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-extrabold text-base leading-tight drop-shadow">{r.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      {r.duration_hours && (
                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> {r.duration_hours}h
                        </span>
                      )}
                      {r.distance_km && (
                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {r.distance_km} km
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </HorizontalScroll>
          </Section>
        )}

        {/* EVENTOS PRÓXIMOS */}
        {events.length > 0 && (
          <Section icon={Calendar} title="Eventos próximos" subtitle="No te lo pierdas" href="/eventos">
            <HorizontalScroll>
              {events.map((e: any) => (
                <div key={e.id} className="snap-start">
                  <EventCard {...e} />
                </div>
              ))}
            </HorizontalScroll>
          </Section>
        )}

        {/* CATEGORÍAS — compactas */}
        <Section icon={Compass} title="Explora por categoría" subtitle="Todo Mejía en tu bolsillo">
          {categories.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {categories.map((c: any) => (
                <CategoryTile
                  key={c.id}
                  href={`/c/${c.slug}`}
                  label={c.name_es}
                  color={c.color}
                  icon={c.icon}
                  image={c.cover_image}
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Footer */}
      <div className="mt-16 mb-6 text-center text-xs text-slate-400">
        <p>Hecho con 💚 para el Cantón Mejía</p>
        <p className="mt-1">© {new Date().getFullYear()} Mejía Travel</p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, href, children }: any) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-600" />}
            {title}
          </h2>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-0.5 flex-shrink-0">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500">
      <p className="font-semibold mb-1">Aún no hay categorías cargadas</p>
      <p className="text-sm">Ejecuta los SQL de Supabase para ver el contenido.</p>
    </div>
  );
}
