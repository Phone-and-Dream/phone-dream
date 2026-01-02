import { cn } from '@/lib/utils';
import { getStatusColor } from '@/lib/mockData';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
      getStatusColor(status),
      className
    )}>
      {status}
    </span>
  );
}
