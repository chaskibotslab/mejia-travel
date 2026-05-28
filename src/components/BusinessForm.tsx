'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const empty = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  address: '',
  address_branch_1: '',
  address_branch_2: '',
  owner_name: '',
  latitude: '',
  longitude: '',
  cover_image: '',
  catalog_pdf: '',
  is_published: false,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BusinessForm({ businessId }: { businessId?: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.push('/cuenta?redirect=/panel');
        return;
      }
      setUser(u.user);
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name_es, parent_id')
        .order('sort_order');
      setCategories(cats ?? []);
      if (businessId) {
        const { data: b } = await supabase.from('businesses').select('*').eq('id', businessId).single();
        if (b) setForm({ ...empty, ...b, latitude: b.latitude ?? '', longitude: b.longitude ?? '' });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  function set(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert('No soportado');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      set('latitude', pos.coords.latitude.toFixed(6));
      set('longitude', pos.coords.longitude.toFixed(6));
    });
  }

  async function uploadFile(file: File, field: 'cover_image' | 'catalog_pdf') {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `businesses/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    set(field, data.publicUrl);
    setUploading(false);
  }

  async function submit(e: any) {
    e.preventDefault();
    if (!form.name || !form.category_id) {
      alert('Nombre y categoría son obligatorios');
      return;
    }
    setLoading(true);
    const payload: any = {
      ...form,
      slug: form.slug || slugify(form.name),
      owner_id: user.id,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };
    let res;
    if (businessId) {
      res = await supabase.from('businesses').update(payload).eq('id', businessId);
    } else {
      res = await supabase.from('businesses').insert(payload);
    }
    setLoading(false);
    if (res.error) {
      alert(res.error.message);
      return;
    }
    router.push('/panel');
  }

  return (
    <form onSubmit={submit} className="px-4 pt-4 fade-in space-y-3 pb-8">
      <h1 className="text-xl font-bold mb-2">
        {businessId ? 'Editar negocio' : 'Nuevo negocio'}
      </h1>

      <F label="Nombre *">
        <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="inp" />
      </F>
      <F label="Categoría *">
        <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="inp">
          <option value="">Selecciona…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parent_id ? '— ' : ''}{c.name_es}
            </option>
          ))}
        </select>
      </F>
      <F label="Descripción corta">
        <input maxLength={140} value={form.short_description} onChange={(e) => set('short_description', e.target.value)} className="inp" />
      </F>
      <F label="Descripción completa">
        <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className="inp resize-none" />
      </F>

      <div className="grid grid-cols-2 gap-2">
        <F label="Teléfono"><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="inp" /></F>
        <F label="WhatsApp"><input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className="inp" /></F>
      </div>
      <F label="Email"><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="inp" /></F>
      <F label="Página web"><input value={form.website} onChange={(e) => set('website', e.target.value)} className="inp" placeholder="https://…" /></F>

      <div className="grid grid-cols-3 gap-2">
        <F label="Facebook"><input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} className="inp" /></F>
        <F label="Instagram"><input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} className="inp" /></F>
        <F label="TikTok"><input value={form.tiktok} onChange={(e) => set('tiktok', e.target.value)} className="inp" /></F>
      </div>

      <F label="Dirección"><input value={form.address} onChange={(e) => set('address', e.target.value)} className="inp" /></F>
      <F label="Sucursal 1"><input value={form.address_branch_1} onChange={(e) => set('address_branch_1', e.target.value)} className="inp" /></F>
      <F label="Sucursal 2"><input value={form.address_branch_2} onChange={(e) => set('address_branch_2', e.target.value)} className="inp" /></F>
      <F label="Propietario"><input value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} className="inp" /></F>

      <div className="grid grid-cols-2 gap-2">
        <F label="Latitud"><input value={form.latitude} onChange={(e) => set('latitude', e.target.value)} className="inp" /></F>
        <F label="Longitud"><input value={form.longitude} onChange={(e) => set('longitude', e.target.value)} className="inp" /></F>
      </div>
      <button type="button" onClick={getLocation} className="flex items-center gap-2 text-sm text-brand-600 font-medium">
        <MapPin className="w-4 h-4" /> Usar mi ubicación actual
      </button>

      <F label="Imagen de portada">
        <div className="flex items-center gap-2">
          {form.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_image} alt="" className="w-20 h-20 rounded-lg object-cover" />
          )}
          <label className="flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 flex items-center justify-center gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Subir imagen
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'cover_image')} />
          </label>
        </div>
      </F>

      <F label="Catálogo PDF (opcional)">
        <label className="block rounded-xl border-2 border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 text-center">
          {form.catalog_pdf ? '✓ PDF subido — reemplazar' : 'Subir PDF'}
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'catalog_pdf')} />
        </label>
      </F>

      <label className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => set('is_published', e.target.checked)}
          className="w-5 h-5 accent-brand-600"
        />
        <span className="text-sm">Publicar (visible al público)</span>
      </label>

      <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-600 text-white py-3 font-semibold shadow-card disabled:opacity-60">
        {loading ? 'Guardando…' : businessId ? 'Guardar cambios' : 'Crear negocio'}
      </button>

      <style jsx>{`
        .inp {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
        }
        .inp:focus {
          outline: none;
          border-color: rgb(59 91 219);
          box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.15);
        }
      `}</style>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
