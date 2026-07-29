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

  useEffect(() => {
    const stored = localStorage.getItem(`like_${businessId}`);
    if (stored) setLiked(true);
  }, [businessId]);

  async function toggle() {
    const supabase = createClient();
    if (liked) {
      // Unlike — solo revertir UI, no borramos (RLS no permite)
      localStorage.removeItem(`like_${businessId}`);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      // Like
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
      localStorage.setItem(`like_${businessId}`, '1');
      setLiked(true);
      setCount((c) => c + 1);
      const { error } = await supabase
        .from('business_analytics')
        .insert({ business_id: businessId, event_type: 'like' });
      if (error) {
        // Revertir si falla
        localStorage.removeItem(`like_${businessId}`);
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
        liked
          ? 'bg-red-50 text-red-500 border border-red-200'
          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-400'
      }`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${animating ? 'scale-125' : ''} ${liked ? 'fill-red-500 text-red-500' : ''}`}
      />
      <span>{count}</span>
    </button>
  );
}
