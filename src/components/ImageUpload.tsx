'use client';
import { useState } from 'react';
import { Upload, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  accept = 'image/*',
  label = 'Subir imagen',
  allowUrl = true,
  previewSize = 'md',
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  accept?: string;
  label?: string;
  allowUrl?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
}) {
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [err, setErr] = useState('');

  const previewClass =
    previewSize === 'sm' ? 'w-12 h-12' : previewSize === 'lg' ? 'w-32 h-24' : 'w-20 h-20';

  async function handleFile(file: File) {
    setErr('');
    if (file.size > 10 * 1024 * 1024) {
      setErr('Archivo muy grande (máx 10 MB)');
      return;
    }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${folder}/${u.user?.id ?? 'anon'}/${safeName}`;
    const { error } = await supabase.storage.from('media').upload(path, file, {
      upsert: false,
      cacheControl: '31536000',
      contentType: file.type,
    });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {value && accept.startsWith('image') && (
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className={`${previewClass} rounded-lg object-cover border border-slate-200`}
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full grid place-items-center shadow-md"
              aria-label="Quitar"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <label className="flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-3 text-xs sm:text-sm text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-fuchsia-300 transition flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? 'Subiendo…' : value ? 'Reemplazar' : label}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      </div>

      {allowUrl && (
        <>
          {!showUrl ? (
            <button
              type="button"
              onClick={() => {
                setShowUrl(true);
                setUrlInput(value ?? '');
              }}
              className="text-xs text-fuchsia-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <LinkIcon className="w-3 h-3" /> O pegar URL externa
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  onChange(urlInput || null);
                  setShowUrl(false);
                }}
                className="px-3 py-2 rounded-lg bg-fuchsia-600 text-white text-xs font-bold"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowUrl(false)}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs"
              >
                Cancelar
              </button>
            </div>
          )}
        </>
      )}

      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
