'use client';
import { useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  currentUserId: string | null;
  targetUserId: string;
  targetName?: string;
  onBlocked?: () => void;
}

export default function BlockUserButton({ currentUserId, targetUserId, targetName, onBlocked }: Props) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');

  if (!currentUserId || currentUserId === targetUserId) return null;

  async function doBlock() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('user_blocks').insert({
      blocker_id: currentUserId,
      blocked_id: targetUserId,
    });
    setBusy(false);
    setConfirm(false);
    if (error?.code === '23505') {
      setToast('Ya bloqueaste a este usuario');
    } else if (error) {
      setToast('Error al bloquear');
    } else {
      setToast('Usuario bloqueado. Ya no verás sus publicaciones.');
      onBlocked?.();
    }
    setTimeout(() => setToast(''), 4000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-orange-600 hover:bg-orange-50 active:scale-95 transition"
      >
        <Ban className="w-3.5 h-3.5" /> Bloquear vendedor
      </button>

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">¿Bloquear a este usuario?</h3>
            <p className="text-sm text-slate-600 mb-4">
              No verás más las publicaciones de {targetName || 'este vendedor'}. Puedes desbloquearlo desde tu perfil.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={doBlock}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
