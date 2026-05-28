'use client';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Props = {
  businessId: string;
  event: 'view' | 'call' | 'whatsapp' | 'map' | 'website';
  href: string;
  ariaLabel: string;
  ringClass?: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
};

export default function TrackButton({
  businessId,
  event,
  href,
  ariaLabel,
  ringClass = 'bg-slate-100 text-slate-700',
  label,
  external,
  children,
}: Props) {
  const handleClick = () => {
    const supabase = createClient();
    supabase
      .from('business_analytics')
      .insert({ business_id: businessId, event_type: event })
      .then(() => {});

    // Incrementa contador específico
    if (event === 'call' || event === 'whatsapp') {
      const col = event === 'call' ? 'calls_count' : 'whatsapp_count';
      supabase.rpc('increment_business_counter', { biz_id: businessId, col_name: col }).then(() => {});
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={ariaLabel}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="action-btn"
    >
      <span className={cn('ring', ringClass)}>{children}</span>
      <span>{label}</span>
    </a>
  );
}
