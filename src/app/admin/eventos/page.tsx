'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Loader2, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminEventsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('starts_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm('Eliminar evento?')) return;
    await supabase.from('events').delete().eq('id', id);
    load();
  }

  async function togglePub(id: string, v: boolean) {
    await supabase.from('events').update({ is_published: !v }).eq('id', id);
    load();
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Eventos</h1>
        <Link href="/admin/eventos/nuevo" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nuevo
        </Link>
      </div>
      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" /> : items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin eventos.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((ev) => (
            <li key={ev.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold flex-1 truncate">{ev.title}</span>
                <span className="text-xs text-slate-500">{new Date(ev.starts_at).toLocaleDateString()}</span>
              </div>
              {ev.location && <p className="text-xs text-slate-500 mb-2">📍 {ev.location}</p>}
              <div className="flex gap-1.5 items-center">
                <button onClick={() => togglePub(ev.id, ev.is_published)} className={`px-2 py-1 rounded-md text-xs font-medium ${ev.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {ev.is_published ? 'Publicado' : 'Borrador'}
                </button>
                <Link href={`/admin/eventos/nuevo?id=${ev.id}`} className="ml-auto px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-600 flex items-center gap-1" title="Editar">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Link>
                <button onClick={() => del(ev.id)} className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-600" title="Eliminar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
