'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Loader2, Star, Calendar, Plus, Trash, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminMarketplacePage() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultHours, setDefaultHours] = useState<number>(48);
  const [savingSetting, setSavingSetting] = useState(false);

  async function load() {
    setLoading(true);
    const [itemsRes, settingRes] = await Promise.all([
      supabase.from('marketplace_items').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('app_settings').select('value').eq('key', 'marketplace_default_hours').maybeSingle(),
    ]);
    setItems(itemsRes.data ?? []);
    if (settingRes.data?.value) setDefaultHours(Number(settingRes.data.value));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveDefaultHours(h: number) {
    setSavingSetting(true);
    await supabase.from('app_settings').upsert({ key: 'marketplace_default_hours', value: h, updated_at: new Date().toISOString() });
    setDefaultHours(h);
    setSavingSetting(false);
  }

  async function toggleFeat(id: string, v: boolean) {
    await supabase.from('marketplace_items').update({ is_featured: !v }).eq('id', id);
    load();
  }
  async function del(id: string) {
    if (!confirm('Eliminar publicación?')) return;
    await supabase.from('marketplace_items').delete().eq('id', id);
    load();
  }
  async function extend(it: any, days: number) {
    const base = new Date(it.expires_at || new Date());
    const newDate = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    await supabase.from('marketplace_items').update({ expires_at: newDate.toISOString() }).eq('id', it.id);
    load();
  }
  async function setExpires(id: string, isoDate: string) {
    if (!isoDate) return;
    await supabase.from('marketplace_items').update({ expires_at: new Date(isoDate).toISOString() }).eq('id', id);
    load();
  }
  async function cleanup() {
    if (!confirm('Eliminar publicaciones expiradas (>7 días) y vendidas antiguas (>30 días)?')) return;
    const { data, error } = await supabase.rpc('cleanup_expired_marketplace');
    if (error) alert(error.message);
    else alert(`Eliminadas: ${data ?? 0} publicaciones`);
    load();
  }

  function statusOf(it: any): { label: string; color: string } {
    if (it.is_sold) return { label: 'Vendido', color: 'bg-blue-100 text-blue-700' };
    const exp = new Date(it.expires_at);
    if (exp < new Date()) return { label: 'Expirado', color: 'bg-slate-200 text-slate-600' };
    const hoursLeft = Math.round((exp.getTime() - Date.now()) / 3600000);
    if (hoursLeft < 24) return { label: `${hoursLeft}h restantes`, color: 'bg-amber-100 text-amber-700' };
    const daysLeft = Math.round(hoursLeft / 24);
    return { label: `${daysLeft}d restantes`, color: 'bg-emerald-100 text-emerald-700' };
  }

  return (
    <div className="px-4 pt-4 pb-8 fade-in space-y-3">
      <h1 className="text-xl font-bold">Mercado</h1>

      <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-slate-600" />
          <p className="font-semibold text-sm">Duración por defecto de publicaciones</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number" min={1} max={720}
            value={defaultHours}
            onChange={(e) => setDefaultHours(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <span className="text-sm text-slate-500">horas (= {(defaultHours / 24).toFixed(1)} días)</span>
          <button
            disabled={savingSetting}
            onClick={() => saveDefaultHours(defaultHours)}
            className="ml-auto px-3 py-1.5 rounded-lg bg-fuchsia-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            {savingSetting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Aplica a publicaciones nuevas. Puedes editar el vencimiento de cada una abajo.</p>
      </div>

      <button onClick={cleanup} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
        <Trash className="w-4 h-4" /> Limpiar expirados (+7 días) y vendidos (+30 días)
      </button>

      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" /> : items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin publicaciones.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const st = statusOf(it);
            const localISO = it.expires_at ? new Date(it.expires_at).toISOString().slice(0, 16) : '';
            return (
              <li key={it.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft">
                <div className="flex items-center gap-3">
                  {it.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (<div className="w-12 h-12 rounded-lg bg-slate-100 grid place-items-center text-xl">📦</div>)}
                  <div className="flex-1 min-w-0">
                    <Link href={`/mercado/${it.id}`} className="font-semibold truncate block">{it.title}</Link>
                    <p className="text-xs text-brand-600 font-bold">{it.currency} {it.price}</p>
                    <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
                  </div>
                  <button onClick={() => toggleFeat(it.id, it.is_featured)} className={`p-2 rounded-lg ${it.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Star className="w-4 h-4" />
                  </button>
                  <button onClick={() => del(it.id)} className="p-2 rounded-lg bg-red-50 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={localISO}
                    onChange={(e) => setExpires(it.id, e.target.value)}
                    className="rounded-md border border-slate-200 px-1.5 py-0.5"
                  />
                  <button onClick={() => extend(it, 1)} className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-0.5"><Plus className="w-3 h-3" />1d</button>
                  <button onClick={() => extend(it, 7)} className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-0.5"><Plus className="w-3 h-3" />7d</button>
                  <button onClick={() => extend(it, 30)} className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-0.5"><Plus className="w-3 h-3" />30d</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
