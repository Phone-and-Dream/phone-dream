import { useParams, Link } from 'react-router-dom';
import { Share2, Twitter, Linkedin, Link as LinkIcon, Copy, CheckCircle, MapPin, Briefcase, Calendar, Award, BookOpen, FolderOpen, Sparkles, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RankBadge } from '@/components/ui/rank-badge';
import { StatCard } from '@/components/ui/stat-card';
import { NFTBadge } from '@/components/NFTBadge';
import { JourneyTimeline } from '@/components/JourneyTimeline';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicRecipientProfile } from '@/hooks/useProfiles';
import { useSkills, useCourses, useProjects, useJourneyEvents } from '@/hooks/useRecipientData';
import { useRecipientReceivedDonation } from '@/hooks/useDonations';

// Helper to update or create meta tags dynamically
const updateMetaTag = (property: string, content: string) => {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
  }
  if (element) {
    element.setAttribute('content', content);
  } else {
    const meta = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
};

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy');

export default function RecipientPublicProfile() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  
  const { data: recipientData, isLoading: profileLoading } = usePublicRecipientProfile(id);
  const { data: skills } = useSkills(id);
  const { data: courses } = useCourses(id);
  const { data: projects } = useProjects(id);
  const { data: journeyEvents } = useJourneyEvents(id);
  const { data: receivedDonation } = useRecipientReceivedDonation(id);
  
  const profile = recipientData?.profile;
  const profileUrl = `${window.location.origin}/recipient/profile/${id}`;

  // Dynamic OG meta tags for social sharing
  useEffect(() => {
    if (!profile || !recipientData) return;
    
    const originalTitle = document.title;
    
    document.title = `${profile.full_name || 'Recipient'} | A Phone and A Dream`;
    
    updateMetaTag('og:title', `${profile.full_name} - ${recipientData.tagline || 'Dreamer'}`);
    updateMetaTag('og:description', `${recipientData.creator_type || 'Creator'} from ${profile.location || 'Unknown'}, ${profile.country || ''}. See their journey on A Phone and A Dream.`);
    updateMetaTag('og:image', profile.avatar_url || '/placeholder.svg');
    updateMetaTag('og:url', profileUrl);
    updateMetaTag('twitter:title', `${profile.full_name} - ${recipientData.tagline || 'Dreamer'}`);
    updateMetaTag('twitter:description', `${recipientData.creator_type || 'Creator'} from ${profile.location || 'Unknown'}. See their journey on A Phone and A Dream.`);
    updateMetaTag('twitter:image', profile.avatar_url || '/placeholder.svg');

    return () => {
      document.title = originalTitle;
    };
  }, [recipientData, profile, profileUrl]);

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `Check out ${profile?.full_name || 'this recipient'}'s journey on A Phone and A Dream! 🚀`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = `Check out ${profile?.full_name || 'this recipient'}'s journey on A Phone and A Dream! ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Map journey events to the format expected by JourneyTimeline
  const journeyTimelineEvents = journeyEvents?.map(event => ({
    id: event.id,
    date: event.date,
    title: event.title,
    description: event.description || '',
    icon: event.icon || '📍',
    type: event.event_type,
  })) || [];

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16">
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-32 w-32 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!recipientData || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">This recipient profile doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/leaderboard">View Leaderboard</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20" />
          
          <div className="container">
            <div className="relative -mt-16 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <img 
                  src={profile.avatar_url || '/placeholder.svg'} 
                  alt={profile.full_name || 'Recipient'} 
                  className="w-32 h-32 rounded-2xl border-4 border-background object-cover shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-display font-bold">{profile.full_name}</h1>
                    <RankBadge rank={recipientData.rank} />
                    {recipientData.is_verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">{recipientData.tagline || 'Dreamer on a journey'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    {profile.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}{profile.country && `, ${profile.country}`}</span>
                    )}
                    {recipientData.creator_type && (
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {recipientData.creator_type}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Member since {formatDate(recipientData.created_at)}</span>
                  </div>
                </div>
                
                {/* Share & Support Buttons */}
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={shareToTwitter}>
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={shareToLinkedIn}>
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={shareToWhatsApp}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={copyProfileLink}>
                        <Copy className="h-4 w-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Link'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {!receivedDonation && (
                    <Button asChild>
                      <Link to={`/dream-board`}>
                        <Heart className="h-4 w-4 mr-2" />
                        Support Their Journey
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<FolderOpen className="h-5 w-5" />} label="Projects" value={projects?.length || 0} />
              <StatCard icon={<Sparkles className="h-5 w-5" />} label="Skills" value={skills?.length || 0} />
              <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses" value={courses?.length || 0} />
              <StatCard icon={<Award className="h-5 w-5" />} label="XP Points" value={recipientData.xp.toLocaleString()} />
            </div>

            {/* Device Received with NFT Badge */}
            {receivedDonation && (
              <div className="glass-card rounded-2xl p-6 border-2 border-accent/30 bg-accent/5">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-accent" /> Device Received
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-2xl font-bold">{receivedDonation.device_type}</p>
                    <p className="text-muted-foreground">{receivedDonation.device_specs || 'Device specifications not provided'}</p>
                    <p className="text-sm mt-2">Donated by <span className="text-primary font-medium">{receivedDonation.donor?.full_name || 'Anonymous Donor'}</span></p>
                    {receivedDonation.delivered_at && (
                      <p className="text-xs text-muted-foreground mt-1">Received {formatDate(receivedDonation.delivered_at)}</p>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <NFTBadge
                      donorName={receivedDonation.donor?.full_name || 'Anonymous'}
                      donorId={receivedDonation.donor_id}
                      recipientName={profile.full_name || 'Recipient'}
                      recipientId={id || ''}
                      deviceType={receivedDonation.device_type}
                      condition={receivedDonation.condition}
                      txHash={receivedDonation.attestation?.[0]?.tx_hash || '0x0000...0000'}
                      date={receivedDonation.delivered_at || receivedDonation.created_at}
                      linkTo="donor"
                      size="md"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Journey Timeline */}
            {journeyTimelineEvents.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-display font-semibold mb-6">Journey Timeline</h2>
                <JourneyTimeline events={journeyTimelineEvents} />
              </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-semibold mb-4">Projects</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className={cn("glass-card rounded-xl p-4", project.is_featured && "ring-2 ring-primary")}>
                      {project.thumbnail_url ? (
                        <img src={project.thumbnail_url} alt={project.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                      ) : (
                        <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <FolderOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{project.description || 'No description'}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tech_stack?.map((tech) => (
                          <span key={tech} className="text-xs px-2 py-0.5 bg-muted rounded">{tech}</span>
                        ))}
                      </div>
                      {project.built_with_donated_device && (
                        <p className="text-xs text-accent flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Built with donated device</p>
                      )}
                      {(project.live_url || project.github_url) && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                          {project.live_url && (
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> Live
                            </a>
                          )}
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> GitHub
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Courses */}
            <div className="grid md:grid-cols-2 gap-6">
              {skills && skills.length > 0 && (
                <div>
                  <h2 className="text-xl font-display font-semibold mb-4">Skills</h2>
                  <div className="glass-card rounded-xl p-4 space-y-3">
                    {skills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2">
                            {skill.name}
                            {skill.is_verified && <CheckCircle className="h-3 w-3 text-accent" />}
                          </span>
                          <span className="text-muted-foreground capitalize">{skill.level}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${skill.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {courses && courses.length > 0 && (
                <div>
                  <h2 className="text-xl font-display font-semibold mb-4">Courses</h2>
                  <div className="glass-card rounded-xl p-4 space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.provider}</p>
                        </div>
                        <span className={cn("text-xs px-2 py-1 rounded-full", course.status === 'completed' ? "bg-accent text-accent-foreground" : "bg-muted")}>
                          {course.status === 'completed' ? '✓ Done' : `${course.progress}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Empty State for no content */}
            {(!projects || projects.length === 0) && (!skills || skills.length === 0) && (!courses || courses.length === 0) && (
              <div className="text-center py-12 glass-card rounded-2xl">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Journey Just Beginning</h3>
                <p className="text-muted-foreground">This recipient is just getting started. Check back soon to see their progress!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}