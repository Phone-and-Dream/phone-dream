import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, CheckCircle, ExternalLink, Calendar, MapPin, Award, Briefcase, BookOpen, FolderOpen, Users, Sparkles, Star, Trophy, Zap, TrendingUp, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RankBadge } from '@/components/ui/rank-badge';
import { StatCard } from '@/components/ui/stat-card';
import { JourneyTimeline } from '@/components/JourneyTimeline';
import { CareerEventCard, CareerEvent } from '@/components/CareerEventCard';
import { RecommendationCard, Recommendation } from '@/components/RecommendationCard';
import { NFTBadge } from '@/components/NFTBadge';
import { mockRecipients, formatDate } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Mock career events data
const mockCareerEvents: CareerEvent[] = [
  {
    id: 'ce1',
    name: 'Lagos Tech Summit 2024',
    date: '2024-09-15',
    location: 'Lagos, Nigeria',
    description: 'Attended sessions on mobile development and AI. Connected with industry leaders and participated in networking events.',
    category: 'Conference',
    skillsGained: ['Networking', 'AI Basics', 'Career Growth'],
  },
  {
    id: 'ce2',
    name: 'React Native Workshop',
    date: '2024-08-20',
    location: 'Virtual',
    description: 'Intensive 2-day workshop on building production-ready React Native apps with best practices.',
    category: 'Workshop',
    skillsGained: ['React Native', 'TypeScript', 'Testing'],
  },
  {
    id: 'ce3',
    name: 'DevCareer Hackathon',
    date: '2024-07-05',
    location: 'Accra, Ghana',
    description: 'Built an education platform in 48 hours. Won 3rd place for innovative solution to rural education challenges.',
    category: 'Hackathon',
    skillsGained: ['Teamwork', 'Rapid Prototyping', 'Pitching'],
  },
];

// Mock recommendations data
const mockRecommendations: Recommendation[] = [
  {
    id: 'rec1',
    recommenderName: 'Dr. Chidi Okoro',
    recommenderTitle: 'Professor of Computer Science',
    recommenderOrganization: 'University of Lagos',
    relationship: 'Academic Advisor',
    message: 'Amara is one of the most dedicated students I have mentored. Her passion for mobile development and commitment to using technology for social good is truly inspiring. She has demonstrated exceptional problem-solving skills and leadership qualities.',
    status: 'approved',
    submittedDate: '2024-06-15',
  },
  {
    id: 'rec2',
    recommenderName: 'Sarah Williams',
    recommenderTitle: 'Senior Developer',
    recommenderOrganization: 'Tech Forward Foundation',
    relationship: 'Mentor',
    message: 'I had the pleasure of mentoring Amara through her first major project. Her ability to learn quickly and apply new concepts is remarkable. She consistently goes above and beyond expectations.',
    status: 'verified',
    submittedDate: '2024-08-20',
  },
  {
    id: 'rec3',
    recommenderName: 'James Adeyemi',
    recommenderTitle: 'Founder',
    recommenderOrganization: 'DevCareer Africa',
    relationship: 'Community Leader',
    message: 'Amara has been an active contributor to our community, helping newcomers and sharing her knowledge freely.',
    status: 'pending',
    submittedDate: '2024-11-01',
  },
];

// XP breakdown sources
const xpSources = [
  { label: 'Projects Completed', points: 800, icon: FolderOpen },
  { label: 'Courses Finished', points: 600, icon: BookOpen },
  { label: 'Community Contributions', points: 450, icon: Users },
  { label: 'Events Attended', points: 300, icon: Calendar },
  { label: 'Recommendations Received', points: 200, icon: Star },
  { label: 'Daily Streaks', points: 100, icon: Zap },
];

