import { Calendar, MapPin, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/mockData';

export interface CareerEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  category: 'Conference' | 'Workshop' | 'Hackathon' | 'Meetup' | 'Training';
  image?: string;
  skillsGained?: string[];
}

interface CareerEventCardProps {
  event: CareerEvent;
  className?: string;
}

export function CareerEventCard({ event, className }: CareerEventCardProps) {
  const getCategoryColor = (category: CareerEvent['category']) => {
    switch (category) {
      case 'Conference': return 'bg-purple-500/10 text-purple-600';
      case 'Workshop': return 'bg-blue-500/10 text-blue-600';
      case 'Hackathon': return 'bg-orange-500/10 text-orange-600';
      case 'Meetup': return 'bg-green-500/10 text-green-600';
      case 'Training': return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={cn("glass-card rounded-xl overflow-hidden", className)}>
      {/* Image or placeholder */}
      <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <Image className="h-8 w-8 mb-1" />
            <span className="text-xs">Event Photo</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold line-clamp-1">{event.name}</h4>
          <span className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap", getCategoryColor(event.category))}>
            {event.category}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.description}
        </p>
        
        {event.skillsGained && event.skillsGained.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.skillsGained.map((skill) => (
              <span key={skill} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
