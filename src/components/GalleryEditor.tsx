'use client';
import { useState } from 'react';
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { GalleryItem } from '@/lib/types';

type Props = {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
};

export default function GalleryEditor({ value, onChange }: Props) {
  const supabase = createClient();
  const [uploading, setUploading] = useState<number | null>(null);

  async function uploadImage(file: File, index: number) {
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 10 MB.');
      return;
    }
    setUploading(index);
    const { data: u } = await supabase.auth.getUser();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `gallery/${u.user?.id ?? 'anon'}/${safeName}`;
    const { error } = await supabase.storage.from('media').upload(path, file, {
      upsert: false,
      cacheControl: '31536000',
      contentType: file.type || 'image/jpeg',
    });
    if (error) {
      alert('Error al subir: ' + error.message);
      setUploading(null);
      return;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    const updated = [...value];
    updated[index] = { ...updated[index], image_url: data.publicUrl };
    onChange(updated);
    setUploading(null);
  }

  function addItem() {
    onChange([...value, { image_url: '', title: '', description: '' }]);
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof GalleryItem, val: string) {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-400">
              <GripVertical className="w-4 h-4" />
              <span className="text-xs font-semibold">Foto {i + 1}</span>
            </div>
            <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Image upload */}
          <div className="flex items-center gap-3">
            {item.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
            )}
            <label className="flex-1 rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 cursor-pointer hover:bg-white text-center">
              {uploading === i ? <Loader2 className="w-4 h-4 animate-spin inline" /> : item.image_url ? 'Cambiar imagen' : 'Subir imagen'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], i)}
              />
            </label>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Título (opcional)"
            value={item.title || ''}
            onChange={(e) => updateItem(i, 'title', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
          />

          {/* Description */}
          <textarea
            placeholder="Descripción breve (opcional)"
            value={item.description || ''}
            onChange={(e) => updateItem(i, 'description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:bg-slate-50 hover:border-brand-400 transition"
      >
        <Plus className="w-4 h-4" /> Agregar foto
      </button>
    </div>
  );
}
