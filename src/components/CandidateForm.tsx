'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CategoryPicker from '@/components/CategoryPicker';
import GalleryEditor from '@/components/GalleryEditor';
import type { GalleryItem } from '@/lib/types';

const empty = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: '',
  phone: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  parroquia: '',
  formacion_academica: '',
  experiencia_laboral: '',
  propuestas_gobierno: '',
  movimiento_politico: '',
  cover_image: '',
  gallery: [] as GalleryItem[],
  catalog_pdf: '',
  is_published: false,
};

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CandidateForm({ businessId }: { businessId?: string }) {
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
      if (!u.user) { router.push('/cuenta?redirect=/panel'); return; }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', u.user.id).single();
      if (prof?.role !== 'admin') { router.push('/cuenta'); return; }
      setUser(u.user);
      const { data: cats } = await supabase.from('categories').select('id, name_es, parent_id').order('sort_order');
      setCategories(cats ?? []);
      if (businessId) {
        const { data: b } = await supabase.from('businesses').select('*').eq('id', businessId).single();
        if (b) {
          let gallery = b.gallery ?? [];
          if (gallery.length > 0 && typeof gallery[0] === 'string') {
            gallery = (gallery as unknown as string[]).map((url) => ({ image_url: url, title: '', description: '' }));
          }
          setForm({ ...empty, ...b, gallery });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function uploadFile(file: File, field: 'cover_image' | 'catalog_pdf') {
    if (file.size > 10 * 1024 * 1024) { alert('Archivo muy grande. Máximo 10 MB.'); return; }
    setUploading(true);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `businesses/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, {
      upsert: false, cacheControl: '31536000',
      contentType: file.type || (field === 'catalog_pdf' ? 'application/pdf' : 'image/jpeg'),
    });
    if (error) { alert('Error: ' + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    set(field, data.publicUrl);
    setUploading(false);
  }

  async function submit(e: any) {
    e.preventDefault();
    if (!form.name || !form.category_id) { alert('Nombre y categoría son obligatorios'); return; }
    setLoading(true);
    const payload: any = { ...form, slug: form.slug || slugify(form.name), owner_id: user.id };
    // Limpiar campos de negocio que no aplican
    delete payload.address; delete payload.address_branch_1; delete payload.address_branch_2;
    delete payload.latitude; delete payload.longitude; delete payload.email; delete payload.website;
    delete payload.owner_name; delete payload.logo; delete payload.schedule;
    let res;
    if (businessId) {
      res = await supabase.from('businesses').update(payload).eq('id', businessId);
    } else {
      res = await supabase.from('businesses').insert(payload);
    }
    setLoading(false);
    if (res.error) { alert(res.error.message); return; }
    router.push('/panel');
  }

  return (
    <form onSubmit={submit} className="px-4 pt-4 fade-in space-y-3 pb-8">
      <h1 className="text-xl font-bold mb-2">{businessId ? 'Editar candidato' : 'Nuevo candidato'}</h1>

      <F label="Nombre completo *">
        <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="inp" />
      </F>

      <F label="Categoría *">
        <CategoryPicker value={form.category_id} onChange={(id) => set('category_id', id)} options={categories} />
      </F>

      <F label="Cargo al que postula">
        <input value={form.short_description} onChange={(e) => set('short_description', e.target.value)} className="inp" placeholder="Ej: Alcalde, Prefecto, Concejal..." />
      </F>

      <F label="Movimiento / Lista Política">
        <input value={form.movimiento_politico} onChange={(e) => set('movimiento_politico', e.target.value)} className="inp" placeholder="Ej: Lista 5 - Movimiento XYZ" />
      </F>

      <F label="Parroquia">
        <select value={form.parroquia} onChange={(e) => set('parroquia', e.target.value)} className="inp">
          <option value="">— Seleccionar parroquia —</option>
          <option value="Machachi">Machachi</option>
          <option value="Alóag">Alóag</option>
          <option value="Aloasí">Aloasí</option>
          <option value="Cutuglagua">Cutuglagua</option>
          <option value="El Chaupi">El Chaupi</option>
          <option value="Manuel Cornejo Astorga">Manuel Cornejo Astorga</option>
          <option value="Tambillo">Tambillo</option>
          <option value="Uyumbicho">Uyumbicho</option>
        </select>
      </F>

      <F label="Formación Académica">
        <textarea value={form.formacion_academica} onChange={(e) => set('formacion_academica', e.target.value)} className="inp resize-none" rows={3} placeholder="Títulos, universidades, especializaciones..." />
      </F>

      <F label="Experiencia Laboral">
        <textarea value={form.experiencia_laboral} onChange={(e) => set('experiencia_laboral', e.target.value)} className="inp resize-none" rows={3} placeholder="Cargos anteriores, experiencia relevante..." />
      </F>

      <F label="Ejes y Propuestas de Gobierno (2027–2031)">
        <textarea value={form.propuestas_gobierno} onChange={(e) => set('propuestas_gobierno', e.target.value)} className="inp resize-none" rows={5} placeholder="Principales propuestas y ejes de trabajo..." />
      </F>

      <F label="Descripción / Biografía">
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="inp resize-none" rows={4} placeholder="Biografía breve o mensaje al elector..." />
      </F>

      <F label="Foto del candidato">
        <div className="flex items-center gap-3">
          {form.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_image} alt="" className="w-20 h-20 rounded-xl object-cover" />
          )}
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold cursor-pointer">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Subir foto
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'cover_image')} />
          </label>
        </div>
      </F>

      <F label="Fotos adicionales">
        <GalleryEditor value={form.gallery || []} onChange={(items) => set('gallery', items)} />
      </F>

      <F label="Plan de gobierno PDF (opcional, máx 10 MB)">
        <div className="flex items-center gap-3">
          {form.catalog_pdf && (
            <div className="flex items-center gap-2">
              <a href={form.catalog_pdf} target="_blank" rel="noreferrer" className="text-sm text-brand-600 underline">Ver PDF</a>
              <button type="button" onClick={() => set('catalog_pdf', '')} className="text-xs text-red-500">Quitar</button>
            </div>
          )}
          {!form.catalog_pdf && (
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Subir PDF
              <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'catalog_pdf')} />
            </label>
          )}
        </div>
      </F>

      <div className="grid grid-cols-2 gap-2">
        <F label="Teléfono"><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="inp" /></F>
        <F label="WhatsApp"><input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className="inp" /></F>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <F label="Facebook"><input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} className="inp" /></F>
        <F label="Instagram"><input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} className="inp" /></F>
        <F label="TikTok"><input value={form.tiktok} onChange={(e) => set('tiktok', e.target.value)} className="inp" /></F>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
        <span className="text-sm font-medium">Publicar</span>
      </label>

      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold disabled:opacity-50">
        {loading ? 'Guardando…' : businessId ? 'Actualizar candidato' : 'Crear candidato'}
      </button>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
