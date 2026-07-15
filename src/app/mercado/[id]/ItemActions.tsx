'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ReportButton from '@/components/ReportModal';
import BlockUserButton from '@/components/BlockUserButton';

interface Props {
  postId: string;
  sellerId: string;
  sellerName?: string;
}

export default function ItemActions({ postId, sellerId, sellerName }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [alreadyReported, setAlreadyReported] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: rep } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', data.user.id)
        .eq('post_id', postId)
        .maybeSingle();
      if (rep) setAlreadyReported(true);
    })();
  }, [postId]);

  if (!userId || userId === sellerId) return null;

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
      <ReportButton postId={postId} userId={userId} alreadyReported={alreadyReported} />
      <BlockUserButton
        currentUserId={userId}
        targetUserId={sellerId}
        targetName={sellerName}
      />
    </div>
  );
}
