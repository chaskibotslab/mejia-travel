'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import type { Banner } from '@/lib/types';

export default function AdminBannersPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('sort_order');
    setItems((data ?? []) as Banner[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing || !editing.title || !editing.image) { alert('Título e imagen requeridos'); return; }
    const payload = { ...editing };
    delete (payload as any).created_at;
    const res = editing.id
      ? await supabase.from('banners').update(payload).eq('id', editing.id)
      : await supabase.from('banners').insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    load();
  }

  async function toggle(b: Banner) {
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id);
    load();
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Banners</h1>
        <button onClick={() => setEditing({ is_active: true, sort_order: items.length + 1 })} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>
      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" /> : items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin banners.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((b) => (
            <li key={b.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{b.title}</div>
                {b.subtitle && <div className="text-xs text-slate-500 truncate">{b.subtitle}</div>}
              </div>
              <button onClick={() => toggle(b)} className={`p-2 rounded-lg ${b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {b.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => setEditing(b)} className="p-2 text-blue-600"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => del(b.id)} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center" onClick={() => setEditing(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[90vh] overflow-y-auto space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing.id ? 'Editar' : 'Nuevo'} banner</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <Field label="Título *"><input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="inp" /></Field>
            <Field label="Subtítulo"><input value={editing.subtitle ?? ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="inp" /></Field>
            <Field label="Imagen *"><ImageUpload value={editing.image ?? null} onChange={(url) => setEditing({ ...editing, image: url ?? '' })} folder="banners" /></Field>
            <Field label="Enlace (URL)"><input value={editing.link ?? ''} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className="inp" placeholder="/c/turismo" /></Field>
            <Field label="Orden"><input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="inp" /></Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_active ?? false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Activo
            </label>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-slate-100">Cancelar</button>
              <button onClick={save} className="flex-1 py-2 rounded-xl bg-brand-600 text-white font-semibold">Guardar</button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`.inp { width:100%; border-radius:.6rem; border:1px solid rgb(226 232 240); background:white; padding:.5rem .65rem; font-size:.875rem; }`}</style>
    </div>
  );
}

function Field({ label, children }: any) {
  return (<label className="block"><span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>{children}</label>);
}
