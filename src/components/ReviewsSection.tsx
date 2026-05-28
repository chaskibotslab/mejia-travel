'use client';
import { useEffect, useState } from 'react';
import { Star, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/utils';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
};

export default function ReviewsSection({ businessId }: { businessId: string }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function load() {
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, user_id, profiles(full_name, avatar_url)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(20);
    setReviews((data as any) ?? []);
  }

  async function submit() {
    if (!user) {
      window.location.href = '/cuenta';
      return;
    }
    if (!rating) return;
    setLoading(true);
    const { error } = await supabase.from('reviews').upsert(
      {
        business_id: businessId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      },
      { onConflict: 'business_id,user_id' }
    );
    setLoading(false);
    if (!error) {
      setComment('');
      load();
    } else {
      alert(error.message);
    }
  }

  return (
    <section className="rounded-2xl bg-white border border-slate-200 p-4 shadow-soft mb-4">
      <h3 className="font-bold text-slate-800 mb-3">Reseñas</h3>

      {/* Form */}
      <div className="rounded-xl bg-slate-50 p-3 mb-4">
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} estrellas`}>
              <Star
                className={`w-7 h-7 ${
                  n <= rating ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={user ? 'Comparte tu experiencia…' : 'Inicia sesión para opinar'}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          />
          <button
            onClick={submit}
            disabled={loading}
            className="rounded-lg bg-brand-600 text-white px-3 py-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista */}
      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">Sé el primero en opinar.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 grid place-items-center text-brand-700 text-xs font-bold">
                  {(r.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {r.profiles?.full_name || 'Usuario'}
                  </div>
                  <div className="text-xs text-slate-500">{timeAgo(r.created_at)}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm mt-1.5 text-slate-700">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
