'use client';
import { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const REASONS = [
  'Spam o publicidad engañosa',
  'Contenido sexual o desnudos',
  'Violencia o contenido perturbador',
  'Fraude o estafa',
  'Producto ilegal o peligroso',
  'Discriminación u odio',
  'Otro',
];

interface Props {
  postId: string;
  userId: string | null;
  alreadyReported?: boolean;
}

export default function ReportButton({ postId, userId, alreadyReported }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(alreadyReported || false);
  const [toast, setToast] = useState('');

  if (!userId) return null;

  async function submit() {
    if (!reason) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('reports').insert({
      reporter_id: userId,
      post_id: postId,
      post_type: 'marketplace',
      reason,
      details: details || null,
    });
    setBusy(false);
    if (error?.code === '23505') {
      setReported(true);
      setOpen(false);
      return;
    }
    if (error) {
      setToast('Error al enviar reporte');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setReported(true);
    setOpen(false);
    setToast('✓ Reporte enviado. Lo revisaremos pronto.');
    setTimeout(() => setToast(''), 4000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => !reported && setOpen(true)}
        disabled={reported}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition ${
          reported
            ? 'text-slate-400 cursor-default'
            : 'text-red-500 hover:bg-red-50 active:scale-95'
        }`}
        title={reported ? 'Ya reportaste esta publicación' : 'Reportar publicación'}
      >
        <Flag className="w-3.5 h-3.5" />
        {reported ? 'Reportado' : 'Reportar'}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Reportar publicación</h3>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm mb-3"
            >
              <option value="">Selecciona un motivo...</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cuéntanos más (opcional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none mb-4"
              placeholder="Describe el problema..."
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!reason || busy}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
}
