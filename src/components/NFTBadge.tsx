import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NFTBadgeProps {
  donorName: string;
  donorId: string;
  recipientName: string;
  recipientId: string;
  deviceType: string;
  condition: 'New' | 'Refurbished';
  txHash: string;
  date: string;
  linkTo?: 'donor' | 'recipient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NFTBadge({
  donorName,
  donorId,
  recipientName,
  recipientId,
  deviceType,
  condition,
  txHash,
  date,
  linkTo = 'recipient',
  size = 'md',
  className,
}: NFTBadgeProps) {
  const sizeClasses = {
    sm: 'w-32 h-36 text-[10px]',
    md: 'w-44 h-52 text-xs',
    lg: 'w-56 h-64 text-sm',
  };

  const iconSize = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const linkPath = linkTo === 'donor' 
    ? `/donor/profile/${donorId}` 
    : `/recipient/profile/${recipientId}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const BadgeContent = () => (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center p-3 rounded-xl",
        "bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20",
        "border-2 border-primary/30 hover:border-primary/50 transition-all",
        "shadow-lg hover:shadow-warm cursor-pointer",
        sizeClasses[size],
        className
      )}
    >
      {/* SBT Label */}
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-primary/20 rounded text-[8px] font-medium text-primary uppercase tracking-wide">
        SBT
      </div>

      {/* Donor Name Arc */}
      <p className={cn("font-medium text-muted-foreground truncate max-w-full", size === 'sm' && 'text-[8px]')}>
        {donorName}
      </p>

      {/* Device Icon & Info */}
      <div className={cn("my-2 flex flex-col items-center", iconSize[size])}>
        <span>💻❤️</span>
        <p className="font-semibold text-foreground mt-1">{deviceType}</p>
        <p className="text-muted-foreground capitalize">{condition}</p>
      </div>

      {/* Recipient Name */}
      <p className={cn("font-medium text-primary truncate max-w-full", size === 'sm' && 'text-[8px]')}>
        {recipientName}
      </p>

      {/* Transaction Info */}
      <div className="mt-2 pt-2 border-t border-border/50 w-full text-center">
        <p className="text-muted-foreground">{formatDate(date)}</p>
        <a
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {txHash.slice(0, 6)}...{txHash.slice(-4)}
          <ExternalLink className="h-3 w-3" />
        </a>
        <p className="text-muted-foreground mt-0.5">Base Mainnet</p>
      </div>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={linkPath}>
          <BadgeContent />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Impact Link Badge (Soulbound Token)</p>
          <p className="text-muted-foreground">Non-transferable proof of impact</p>
          <div className="pt-1 border-t border-border mt-1">
            <p><span className="text-muted-foreground">From:</span> {donorName}</p>
            <p><span className="text-muted-foreground">To:</span> {recipientName}</p>
            <p><span className="text-muted-foreground">Device:</span> {deviceType} ({condition})</p>
            <p><span className="text-muted-foreground">Network:</span> Base Mainnet</p>
          </div>
          <p className="text-xs text-primary">Click to view {linkTo === 'donor' ? 'donor' : 'recipient'} profile</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
