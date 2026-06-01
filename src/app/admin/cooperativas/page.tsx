'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, X, Bus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import type { TransportCooperative } from '@/lib/types';

const COLORS = ['#1B97A3','#F39C3E','#5B4BB8','#3B2EAD','#6B7280','#E84855','#EC4899','#16A34A','#0EA5E9','#0F766E','#DC2626'];

export default function AdminCoopsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<TransportCooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TransportCooperative> | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('transport_cooperatives').select('*').order('sort_order');
    setItems((data ?? []) as TransportCooperative[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing || !editing.name || !editing.slug) { alert('Nombre y slug requeridos'); return; }
    const payload = { ...editing };
    delete (payload as any).created_at;
    const res = editing.id
      ? await supabase.from('transport_cooperatives').update(payload).eq('id', editing.id)
      : await supabase.from('transport_cooperatives').insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar cooperativa y sus rutas?')) return;
    await supabase.from('transport_cooperatives').delete().eq('id', id);
    load();
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Cooperativas de transporte</h1>
        <button onClick={() => setEditing({ type: 'bus', color: '#1B97A3', is_published: true })} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" /> : items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin cooperativas.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((co) => (
            <li key={co.id} className="rounded-xl text-white p-3 shadow-soft flex items-center gap-3" style={{ background: co.color }}>
              {co.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={co.logo} alt="" className="w-10 h-10 bg-white/20 rounded-lg object-contain p-1" />
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-lg grid place-items-center"><Bus className="w-5 h-5" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{co.name}</div>
                <div className="text-[11px] opacity-80 truncate">{co.type} · /{co.slug} {co.is_published ? '' : '· (oculta)'}</div>
              </div>
              <Link href={`/admin/cooperativas/${co.id}`} className="px-2 py-1 text-xs rounded bg-white/20 hover:bg-white/30">Rutas</Link>
              <button onClick={() => setEditing(co)} className="p-2 bg-white/20 rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => del(co.id)} className="p-2 bg-white/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Editar' : 'Nueva'}>
          <Field label="Nombre *"><input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} className="inp" /></Field>
          <Field label="Slug *"><input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="inp" /></Field>
          <Field label="Tipo">
            <select value={editing.type ?? 'bus'} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })} className="inp">
              <option value="bus">Bus</option><option value="taxi">Taxi</option>
              <option value="camioneta">Camioneta</option><option value="escolar">Escolar</option>
              <option value="turismo">Turismo</option>
            </select>
          </Field>
          <Field label="Año de fundación"><input type="number" value={editing.founded_year ?? ''} onChange={(e) => setEditing({ ...editing, founded_year: e.target.value ? Number(e.target.value) : null })} className="inp" /></Field>
          <Field label="Descripción"><textarea rows={2} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="inp resize-none" /></Field>
          <Field label="Logo"><ImageUpload value={editing.logo ?? null} onChange={(url) => setEditing({ ...editing, logo: url })} folder="coops" /></Field>
          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setEditing({ ...editing, color: c })} className={`w-8 h-8 rounded-full border-2 ${editing.color === c ? 'border-slate-800' : 'border-transparent'}`} style={{ background: c }} />
              ))}
              <input type="color" value={editing.color ?? '#1B97A3'} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="w-8 h-8 rounded-full" />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Teléfono"><input value={editing.phone ?? ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="inp" /></Field>
            <Field label="WhatsApp"><input value={editing.whatsapp ?? ''} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} className="inp" /></Field>
          </div>
          <Field label="Email"><input type="email" value={editing.email ?? ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="inp" /></Field>
          <Field label="Dirección"><input value={editing.address ?? ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="inp" /></Field>
          <Field label="Horario de atención (oficina/boletería)">
            <textarea
              rows={2}
              value={editing.schedule_general ?? ''}
              onChange={(e) => setEditing({ ...editing, schedule_general: e.target.value })}
              className="inp resize-none"
              placeholder="Lunes a Viernes 06:00–20:00&#10;Sábados 06:00–14:00&#10;Domingos cerrado"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Latitud"><input type="number" step="0.0000001" value={editing.latitude ?? ''} onChange={(e) => setEditing({ ...editing, latitude: e.target.value ? Number(e.target.value) : null })} className="inp" /></Field>
            <Field label="Longitud"><input type="number" step="0.0000001" value={editing.longitude ?? ''} onChange={(e) => setEditing({ ...editing, longitude: e.target.value ? Number(e.target.value) : null })} className="inp" /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_published ?? false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Publicada
          </label>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-slate-100">Cancelar</button>
            <button onClick={save} className="flex-1 py-2 rounded-xl bg-brand-600 text-white font-semibold">Guardar</button>
          </div>
        </Modal>
      )}
      <style jsx global>{`.inp { width:100%; border-radius:.6rem; border:1px solid rgb(226 232 240); background:white; padding:.5rem .65rem; font-size:.875rem; }`}</style>
    </div>
  );
}

function Modal({ children, title, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[90vh] overflow-y-auto space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }: any) {
  return (<label className="block"><span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>{children}</label>);
}
function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
