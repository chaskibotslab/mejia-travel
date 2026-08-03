'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  businessId: string;
  initialCount: number;
};

export default function LikeButton({ businessId, initialCount }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      // Verificar si el usuario está logueado
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        // Verificar si ya dio like en la BD
        const { count: existing } = await supabase
          .from('business_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('event_type', 'like')
          .eq('user_id', uid);
        if (existing && existing > 0) setLiked(true);
      }
      setChecking(false);
    })();
  }, [businessId]);

  async function toggle() {
    if (!userId) {
      // Redirigir a login si no está registrado
      window.location.href = '/cuenta?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    const supabase = createClient();

    if (liked) {
      // Unlike — borrar de la BD
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      const { error } = await supabase
        .from('business_analytics')
        .delete()
        .eq('business_id', businessId)
        .eq('event_type', 'like')
        .eq('user_id', userId);
      if (error) {
        // Revertir si falla
        setLiked(true);
        setCount((c) => c + 1);
      }
    } else {
      // Like
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
      setLiked(true);
      setCount((c) => c + 1);
      const { error } = await supabase
        .from('business_analytics')
        .insert({ business_id: businessId, event_type: 'like', user_id: userId });
      if (error) {
        // Revertir si falla
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={checking}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
        liked
          ? 'bg-red-50 text-red-500 border border-red-200'
          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-400'
      } ${checking ? 'opacity-50' : ''}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${animating ? 'scale-125' : ''} ${liked ? 'fill-red-500 text-red-500' : ''}`}
      />
      <span>{count}</span>
    </button>
  );
}
