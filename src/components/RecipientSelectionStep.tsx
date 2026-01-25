import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Check, ExternalLink, ChevronDown, ChevronUp, MapPin, GraduationCap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RankBadge } from '@/components/ui/rank-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOpenDreamRequests } from '@/hooks/useDreamRequests';
import { sanitizeStory, truncateToWords } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type DreamRequestWithDetails = Database['public']['Tables']['dream_requests']['Row'] & {
  recipient?: Database['public']['Tables']['profiles']['Row'] | null;
  recipient_profile?: Database['public']['Tables']['recipient_profiles']['Row'] | null;
};

type SelectionMethod = 'platform' | 'donor_choice';

interface RecipientSelectionStepProps {
  onSelect: (method: SelectionMethod, recipientId?: string, dreamRequestId?: string) => void;
  onBack: () => void;
}

export function RecipientSelectionStep({ onSelect, onBack }: RecipientSelectionStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<SelectionMethod | null>(null);
  const [showDreamBoard, setShowDreamBoard] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<DreamRequestWithDetails | null>(null);
  const [previewRecipient, setPreviewRecipient] = useState<DreamRequestWithDetails | null>(null);
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  const { data: dreamRequests = [], isLoading } = useOpenDreamRequests();

  const handleMethodSelect = (method: SelectionMethod) => {
    setSelectedMethod(method);
    if (method === 'donor_choice') {
      setShowDreamBoard(true);
    }
  };

  const handleRecipientSelect = (request: DreamRequestWithDetails) => {
    setSelectedRecipient(request);
    setPreviewRecipient(request);
  };

  const handleConfirmRecipient = () => {
    if (selectedRecipient) {
      onSelect('donor_choice', selectedRecipient.recipient_id, selectedRecipient.id);
    }
  };

  const handlePlatformSelect = () => {
    onSelect('platform');
  };

  const getMilestones = (request: DreamRequestWithDetails): string[] => {
    const milestones = request.milestones as { items?: string[] } | string[] | null;
    if (Array.isArray(milestones)) return milestones.slice(0, 5);
    if (milestones && Array.isArray(milestones.items)) return milestones.items.slice(0, 5);
    return [];
  };

  const getLocation = (request: DreamRequestWithDetails): string => {
    const profile = request.recipient;
    const parts: string[] = [];
    if (profile?.location) parts.push(profile.location);
    if (profile?.country) parts.push(profile.country);
    return parts.join(', ') || 'Unknown';
  };

  const sanitizedStory = previewRecipient?.purpose 
    ? sanitizeStory(previewRecipient.purpose) 
    : '';
  const { truncated: truncatedStory, isTruncated: hasMoreContent } = truncateToWords(sanitizedStory, 50);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Choose How Recipient is Selected</h2>
        <p className="text-sm text-muted-foreground">
          Your device will be verified first, then assigned to a recipient.
        </p>
      </div>

      {/* Selection Options */}
      <div className="grid gap-4">
        {/* Platform Choice */}
        <button
          type="button"
          onClick={() => handleMethodSelect('platform')}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all hover:shadow-md",
            selectedMethod === 'platform' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              selectedMethod === 'platform' ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Let A Phone and A Dream choose a recipient</h3>
                {selectedMethod === 'platform' && <Check className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                We will assign this device to a verified recipient based on need, XP ranking, and availability.
              </p>
            </div>
          </div>
        </button>

        {/* Donor Choice */}
        <button
          type="button"
          onClick={() => handleMethodSelect('donor_choice')}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all hover:shadow-md",
            selectedMethod === 'donor_choice' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              selectedMethod === 'donor_choice' ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Heart className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">I want to choose a recipient</h3>
                {selectedMethod === 'donor_choice' && <Check className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Browse the Dream Board and select a recipient you want to support directly.
              </p>
              {selectedRecipient && (
                <div className="mt-3 p-3 bg-accent/10 rounded-lg flex items-center gap-3">
                  <img 
                    src={selectedRecipient.recipient?.avatar_url || 'https://via.placeholder.com/40'} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{selectedRecipient.recipient?.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">Needs: {selectedRecipient.device_needed}</p>
                  </div>
                  <Check className="h-5 w-5 text-accent ml-auto" />
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={selectedMethod === 'platform' ? handlePlatformSelect : handleConfirmRecipient}
          className="flex-1"
          disabled={!selectedMethod || (selectedMethod === 'donor_choice' && !selectedRecipient)}
        >
          {selectedMethod === 'platform' ? 'Continue to Submit' : 'Confirm Selection'}
        </Button>
      </div>

      {/* Dream Board Modal */}
      <Dialog open={showDreamBoard} onOpenChange={setShowDreamBoard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select a Recipient from the Dream Board</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Recipients List */}
            <ScrollArea className="flex-1">
              <div className="grid gap-3 pr-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading dreamers...</div>
                ) : dreamRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No dream requests available</div>
                ) : (
                  dreamRequests.map((request) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => handleRecipientSelect(request)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all hover:shadow-sm w-full",
                        previewRecipient?.id === request.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={request.recipient?.avatar_url || 'https://via.placeholder.com/48'} 
                          alt="" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{request.recipient?.full_name || 'Anonymous'}</h4>
                            <RankBadge rank={request.recipient_profile?.rank || 'Bronze'} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            Needs: {request.device_needed}
                          </p>
                        </div>
                        {previewRecipient?.id === request.id && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Preview Panel */}
            {previewRecipient && (
              <div className="w-80 border-l pl-4 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-2">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={previewRecipient.recipient?.avatar_url || 'https://via.placeholder.com/56'} 
                        alt="" 
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{previewRecipient.recipient?.full_name || 'Anonymous'}</h3>
                        <RankBadge rank={previewRecipient.recipient_profile?.rank || 'Bronze'} size="sm" />
                      </div>
                    </div>

                    {/* Status & Institution */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{previewRecipient.recipient_profile?.school_or_career || 'Creator'}</span>
                        {previewRecipient.recipient_profile?.institution && (
                          <span className="text-muted-foreground">at {previewRecipient.recipient_profile.institution}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{getLocation(previewRecipient)}</span>
                      </div>
                    </div>

                    {/* Device Needed */}
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Device Needed</p>
                      <p className="font-semibold text-primary">{previewRecipient.device_needed}</p>
                    </div>

                    {/* Background Story */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Background Story</p>
                      <p className="text-sm">
                        {isStoryExpanded ? sanitizedStory : truncatedStory}
                      </p>
                      {hasMoreContent && (
                        <button 
                          type="button"
                          onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                          className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
                        >
                          {isStoryExpanded ? (
                            <>Show less <ChevronUp className="h-3 w-3" /></>
                          ) : (
                            <>Read more <ChevronDown className="h-3 w-3" /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Milestones */}
                    {getMilestones(previewRecipient).length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">What They'll Achieve</p>
                        <ul className="space-y-1.5">
                          {getMilestones(previewRecipient).map((milestone, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-xs flex-shrink-0">
                                {i + 1}
                              </span>
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Safety Notice */}
                    <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        For safety and fairness, personal contact details are not shared. All verification, matching, and delivery are handled by A Phone and A Dream.
                      </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        onClick={() => {
                          setSelectedRecipient(previewRecipient);
                          setShowDreamBoard(false);
                        }}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Donate to this recipient
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/recipient/profile/${previewRecipient.recipient_id}`} target="_blank">
                          View full profile
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