export default function RecipientDashboard() {
  const recipient = mockRecipients[0]; // Demo: use first recipient
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/recipient/profile/${recipient.id}`);
  };

  const handleInviteRecommender = () => {
    // Mock invite action
    setShowInviteSuccess(true);
    setInviteEmail('');
    setTimeout(() => setShowInviteSuccess(false), 3000);
  };

  const totalXP = xpSources.reduce((sum, source) => sum + source.points, 0);

  return (
    <DashboardLayout role="recipient">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Profile Section */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20 relative">
            <Button size="sm" variant="secondary" className="absolute top-4 right-4" onClick={copyProfileLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Public Link
            </Button>
          </div>
          <div className="p-6 pt-0 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <img src={recipient.avatar} alt={recipient.name} className="w-24 h-24 rounded-2xl border-4 border-card object-cover shadow-lg" />
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-display font-bold">{recipient.name}</h1>
                  <RankBadge rank={recipient.rank} />
                  {recipient.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-accent">
                      <CheckCircle className="h-4 w-4" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{recipient.tagline}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {recipient.location}, {recipient.country}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {recipient.creatorType}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Member since {formatDate(recipient.memberSince)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={<FolderOpen className="h-5 w-5" />} label="Projects" value={recipient.stats.projectsCompleted} />
          <StatCard icon={<Sparkles className="h-5 w-5" />} label="Skills" value={recipient.stats.skillsLearned} />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses" value={recipient.stats.coursesFinished} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Communities" value={recipient.stats.communitiesJoined} />
          <StatCard icon={<Award className="h-5 w-5" />} label="XP Points" value={recipient.xp.toLocaleString()} />
        </div>

        {/* XP Breakdown Section */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            XP Breakdown & Ranking
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* XP Score Display */}
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
              <div className="text-5xl font-display font-bold text-primary mb-2">
                {recipient.xp.toLocaleString()}
              </div>
              <p className="text-muted-foreground mb-4">Total XP Points</p>
              <RankBadge rank={recipient.rank} />
              <p className="text-sm text-muted-foreground mt-3">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                #{recipient.leaderboardPosition} of {recipient.totalRecipients} recipients
              </p>
            </div>

            {/* XP Sources */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4">XP SOURCES</h3>
              {xpSources.map((source) => (
                <div key={source.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <source.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{source.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${(source.points / totalXP) * 100}%` }} 
                      />
                    </div>
                    <span className="text-sm font-semibold text-primary w-16 text-right">+{source.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-semibold mb-6">My Journey</h2>
          <JourneyTimeline events={recipient.journey} />
        </div>

        {/* Device Received with NFT Badge */}
        {recipient.deviceReceived && (
          <div className="glass-card rounded-2xl p-6 border-2 border-accent/30 bg-accent/5">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" /> Device Received
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">{recipient.deviceReceived.condition}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="text-2xl font-bold">{recipient.deviceReceived.type}</p>
                <p className="text-muted-foreground">{recipient.deviceReceived.specs}</p>
                <p className="text-sm mt-2">Donated by <Link to={`/donor/profile/${recipient.deviceReceived.donorId}`} className="text-primary hover:underline">{recipient.deviceReceived.donorName}</Link></p>
                <p className="text-xs text-muted-foreground mt-1">Received {formatDate(recipient.deviceReceived.dateReceived)}</p>
                <div className="bg-card rounded-xl p-4 mt-4 italic text-muted-foreground">
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
                />
              </div>
            </div>
          </div>
        )}

        {/* Career Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Career Events Attended</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {mockCareerEvents.map((event) => (
              <CareerEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Recommendations</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Invite Recommender
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Someone to Recommend You</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Send an invitation to a mentor, professor, employer, or community leader who can vouch for your work and character.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="email">Recommender's Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="recommender@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Hi, I'd be honored if you could write a recommendation for my A Phone and A Dream portfolio..."
                      rows={3}
                    />
                  </div>
                  {showInviteSuccess && (
                    <div className="text-sm text-accent flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Invitation sent successfully!
                    </div>
                  )}
                  <Button className="w-full" onClick={handleInviteRecommender} disabled={!inviteEmail}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {mockRecommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
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
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Courses side by side */}
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
                      {skill.isNew && <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">New</span>}
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
      </div>
    </DashboardLayout>
  );
}
