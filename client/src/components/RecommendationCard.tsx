import { CheckCircle, Clock, Building, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Recommendation {
  id: string;
  recommenderName: string;
  recommenderTitle: string;
  recommenderOrganization: string;
  relationship: string;
  message: string;
  status: 'pending' | 'verified' | 'approved';
  submittedDate: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

export function RecommendationCard({ recommendation, className }: RecommendationCardProps) {
  const getStatusBadge = (status: Recommendation['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
            <CheckCircle className="h-3 w-3" />
            Verified
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600">
            <CheckCircle className="h-3 w-3" />
            Pending Approval
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
            <Clock className="h-3 w-3" />
            Pending Verification
          </span>
        );
    }
  };

  return (
    <div className={cn("glass-card rounded-xl p-4", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">{recommendation.recommenderName}</h4>
            <p className="text-sm text-muted-foreground">{recommendation.recommenderTitle}</p>
          </div>
        </div>
        {getStatusBadge(recommendation.status)}
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Building className="h-3 w-3" />
          {recommendation.recommenderOrganization}
        </span>
        <span>•</span>
        <span>{recommendation.relationship}</span>
      </div>
      
      <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
        "{recommendation.message}"
      </blockquote>
    </div>
  );
}
