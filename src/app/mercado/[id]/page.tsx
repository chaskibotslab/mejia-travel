import { notFound } from 'next/navigation';
import { Phone, MessageCircle, Clock, Star, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { telLink, waLink, timeLeft } from '@/lib/utils';

export const revalidate = 10;

export default async function ItemPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('marketplace_items')
    .select('*, profiles(full_name)')
    .eq('id', params.id)
    .single();

  if (!data) notFound();
  const it = data as any;

  return (
    <article className="fade-in pb-6">
      <div className="relative w-full aspect-square bg-slate-100">
        {it.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={it.images[0]} alt={it.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-6xl">📦</div>
        )}
        {it.is_featured && (
          <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
            <Star className="w-3.5 h-3.5 fill-current" /> Destacado
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {timeLeft(it.expires_at)}
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold leading-tight">{it.title}</h1>
        <p className="text-3xl font-bold text-brand-700 mt-1">
          {it.currency} {Number(it.price).toFixed(2)}
        </p>

        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          {it.category && <span className="bg-slate-100 px-2 py-1 rounded-full">{it.category}</span>}
          {it.condition && (
            <span className="bg-slate-100 px-2 py-1 rounded-full capitalize">{it.condition}</span>
          )}
          {it.location && (
            <span className="bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {it.location}
            </span>
          )}
        </div>

        {it.description && (
          <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700 mt-4">
            {it.description}
          </p>
        )}

        <div className="mt-4 text-xs text-slate-500">
          Vendedor: <span className="font-semibold text-slate-700">{it.profiles?.full_name || 'Usuario'}</span>
        </div>

        <div className="flex gap-3 mt-5">
          {it.phone && (
            <a
              href={telLink(it.phone)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow-card"
            >
              <Phone className="w-5 h-5" /> Llamar
            </a>
          )}
          {it.whatsapp && (
            <a
              href={waLink(it.whatsapp, `Hola, vi tu publicación "${it.title}" en Mejía Travel.`)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-card"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
          )}
        </div>

        {/* Galería adicional */}
        {it.images && it.images.length > 1 && (
          <div className="grid grid-cols-3 gap-2 mt-5">
            {it.images.slice(1).map((u: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={u} alt="" className="w-full aspect-square object-cover rounded-lg" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
