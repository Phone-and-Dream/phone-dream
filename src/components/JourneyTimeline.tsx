import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface JourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  type: 'application' | 'device' | 'project' | 'milestone' | 'device_received' | 'skill_learned' | 'project_completed' | 'course_completed' | 'job_obtained' | 'other';
}

interface JourneyTimelineProps {
  events: JourneyEvent[];
  className?: string;
}

export function JourneyTimeline({ events, className }: JourneyTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getTypeColor = (type: JourneyEvent['type']) => {
    switch (type) {
      case 'application': return 'bg-primary/20 border-primary';
      case 'device': 
      case 'device_received': return 'bg-accent/20 border-accent';
      case 'project': 
      case 'project_completed': return 'bg-blue-500/20 border-blue-500';
      case 'milestone': 
      case 'job_obtained': return 'bg-amber-500/20 border-amber-500';
      case 'skill_learned':
      case 'course_completed': return 'bg-green-500/20 border-green-500';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-6">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon */}
            <div className={cn(
              "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl",
              getTypeColor(event.type)
            )}>
              {event.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {format(new Date(event.date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
