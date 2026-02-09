import { cn } from '@/lib/utils';
import { getRankColor } from '@/lib/mockData';

interface RankBadgeProps {
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const rankIcons: Record<string, string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎'
};

export function RankBadge({ rank, size = 'md', showLabel = true, className }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      getRankColor(rank),
      sizeClasses[size],
      className
    )}>
      <span>{rankIcons[rank]}</span>
      {showLabel && <span>{rank}</span>}
    </span>
  );
}
