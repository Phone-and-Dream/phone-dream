import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useImpactBadges, useImpactPoolContributors, type ImpactBadge } from '@/hooks/useImpactBadges';
import { getExplorerTxUrl } from '@/lib/blockchain';
import { 
  Award, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ChevronRight, 
  ExternalLink,
  Users,
  Loader2,
} from 'lucide-react';

interface ImpactBadgesSectionProps {
  userId: string;
  showViewAll?: boolean;
}

// Device type to icon mapping
const deviceIcons: Record<string, typeof Laptop> = {
  Laptop: Laptop,
  Phone: Smartphone,
  Smartphone: Smartphone,
  Tablet: Tablet,
  Desktop: Monitor,
  PC: Monitor,
};

// Device type to emoji mapping
const deviceEmojis: Record<string, string> = {
  Laptop: '💻',
  Phone: '📱',
  Smartphone: '📱',
  Tablet: '📱',
  Desktop: '🖥️',
  PC: '🖥️',
};

export function ImpactBadgesSection({ userId, showViewAll = true }: ImpactBadgesSectionProps) {
  const { groupedBadges, totalBadges, isLoading } = useImpactBadges(userId);
  const [selectedBadge, setSelectedBadge] = useState<ImpactBadge | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Impact Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalBadges === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Impact Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No impact badges yet</p>
            <p className="text-xs mt-1">
              Badges are earned when devices are donated and received
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Impact Badges
            <Badge variant="secondary" className="ml-2">
              {totalBadges}
            </Badge>
          </CardTitle>
          {showViewAll && (
            <Link to={`/profile/${userId}/impact-badges`}>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(groupedBadges).map(([deviceType, badges]) => {
              const emoji = deviceEmojis[deviceType] || '💻';
              return (
                <button
                  key={deviceType}
                  onClick={() => setSelectedBadge(badges[0])}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-medium">{deviceType} Impact</p>
                      <p className="text-xs text-muted-foreground">
                        {badges.length} badge{badges.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    × {badges.length}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        open={!!selectedBadge}
        onOpenChange={(open) => !open && setSelectedBadge(null)}
      />
    </>
  );
}

interface BadgeDetailModalProps {
  badge: ImpactBadge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function BadgeDetailModal({ badge, open, onOpenChange }: BadgeDetailModalProps) {
  const { data: contributors = [], isLoading: loadingContributors } = useImpactPoolContributors(
    badge?.device?.funding_type === 'impact_pool' ? badge?.device_id || '' : ''
  );

  if (!badge) return null;

  const isImpactPool = badge.device?.funding_type === 'impact_pool';
  const deviceType = badge.device?.device_type || 'Device';
  const emoji = deviceEmojis[deviceType] || '💻';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            {deviceType} Impact Badge
          </DialogTitle>
          <DialogDescription>
            {badge.minter_type === 'donor' ? 'Donor Badge' : 'Recipient Badge'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badge Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Funding Type</p>
              <p className="font-medium">
                {isImpactPool ? 'Impact Pool' : 'Physical Device'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Network</p>
              <p className="font-medium capitalize">
                {badge.network.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Minted</p>
              <p className="font-medium">
                {new Date(badge.minted_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Token ID</p>
              <p className="font-medium">#{badge.token_id || 'Pending'}</p>
            </div>
          </div>

          {/* Career at time of handover */}
          {badge.metadata?.recipient_career && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">Recipient Career</p>
              <p className="text-sm">{badge.metadata.recipient_career}</p>
            </div>
          )}

          {/* Transaction Link */}
          {badge.tx_hash && (
            <a
              href={getExplorerTxUrl(badge.tx_hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View on Blockchain Explorer
            </a>
          )}

          {/* Impact Pool Contributors */}
          {isImpactPool && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Powered by Community Donors</p>
              </div>

              {loadingContributors ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : contributors.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {contributors.map((contributor) => (
                    <Link
                      key={contributor.id}
                      to={`/donor/profile/${contributor.donor_id}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contributor.donor_profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {contributor.donor_profile?.full_name?.[0] || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {contributor.donor_profile?.full_name || 'Anonymous Donor'}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No contributor data available
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
