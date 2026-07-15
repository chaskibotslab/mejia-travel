import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Admin client to delete user from auth
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete user data from tables
  await adminClient.from('marketplace_items').delete().eq('user_id', user.id);
  await adminClient.from('reports').delete().eq('reporter_id', user.id);
  await adminClient.from('user_blocks').delete().eq('blocker_id', user.id);
  await adminClient.from('user_blocks').delete().eq('blocked_id', user.id);
  await adminClient.from('profiles').delete().eq('id', user.id);

  // Delete auth user
  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
