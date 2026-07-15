'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Loader2, UserX } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  profile?: { full_name: string | null };
}

export default function BlockedUsersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<BlockedUser[]>([]);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.push('/cuenta'); return; }

      const { data } = await supabase
        .from('user_blocks')
        .select('id, blocked_id, created_at')
        .eq('blocker_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Fetch profiles for blocked users
        const ids = data.map((b: any) => b.blocked_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
        setBlocks(data.map((b: any) => ({ ...b, profile: profileMap.get(b.blocked_id) })));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unblock(blockId: string) {
    setUnblocking(blockId);
    await supabase.from('user_blocks').delete().eq('id', blockId);
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setUnblocking(null);
  }

  if (loading) {
    return (
      <div className="px-4 pt-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
        <Ban className="w-5 h-5 text-orange-500" /> Usuarios bloqueados
      </h1>
      <p className="text-xs text-slate-500 mb-4">
        Las publicaciones de estos usuarios no aparecerán en tu mercado.
      </p>

      {blocks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
          <UserX className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="font-semibold">No has bloqueado a nadie</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-soft"
            >
              <div>
                <p className="font-semibold text-sm">
                  {b.profile?.full_name || 'Usuario desconocido'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Bloqueado el {new Date(b.created_at).toLocaleDateString('es-EC')}
                </p>
              </div>
              <button
                onClick={() => unblock(b.id)}
                disabled={unblocking === b.id}
                className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100 disabled:opacity-50"
              >
                {unblocking === b.id ? 'Desbloqueando...' : 'Desbloquear'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
