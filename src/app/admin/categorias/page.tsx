'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import type { Category, ListingMode } from '@/lib/types';

const ICON_OPTIONS = [
  'UtensilsCrossed','BedDouble','Stethoscope','Wrench','Zap','Mountain','GraduationCap',
  'ShoppingBag','Palette','Briefcase','Bus','Wheat','Scissors','Hammer','Landmark','Siren',
  'ChefHat','Soup','Pizza','Coffee','Croissant','IceCream','Wine','Hotel','Building','Tent',
  'Hospital','Pill','PawPrint','Eye','HeartPulse','Cog','Droplets','PaintBucket','Truck',
  'Shield','Flame','Mail','Trees','Plane','Compass','School','BookOpen','Store','Sprout',
  'Shirt','Notebook','Library','Music','Drum','Mic','Smile','Brain','Camera','PenTool',
  'Calculator','Saw','Car','TruckIcon','Cross','PhoneCall','TrafficCone','Ambulance',
  'Hand','Sparkles','Dumbbell','Laptop','Wifi','Refrigerator','Tv','KeyRound','Flower2',
  'PiggyBank','CreditCard','ShieldCheck','DollarSign','Send','Milk','Cake','Flower','Hexagon',
  'Tag', 'MapPin', 'Star', 'Phone'
];

const COLORS = ['#1B97A3','#F39C3E','#5B4BB8','#3B2EAD','#6B7280','#E84855','#EC4899','#16A34A','#0EA5E9','#0F766E','#DC2626'];

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [parentFilter, setParentFilter] = useState<string | null>(null); // null = root

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCats((data ?? []) as Category[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const visible = cats.filter((c) => (c.parent_id ?? null) === parentFilter);
  const currentParent = parentFilter ? cats.find((c) => c.id === parentFilter) : null;

  async function save() {
    if (!editing) return;
    if (!editing.name_es?.trim()) { alert('El nombre es obligatorio'); return; }
    if (!editing.slug?.trim()) { alert('El slug es obligatorio'); return; }
    const payload: any = {
      slug: editing.slug.trim(),
      name_es: editing.name_es.trim(),
      name_en: editing.name_en || null,
      icon: editing.icon || null,
      color: editing.color || '#1B97A3',
      cover_image: editing.cover_image || null,
      description: editing.description || null,
      listing_mode: editing.listing_mode || 'businesses',
      sort_order: editing.sort_order ?? 0,
      parent_id: editing.parent_id ?? null,
    };
    let res;
    if (editing.id) {
      res = await supabase.from('categories').update(payload).eq('id', editing.id);
    } else {
      res = await supabase.from('categories').insert(payload);
    }
    if (res.error) {
      const msg = res.error.message.includes('duplicate')
        ? `El slug "${payload.slug}" ya existe. Usa otro nombre.`
        : res.error.message;
      alert('Error: ' + msg);
      return;
    }
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar esta categoría y todas sus subcategorías?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) alert(error.message);
    load();
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">
            {currentParent ? currentParent.name_es : 'Categorías'}
          </h1>
          {currentParent && (
            <button onClick={() => setParentFilter(currentParent.parent_id)} className="text-xs text-brand-600 underline">
              ← Volver
            </button>
          )}
        </div>
        <button
          onClick={() => setEditing({ parent_id: parentFilter, listing_mode: 'businesses', color: '#1B97A3', sort_order: visible.length + 1 })}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500">Sin categorías aquí.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((c) => {
            const childrenCount = cats.filter((x) => x.parent_id === c.id).length;
            return (
              <li key={c.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg grid place-items-center text-white text-lg" style={{ background: c.color || '#1B97A3' }}>
                  {c.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover_image} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-xs font-bold">{c.name_es.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.name_es}</div>
                  <div className="text-[11px] text-slate-500">
                    /{c.slug} · {c.listing_mode}
                    {childrenCount > 0 && ` · ${childrenCount} subcat.`}
                  </div>
                </div>
                <button onClick={() => setParentFilter(c.id)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" aria-label="Ver subcategorías">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setEditing(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" aria-label="Editar">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => del(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" aria-label="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center" onClick={() => setEditing(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">{editing.id ? 'Editar' : 'Nueva'} categoría</h2>
              <button onClick={() => setEditing(null)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Nombre">
                <input value={editing.name_es ?? ''} onChange={(e) => setEditing({ ...editing, name_es: e.target.value, slug: editing.slug || slugify(e.target.value) })} className="inp" />
              </Field>
              <Field label="Slug (URL)">
                <input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="inp" />
              </Field>
              <Field label="Descripción (opcional)">
                <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="inp resize-none" rows={2} />
              </Field>
              <Field label="Modo de listado">
                <select value={editing.listing_mode ?? 'businesses'} onChange={(e) => setEditing({ ...editing, listing_mode: e.target.value as ListingMode })} className="inp">
                  <option value="businesses">Negocios / Empresas</option>
                  <option value="professionals">Profesionales individuales</option>
                  <option value="cooperatives">Cooperativas de transporte</option>
                </select>
              </Field>
              <Field label="Logo / imagen (opcional)">
                <ImageUpload value={editing.cover_image ?? null} onChange={(url) => setEditing({ ...editing, cover_image: url })} folder="categories" />
              </Field>
              <Field label="Ícono (Lucide)">
                <select value={editing.icon ?? ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="inp">
                  <option value="">— Ninguno —</option>
                  {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Color">
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setEditing({ ...editing, color: c })}
                      className={`w-8 h-8 rounded-full border-2 ${editing.color === c ? 'border-slate-800' : 'border-transparent'}`}
                      style={{ background: c }} aria-label={c} />
                  ))}
                  <input type="color" value={editing.color ?? '#1B97A3'} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="w-8 h-8 rounded-full" />
                </div>
              </Field>
              <Field label="Orden">
                <input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="inp" />
              </Field>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium">Cancelar</button>
              <button onClick={save} className="flex-1 py-2 rounded-xl bg-brand-600 text-white font-semibold">Guardar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .inp { width:100%; border-radius:.6rem; border:1px solid rgb(226 232 240); background:white; padding:.5rem .65rem; font-size:.875rem; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
