'use client';
import { useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  accept = 'image/*',
  label = 'Subir imagen',
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  accept?: string;
  label?: string;
}) {
  const supabase = createClient();
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const ext = file.name.split('.').pop();
    const path = `${folder}/${u.user?.id ?? 'anon'}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
    if (error) {
      alert(error.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      {value && accept.startsWith('image') && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full grid place-items-center"
            aria-label="Quitar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <label className="flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 flex items-center justify-center gap-2">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {value ? 'Reemplazar' : label}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </label>
    </div>
  );
}
