import Link from 'next/link';
import { Plus, Clock, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { timeLeft, waLink, telLink } from '@/lib/utils';

export const revalidate = 30;

export default async function MarketplacePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('marketplace_items')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .eq('is_sold', false)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(60);

  const items = (data ?? []) as any[];

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">Mercado Mejía</h1>
          <p className="text-xs text-slate-500">Publicaciones por 48 horas</p>
        </div>
        <Link
          href="/mercado/publicar"
          className="flex items-center gap-1.5 rounded-xl bg-accent text-white px-3 py-2 text-sm font-semibold shadow-card active:scale-95"
        >
          <Plus className="w-4 h-4" /> Publicar
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500">
          <p className="font-semibold mb-1">Aún no hay artículos</p>
          <p className="text-sm">¡Sé el primero en publicar algo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/mercado/${it.id}`}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-card active:scale-[0.99] transition"
            >
              <div className="relative aspect-square bg-slate-100">
                {it.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.images[0]} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-3xl">📦</div>
                )}
                {it.is_featured && (
                  <div className="absolute top-1.5 left-1.5 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" /> Destacado
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {timeLeft(it.expires_at)}
                </div>
              </div>
              <div className="p-2.5">
                <h3 className="font-semibold text-sm leading-tight truncate">{it.title}</h3>
                <p className="text-brand-600 font-bold text-sm mt-0.5">
                  {it.currency} {Number(it.price).toFixed(2)}
                </p>
                {it.location && <p className="text-[11px] text-slate-500 truncate">{it.location}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
