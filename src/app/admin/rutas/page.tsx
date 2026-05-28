'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Star, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Route = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  cover_image: string | null;
  duration_hours: number | null;
  distance_km: number | null;
  difficulty: string;
  color: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

export default function AdminRoutesPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('tourist_routes').select('*').order('sort_order');
    setItems((data as Route[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(id: string, field: keyof Route, value: any) {
    await supabase.from('tourist_routes').update({ [field]: value }).eq('id', id);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar esta ruta y todas sus paradas?')) return;
    await supabase.from('tourist_routes').delete().eq('id', id);
    load();
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Rutas turísticas</h1>
          <p className="text-xs text-slate-500">Circuitos predefinidos con paradas mapeadas</p>
        </div>
        <Link
          href="/admin/rutas/nuevo"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-fuchsia-600 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Nueva
        </Link>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-500">
          <p className="font-semibold mb-1">Aún no hay rutas creadas</p>
          <p className="text-sm">Ejecuta el SQL <code className="bg-slate-100 px-1 rounded">tourist_routes.sql</code> o crea una nueva.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 grid place-items-center text-white"
                  style={{ background: r.color || '#7c3aed' }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <Link href={`/rutas/${r.slug}`} className="font-semibold truncate flex-1">{r.name}</Link>
                <span className="text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded">
                  {r.difficulty || 'facil'}
                </span>
              </div>
              {r.short_description && (
                <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">{r.short_description}</p>
              )}
              <div className="flex gap-1.5 flex-wrap items-center">
                <button
                  onClick={() => toggle(r.id, 'is_published', !r.is_published)}
                  className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${r.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {r.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {r.is_published ? 'Publicada' : 'Borrador'}
                </button>
                <button
                  onClick={() => toggle(r.id, 'is_featured', !r.is_featured)}
                  className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${r.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Star className="w-3 h-3" />
                  {r.is_featured ? 'Destacada' : 'Normal'}
                </button>
                <Link
                  href={`/admin/rutas/${r.id}`}
                  className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-600 ml-auto flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </Link>
                <button onClick={() => del(r.id)} className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-600">
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
