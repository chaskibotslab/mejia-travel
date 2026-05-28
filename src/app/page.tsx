import { createClient } from '@/lib/supabase/server';
import CategoryTile from '@/components/CategoryTile';
import HeroBanner from '@/components/HeroBanner';
import WeatherWidget from '@/components/WeatherWidget';
import type { Category } from '@/lib/types';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('sort_order');

  const categories = (data ?? []) as Category[];

  return (
    <div className="px-4 pt-4 fade-in">
      <HeroBanner />
      <WeatherWidget />

      <h2 className="mt-6 mb-3 text-lg font-bold text-slate-800 px-1">
        Explora el Cantón Mejía
      </h2>

      {categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((c) => (
            <CategoryTile
              key={c.id}
              href={`/c/${c.slug}`}
              label={c.name_es}
              color={c.color}
              icon={c.icon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500">
      <p className="font-semibold mb-1">Aún no hay categorías cargadas</p>
      <p className="text-sm">
        Conecta Supabase y ejecuta <code className="bg-slate-100 px-1 rounded">supabase/schema.sql</code> y{' '}
        <code className="bg-slate-100 px-1 rounded">supabase/seed.sql</code>.
      </p>
    </div>
  );
}
