import { createClient } from '@/lib/supabase/server';
import MarketplaceClient from './MarketplaceClient';

export const revalidate = 30;

export default async function MarketplacePage() {
  const supabase = createClient();

  // Get blocked user IDs for the current user
  const { data: userData } = await supabase.auth.getUser();
  let blockedIds: string[] = [];
  if (userData?.user) {
    const { data: blocks } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', userData.user.id);
    blockedIds = (blocks ?? []).map((b: any) => b.blocked_id);
  }

  let query = supabase
    .from('marketplace_items')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .eq('is_sold', false)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  const { data } = await query;

  // Filter out blocked users client-side (Supabase doesn't support NOT IN easily on server)
  const items = (data ?? []).filter((it: any) => !blockedIds.includes(it.user_id));

  return <MarketplaceClient items={items as any[]} />;
}
