'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { timeLeft } from '@/lib/utils';

export default function MyItemsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.push('/cuenta?redirect=/cuenta/mis-articulos');
        return;
      }
      const { data } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('user_id', u.user.id)
        .order('created_at', { ascending: false });
      setItems(data ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markSold(id: string) {
    await supabase.from('marketplace_items').update({ is_sold: true }).eq('id', id);
    setItems(items.map((i) => (i.id === id ? { ...i, is_sold: true } : i)));
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar publicación?')) return;
    await supabase.from('marketplace_items').delete().eq('id', id);
    setItems(items.filter((i) => i.id !== id));
  }

  if (loading) {
    return <div className="px-4 pt-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold mb-3">Mis publicaciones</h1>
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">No has publicado nada aún.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const expired = new Date(it.expires_at) < new Date();
            return (
              <li key={it.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft flex gap-3">
                {it.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 grid place-items-center text-2xl">📦</div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/mercado/${it.id}`} className="font-semibold truncate block">{it.title}</Link>
                  <p className="text-xs text-brand-600 font-bold">{it.currency} {it.price}</p>
                  <p className="text-[11px] text-slate-500">
                    {it.is_sold ? '✓ Vendido' : expired ? 'Expirado' : `Expira en ${timeLeft(it.expires_at)}`}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {!it.is_sold && !expired && (
                    <button onClick={() => markSold(it.id)} className="p-1.5 rounded bg-emerald-50 text-emerald-600" aria-label="Marcar vendido">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => del(it.id)} className="p-1.5 rounded bg-red-50 text-red-600" aria-label="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
