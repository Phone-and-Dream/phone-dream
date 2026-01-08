import { ExternalLink, Shield, Sparkles } from 'lucide-react';
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

const deviceIcons: Record<string, string> = {
  'macbook': '💻',
  'laptop': '💻',
  'ipad': '📱',
  'tablet': '📱',
  'iphone': '📱',
  'phone': '📱',
  'smartphone': '📱',
  'pc': '🖥️',
  'desktop': '🖥️',
  'monitor': '🖥️',
  'keyboard': '⌨️',
  'default': '💻❤️'
};

const getDeviceIcon = (deviceType: string): string => {
  const lower = deviceType.toLowerCase();
  for (const [key, icon] of Object.entries(deviceIcons)) {
    if (lower.includes(key)) return icon;
  }
  return deviceIcons.default;
};

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
    sm: 'w-36 text-[9px]',
    md: 'w-48 text-[10px]',
    lg: 'w-60 text-xs',
  };

  const iconSize = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
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
        "relative flex flex-col items-center p-0 cursor-pointer group",
        sizeClasses[size],
        className
      )}
    >
      {/* Hexagonal/Shield Shape Container */}
      <div className="relative w-full">
        {/* Animated glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-primary/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Main Badge Container with shield shape */}
        <div className="relative bg-gradient-to-br from-card via-card to-card/95 border-2 border-primary/40 group-hover:border-primary/70 transition-all duration-300 rounded-t-2xl rounded-b-[40%] overflow-hidden shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/20">
          
          {/* Top Banner - Soulbound Label */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-accent py-1.5 px-3 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <div className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3 text-primary-foreground" />
              <span className="font-bold text-primary-foreground tracking-widest uppercase" style={{ fontSize: '0.6rem' }}>
                Soulbound Token
              </span>
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>

          {/* Donor Name Arc */}
          <div className="pt-3 pb-1 px-3 text-center">
            <p className="text-muted-foreground font-medium truncate uppercase tracking-wide" style={{ fontSize: '0.65rem' }}>
              From: {donorName}
            </p>
          </div>

          {/* Device Icon & Info - Central Focus */}
          <div className="py-4 flex flex-col items-center relative">
            {/* Decorative ring behind icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
            <div className={cn("relative z-10", iconSize[size])}>
              {getDeviceIcon(deviceType)}
            </div>
            <p className="font-bold text-foreground mt-2 text-center px-2 leading-tight" style={{ fontSize: size === 'sm' ? '0.7rem' : '0.8rem' }}>
              {deviceType}
            </p>
            <span className={cn(
              "mt-1 px-2 py-0.5 rounded-full font-medium",
              condition === 'New' 
                ? "bg-accent/20 text-accent" 
                : "bg-primary/20 text-primary"
            )} style={{ fontSize: '0.6rem' }}>
              {condition}
            </span>
          </div>

          {/* Recipient Name */}
          <div className="py-2 px-3 text-center border-t border-border/50">
            <p className="text-muted-foreground font-medium uppercase tracking-wide" style={{ fontSize: '0.65rem' }}>
              To: <span className="text-primary">{recipientName}</span>
            </p>
          </div>

          {/* Transaction Info Footer */}
          <div className="bg-muted/30 py-3 px-3 text-center space-y-1">
            <p className="text-muted-foreground">{formatDate(date)}</p>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              {txHash.slice(0, 8)}...{txHash.slice(-6)}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              <span>Base Mainnet</span>
            </div>
          </div>
        </div>
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
          <p className="font-semibold flex items-center gap-1">
            <Shield className="h-4 w-4 text-primary" />
            Impact Link Badge
          </p>
          <p className="text-muted-foreground">Non-transferable proof of impact (SBT)</p>
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
