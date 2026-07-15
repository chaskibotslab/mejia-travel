'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    if (confirm !== 'ELIMINAR') return;
    setBusy(true);
    setError('');

    const res = await fetch('/api/delete-account', { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Error al eliminar cuenta');
      setBusy(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/?deleted=1');
  }

  return (
    <div className="px-4 pt-6 fade-in max-w-md mx-auto">
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h1 className="text-xl font-bold text-red-800">Eliminar mi cuenta</h1>
        </div>

        <p className="text-sm text-red-700 mb-3">
          Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán:
        </p>
        <ul className="text-sm text-red-700 list-disc pl-5 mb-4 space-y-1">
          <li>Tu perfil y datos personales</li>
          <li>Todas tus publicaciones del mercado</li>
          <li>Tus reportes y bloqueos</li>
          <li>Tu cuenta de acceso</li>
        </ul>

        <label className="block text-sm font-medium text-red-800 mb-1">
          Escribe <strong>ELIMINAR</strong> para confirmar:
        </label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="ELIMINAR"
          className="w-full rounded-xl border border-red-300 px-3 py-2.5 text-sm mb-3 bg-white"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-100 rounded-lg p-2 mb-3">{error}</p>
        )}

        <button
          onClick={handleDelete}
          disabled={confirm !== 'ELIMINAR' || busy}
          className="w-full rounded-xl bg-red-600 text-white py-3 font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {busy ? 'Eliminando...' : 'Eliminar mi cuenta permanentemente'}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full text-center mt-3 text-sm text-slate-600 font-medium"
        >
          Cancelar, quiero conservar mi cuenta
        </button>
      </div>
    </div>
  );
}
