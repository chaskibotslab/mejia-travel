'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Loader2, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminMarketplacePage() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('marketplace_items').select('*').order('created_at', { ascending: false }).limit(200);
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleFeat(id: string, v: boolean) {
    await supabase.from('marketplace_items').update({ is_featured: !v }).eq('id', id);
    load();
  }
  async function del(id: string) {
    if (!confirm('Eliminar publicación?')) return;
    await supabase.from('marketplace_items').delete().eq('id', id);
    load();
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold mb-3">Mercado 48h</h1>
      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" /> : items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin publicaciones.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft flex items-center gap-3">
              {it.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (<div className="w-12 h-12 rounded-lg bg-slate-100 grid place-items-center text-xl">📦</div>)}
              <div className="flex-1 min-w-0">
                <Link href={`/mercado/${it.id}`} className="font-semibold truncate block">{it.title}</Link>
                <p className="text-xs text-brand-600 font-bold">{it.currency} {it.price}</p>
              </div>
              <button onClick={() => toggleFeat(it.id, it.is_featured)} className={`p-2 rounded-lg ${it.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                <Star className="w-4 h-4" />
              </button>
              <button onClick={() => del(it.id)} className="p-2 rounded-lg bg-red-50 text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
