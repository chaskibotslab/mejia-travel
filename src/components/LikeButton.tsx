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
      // Unlike
      localStorage.removeItem(`like_${businessId}`);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      supabase.from('business_analytics').delete()
        .eq('id', localStorage.getItem(`like_id_${businessId}`) || '')
        .then(() => {});
      localStorage.removeItem(`like_id_${businessId}`);
    } else {
      // Like
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
      localStorage.setItem(`like_${businessId}`, '1');
      setLiked(true);
      setCount((c) => c + 1);
      const { data } = await supabase
        .from('business_analytics')
        .insert({ business_id: businessId, event_type: 'like' })
        .select('id')
        .single();
      if (data) localStorage.setItem(`like_id_${businessId}`, data.id);
    }
  }

  return (
    <button
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
