import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  label: string;
  color?: string | null;
  icon?: string | null;
  className?: string;
};

export default function CategoryTile({ href, label, color, icon, className }: Props) {
  const IconCmp = (icon && (Icons as any)[icon]) || Icons.Square;
  return (
    <Link
      href={href}
      className={cn('category-tile', className)}
      style={{ background: color || '#1B97A3' }}
    >
      <IconCmp className="icon w-8 h-8 sm:w-12 sm:h-12" strokeWidth={1.5} />
      <span className="label text-[10px] sm:text-sm leading-tight">{label}</span>
    </Link>
  );
}
