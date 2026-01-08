import { useParams, Link } from 'react-router-dom';
import { Share2, Twitter, Linkedin, Link as LinkIcon, Copy, CheckCircle, MapPin, Briefcase, Calendar, Award, BookOpen, FolderOpen, Users, Sparkles, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RankBadge } from '@/components/ui/rank-badge';
import { StatCard } from '@/components/ui/stat-card';
import { NFTBadge } from '@/components/NFTBadge';
import { JourneyTimeline } from '@/components/JourneyTimeline';
import { mockRecipients, formatDate } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export default function RecipientPublicProfile() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  
  const recipient = mockRecipients.find(r => r.id === id) || mockRecipients[0];
  const profileUrl = `${window.location.origin}/recipient/profile/${recipient.id}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `Check out ${recipient.name}'s journey on A Phone and A Dream! 🚀`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = `Check out ${recipient.name}'s journey on A Phone and A Dream! ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20">
            <img 
              src={recipient.coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          
          <div className="container">
            <div className="relative -mt-16 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <img 
                  src={recipient.avatar} 
                  alt={recipient.name} 
                  className="w-32 h-32 rounded-2xl border-4 border-background object-cover shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-display font-bold">{recipient.name}</h1>
                    <RankBadge rank={recipient.rank} />
                    {recipient.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">{recipient.tagline}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {recipient.location}, {recipient.country}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {recipient.creatorType}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Member since {formatDate(recipient.memberSince)}</span>
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
                  
                  {!recipient.deviceReceived && (
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard icon={<FolderOpen className="h-5 w-5" />} label="Projects" value={recipient.stats.projectsCompleted} />
              <StatCard icon={<Sparkles className="h-5 w-5" />} label="Skills" value={recipient.stats.skillsLearned} />
              <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses" value={recipient.stats.coursesFinished} />
              <StatCard icon={<Users className="h-5 w-5" />} label="Communities" value={recipient.stats.communitiesJoined} />
              <StatCard icon={<Award className="h-5 w-5" />} label="XP Points" value={recipient.xp.toLocaleString()} />
            </div>

            {/* Device Received with NFT Badge */}
            {recipient.deviceReceived && (
              <div className="glass-card rounded-2xl p-6 border-2 border-accent/30 bg-accent/5">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-accent" /> Device Received
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-2xl font-bold">{recipient.deviceReceived.type}</p>
                    <p className="text-muted-foreground">{recipient.deviceReceived.specs}</p>
                    <p className="text-sm mt-2">Donated by <span className="text-primary font-medium">{recipient.deviceReceived.donorName}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Received {formatDate(recipient.deviceReceived.dateReceived)}</p>
                    <div className="mt-4 p-4 bg-card rounded-xl italic text-muted-foreground">
                      "{recipient.deviceReceived.quote}"
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <NFTBadge
                      donorName={recipient.deviceReceived.donorName}
                      donorId={recipient.deviceReceived.donorId}
                      recipientName={recipient.name}
                      recipientId={recipient.id}
                      deviceType={recipient.deviceReceived.type}
                      condition={recipient.deviceReceived.condition}
                      txHash={recipient.deviceReceived.txHash}
                      date={recipient.deviceReceived.dateReceived}
                      linkTo="donor"
                      size="md"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Journey Timeline */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-display font-semibold mb-6">Journey Timeline</h2>
              <JourneyTimeline events={recipient.journey} />
            </div>

            {/* Projects */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-4">Projects</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {recipient.projects.map((project) => (
                  <div key={project.id} className={cn("glass-card rounded-xl p-4", project.isFeatured && "ring-2 ring-primary")}>
                    <div className="text-4xl mb-3">{project.thumbnail}</div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="text-xs px-2 py-0.5 bg-muted rounded">{tech}</span>
                      ))}
                    </div>
                    {project.builtWithDonatedDevice && (
                      <p className="text-xs text-accent flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Built with donated device</p>
                    )}
                    {(project.liveUrl || project.githubUrl) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> Live
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Courses */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-display font-semibold mb-4">Skills</h2>
                <div className="glass-card rounded-xl p-4 space-y-3">
                  {recipient.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          {skill.name}
                          {skill.isVerified && <CheckCircle className="h-3 w-3 text-accent" />}
                        </span>
                        <span className="text-muted-foreground">{skill.level}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${skill.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold mb-4">Courses</h2>
                <div className="glass-card rounded-xl p-4 space-y-3">
                  {recipient.courses.map((course) => (
                    <div key={course.id} className="flex items-center gap-3">
                      <span className="text-2xl">{course.thumbnail}</span>
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
            </div>

            {/* Communities */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-4">Communities</h2>
              <div className="flex flex-wrap gap-3">
                {recipient.communities.map((community) => (
                  <div key={community.id} className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
                    <span className="text-xl">{community.logo}</span>
                    <div>
                      <p className="font-medium text-sm">{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.memberCount.toLocaleString()} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
