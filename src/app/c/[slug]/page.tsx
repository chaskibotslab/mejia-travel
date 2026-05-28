import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Phone, MessageCircle, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import CategoryTile from '@/components/CategoryTile';
import type { Category, Business, Professional, TransportCooperative } from '@/lib/types';
import { telLink, waLink, mapLink } from '@/lib/utils';

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!category) notFound();

  // 1) Si tiene subcategorías → grid de subcategorías
  const { data: subs } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', category.id)
    .order('sort_order');

  const subList = (subs ?? []) as Category[];

  if (subList.length > 0) {
    return (
      <div className="px-4 pt-4 fade-in">
        <h1 className="text-xl font-bold text-slate-800 mb-3">{category.name_es}</h1>
        {category.description && (
          <p className="text-sm text-slate-500 mb-3">{category.description}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {subList.map((c) => (
            <CategoryTile
              key={c.id}
              href={`/c/${c.slug}`}
              label={c.name_es}
              color={c.color}
              icon={c.icon}
            />
          ))}
        </div>
      </div>
    );
  }

  // 2) Sin subcategorías → según listing_mode
  const mode = category.listing_mode || 'businesses';

  if (mode === 'professionals') {
    const { data } = await supabase
      .from('professionals')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('sort_order');
    const items = (data ?? []) as Professional[];

    return (
      <div className="px-4 pt-4 fade-in">
        <h1 className="text-xl font-bold text-slate-800 mb-3">{category.name_es}</h1>
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm">Aún no hay profesionales registrados.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.id} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-soft">
                <div className="flex items-center gap-3 mb-2">
                  {p.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo} alt={p.full_name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full grid place-items-center text-white font-bold" style={{ background: category.color || '#5B4BB8' }}>
                      {p.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{p.full_name}</h3>
                    {p.profession && <p className="text-xs text-slate-500 truncate">{p.profession}</p>}
                  </div>
                </div>
                {p.bio && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{p.bio}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {p.phone && (
                    <a href={telLink(p.phone)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      <Phone className="w-3 h-3" /> Llamar
                    </a>
                  )}
                  {p.whatsapp && (
                    <a href={waLink(p.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  )}
                  {p.facebook && (
                    <a href={p.facebook} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Facebook</a>
                  )}
                  {p.latitude && p.longitude && (
                    <a href={mapLink(p.latitude, p.longitude)} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      <MapPin className="w-3 h-3" /> Mapa
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (mode === 'cooperatives') {
    const { data } = await supabase
      .from('transport_cooperatives')
      .select('*')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('sort_order');
    const items = (data ?? []) as TransportCooperative[];

    return (
      <div className="px-4 pt-4 fade-in">
        <h1 className="text-xl font-bold text-slate-800 mb-3">{category.name_es}</h1>
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm">Aún no hay cooperativas registradas.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((co) => (
              <li key={co.id}>
                <Link
                  href={`/transporte/${co.slug}`}
                  className="flex items-center gap-3 rounded-2xl px-4 py-4 shadow-card text-white font-semibold active:scale-[0.99] transition"
                  style={{ background: co.color }}
                >
                  {co.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={co.logo} alt="" className="w-10 h-10 rounded-lg bg-white/20 p-1 object-contain" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/20 grid place-items-center">🚌</div>
                  )}
                  <span className="flex-1">{co.name}</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // mode === 'businesses' (default)
  const { data: biz } = await supabase
    .from('businesses')
    .select('id, slug, name, short_description, cover_image, rating_avg, rating_count, is_verified')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false });

  const businesses = (biz ?? []) as Business[];

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold text-slate-800 mb-3">{category.name_es}</h1>
      {businesses.length === 0 ? (
        <p className="text-slate-500 text-sm">Aún no hay negocios en esta categoría.</p>
      ) : (
        <ul className="space-y-2">
          {businesses.map((b) => (
            <li key={b.id}>
              <Link
                href={`/n/${b.slug}`}
                className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-3 shadow-soft hover:shadow-card active:scale-[0.99] transition"
                style={{ borderLeft: `5px solid ${category.color || '#1B97A3'}` }}
              >
                {b.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.cover_image} alt={b.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100" />
                ) : (
                  <div className="w-14 h-14 rounded-xl grid place-items-center text-white font-bold" style={{ background: category.color || '#1B97A3' }}>
                    {b.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold truncate">{b.name}</h3>
                    {b.is_verified && <span className="text-blue-500 text-xs">✓</span>}
                  </div>
                  {b.short_description && (
                    <p className="text-xs text-slate-500 truncate">{b.short_description}</p>
                  )}
                  {b.rating_count > 0 && (
                    <p className="text-xs text-amber-600">
                      ★ {Number(b.rating_avg).toFixed(1)} ({b.rating_count})
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
