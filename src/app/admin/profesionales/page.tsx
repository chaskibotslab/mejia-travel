'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import CategoryPicker from '@/components/CategoryPicker';
import type { Professional, Category } from '@/lib/types';

export default function AdminProfessionalsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Professional[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Professional> | null>(null);
  const [filter, setFilter] = useState<string>('');

  async function load() {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase.from('professionals').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('listing_mode', 'professionals').order('sort_order'),
    ]);
    setItems((p.data ?? []) as Professional[]);
    setCats((c.data ?? []) as Category[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const visible = filter ? items.filter((i) => i.category_id === filter) : items;

  async function save() {
    if (!editing || !editing.full_name || !editing.category_id) {
      alert('Nombre y categoría son obligatorios'); return;
    }
    const payload = { ...editing };
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    const res = editing.id
      ? await supabase.from('professionals').update(payload).eq('id', editing.id)
      : await supabase.from('professionals').insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar profesional?')) return;
    await supabase.from('professionals').delete().eq('id', id);
    load();
  }

  async function togglePub(p: Professional) {
    await supabase.from('professionals').update({ is_published: !p.is_published }).eq('id', p.id);
    load();
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Profesionales</h1>
        <button
          onClick={() => setEditing({ is_published: true, sort_order: 0 })}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      <div className="mb-3">
        <CategoryPicker
          value={filter}
          onChange={(id) => setFilter(id)}
          options={cats as any}
          placeholder="Todas las categorías"
        />
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" />
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500">Sin profesionales.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((p) => {
            const cat = cats.find((c) => c.id === p.category_id);
            return (
              <li key={p.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft flex items-center gap-3">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-200 grid place-items-center font-bold text-purple-700">
                    {p.full_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.full_name}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {cat?.name_es ?? '—'} · {p.profession ?? p.phone ?? ''}
                  </div>
                </div>
                <button onClick={() => togglePub(p)} className={`p-2 rounded-lg ${p.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`} title="Publicado">
                  <Star className="w-4 h-4" />
                </button>
                <button onClick={() => setEditing(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Editar profesional' : 'Nuevo profesional'}>
          <Field label="Nombre completo *">
            <input value={editing.full_name ?? ''} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} className="inp" />
          </Field>
          <Field label="Categoría *">
            <CategoryPicker
              value={editing.category_id ?? ''}
              onChange={(id) => setEditing({ ...editing, category_id: id })}
              options={cats as any}
              required
            />
          </Field>
          <Field label="Profesión / especialidad">
            <input value={editing.profession ?? ''} onChange={(e) => setEditing({ ...editing, profession: e.target.value })} className="inp" />
          </Field>
          <Field label="Foto">
            <ImageUpload value={editing.photo ?? null} onChange={(url) => setEditing({ ...editing, photo: url })} folder="professionals" />
          </Field>
          <Field label="Biografía corta">
            <textarea rows={2} value={editing.bio ?? ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} className="inp resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Teléfono"><input value={editing.phone ?? ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="inp" /></Field>
            <Field label="WhatsApp"><input value={editing.whatsapp ?? ''} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} className="inp" /></Field>
          </div>
          <Field label="Email"><input type="email" value={editing.email ?? ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="inp" /></Field>
          <Field label="Facebook"><input value={editing.facebook ?? ''} onChange={(e) => setEditing({ ...editing, facebook: e.target.value })} className="inp" /></Field>
          <Field label="Instagram"><input value={editing.instagram ?? ''} onChange={(e) => setEditing({ ...editing, instagram: e.target.value })} className="inp" /></Field>
          <Field label="Dirección"><input value={editing.address ?? ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="inp" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Latitud"><input type="number" step="0.0000001" value={editing.latitude ?? ''} onChange={(e) => setEditing({ ...editing, latitude: e.target.value ? Number(e.target.value) : null })} className="inp" /></Field>
            <Field label="Longitud"><input type="number" step="0.0000001" value={editing.longitude ?? ''} onChange={(e) => setEditing({ ...editing, longitude: e.target.value ? Number(e.target.value) : null })} className="inp" /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_published ?? false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
            Destacado
          </label>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium">Cancelar</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl bg-brand-600 text-white font-semibold">Guardar</button>
          </div>
        </Modal>
      )}

      <style jsx global>{`
        .inp { width:100%; border-radius:.6rem; border:1px solid rgb(226 232 240); background:white; padding:.5rem .65rem; font-size:.875rem; }
      `}</style>
    </div>
  );
}

function Modal({ children, title, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[90vh] overflow-y-auto space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return (<label className="block"><span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>{children}</label>);
}
