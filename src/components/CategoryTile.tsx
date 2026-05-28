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
      <IconCmp className="icon w-12 h-12 sm:w-14 sm:h-14" strokeWidth={1.4} />
      <span className="label uppercase">{label}</span>
    </Link>
  );
}
