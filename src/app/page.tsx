import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CategoryTile from '@/components/CategoryTile';
import HomeHero from '@/components/HomeHero';
import PlaceCard from '@/components/PlaceCard';
import EventCard from '@/components/EventCard';
import { ChevronRight, Sparkles, Calendar, Mountain, Compass } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  // Cargar en paralelo
  const [
    { data: categoriesData },
    { data: bannersData },
    { data: featuredData },
    { data: eventsData },
    { data: touristData },
  ] = await Promise.all([
    supabase.from('categories').select('*').is('parent_id', null).order('sort_order'),
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('businesses').select('*, categories(name_es, slug)').eq('is_published', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(8),
    supabase.from('events').select('*').eq('is_published', true).gte('starts_at', new Date().toISOString()).order('starts_at').limit(8),
    supabase.from('businesses').select('*, categories!inner(slug, parent_id)').eq('is_published', true).in('categories.slug', ['volcan-cotopaxi','volcanes','aguas-termales','atractivos','miradores','iglesias','parques']).limit(6),
  ]);

  const categories = (categoriesData ?? []) as any[];
  const banners = (bannersData ?? []) as any[];
  const featured = (featuredData ?? []) as any[];
  const events = (eventsData ?? []) as any[];
  const tourist = (touristData ?? []) as any[];

  // Si no hay atractivos turísticos por filtro inner, usar featured como fallback
  const showTourist = tourist.length > 0 ? tourist : featured.slice(0, 4);

  return (
    <div className="fade-in">
      <HomeHero banners={banners} />

      {/* Sección: Atractivos turísticos */}
      <Section
        icon={Mountain}
        title="Lugares imperdibles"
        subtitle="Los atractivos que no te puedes perder"
        href="/c/turismo"
      >
        <div className="grid grid-cols-2 gap-3">
          {showTourist.slice(0, 4).map((b: any) => (
            <PlaceCard
              key={b.id}
              href={`/n/${b.slug}`}
              name={b.name}
              image={b.cover_image}
              short={b.short_description}
              address={b.address}
              rating={b.rating_avg}
              ratingCount={b.rating_count}
              verified={b.is_verified}
              size="md"
            />
          ))}
        </div>
      </Section>

      {/* Sección: Eventos próximos */}
      {events.length > 0 && (
        <Section icon={Calendar} title="Eventos próximos" subtitle="No te quedes fuera de la acción" href="/eventos">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
            {events.map((e: any) => (
              <div key={e.id} className="snap-start">
                <EventCard {...e} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Sección: Destacados */}
      {featured.length > 0 && (
        <Section icon={Sparkles} title="Destacados de la semana" subtitle="Negocios y emprendimientos verificados" href="/buscar">
          <div className="grid grid-cols-2 gap-3">
            {featured.slice(0, 6).map((b: any) => (
              <PlaceCard
                key={b.id}
                href={`/n/${b.slug}`}
                name={b.name}
                image={b.cover_image}
                short={b.short_description}
                address={b.address}
                rating={b.rating_avg}
                ratingCount={b.rating_count}
                verified={b.is_verified}
                badge={b.categories?.name_es}
                size="md"
              />
            ))}
          </div>
        </Section>
      )}

      {/* Sección: Categorías */}
      <Section icon={Compass} title="Explora por categoría" subtitle="Todo el cantón en tu bolsillo">
        {categories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
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

      {/* Footer info */}
      <div className="px-4 mt-8 mb-4 text-center text-xs text-slate-400">
        <p>Hecho con 💚 para el Cantón Mejía</p>
        <p className="mt-1">© {new Date().getFullYear()} Mejía Travel</p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, href, children }: any) {
  return (
    <section className="px-4 mt-6 max-w-3xl sm:mx-auto">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-brand-600" />}
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
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
