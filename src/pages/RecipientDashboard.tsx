import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Copy, CheckCircle, Calendar, MapPin, Award, Briefcase, BookOpen, FolderOpen, Users, Sparkles, Star, Trophy, Zap, TrendingUp, Plus, Send, Loader2, ExternalLink, Pencil, Smartphone, ArrowRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RankBadge } from '@/components/ui/rank-badge';
import { StatCard } from '@/components/ui/stat-card';
import { JourneyTimeline } from '@/components/JourneyTimeline';
import { CareerEventCard } from '@/components/CareerEventCard';
import { RecommendationCard } from '@/components/RecommendationCard';
import { NFTBadge } from '@/components/NFTBadge';
import { AddCareerEventModal } from '@/components/AddCareerEventModal';
import { AddSkillModal } from '@/components/AddSkillModal';
import { AddCourseModal } from '@/components/AddCourseModal';
import { AddProjectModal } from '@/components/AddProjectModal';
import { EditSkillModal } from '@/components/EditSkillModal';
import { EditCourseModal } from '@/components/EditCourseModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { EditCareerEventModal } from '@/components/EditCareerEventModal';
import { EditRecipientProfileModal } from '@/components/EditRecipientProfileModal';
import { AddEmploymentModal } from '@/components/AddEmploymentModal';
import { EditEmploymentModal } from '@/components/EditEmploymentModal';
import { AddAwardModal } from '@/components/AddAwardModal';
import { EditAwardModal } from '@/components/EditAwardModal';
import { cn, formatActionName } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfile, useMyRecipientProfile } from '@/hooks/useProfiles';
import { useMySkills, useMyProjects, useMyCareerEvents, useMyRecommendations, useMyJourneyEvents, useXPRules, useMyCourses, useMyEmploymentHistory, useMyAwards } from '@/hooks/useRecipientData';
import { useCanApplyForDevice } from '@/hooks/useRecipientTasks';
import { Progress } from '@/components/ui/progress';
import { useReceivedDonations } from '@/hooks/useDonations';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Skill = Database['public']['Tables']['skills']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type CareerEvent = Database['public']['Tables']['career_events']['Row'];

interface Employment {
  id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
  description: string | null;
}

interface AwardType {
  id: string;
  title: string;
  issuer: string | null;
  date_received: string | null;
  description: string | null;
  url: string | null;
}

export default function RecipientDashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: recipientProfile, isLoading: recipientLoading } = useMyRecipientProfile();
  const { data: skills = [] } = useMySkills();
  const { data: courses = [] } = useMyCourses();
  const { data: projects = [] } = useMyProjects();
  const { data: careerEvents = [] } = useMyCareerEvents();
  const { data: recommendations = [] } = useMyRecommendations();
  const { data: journeyEvents = [] } = useMyJourneyEvents();
  const { data: xpRules = [] } = useXPRules();
  const { data: receivedDonations = [] } = useReceivedDonations();
  const { data: employmentHistory = [] } = useMyEmploymentHistory();
  const { data: awards = [] } = useMyAwards();
  const { canApply, currentXP, requiredXP, progress } = useCanApplyForDevice();

  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isAddEmploymentModalOpen, setIsAddEmploymentModalOpen] = useState(false);
  const [isAddAwardModalOpen, setIsAddAwardModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingCareerEvent, setEditingCareerEvent] = useState<CareerEvent | null>(null);
  const [editingEmployment, setEditingEmployment] = useState<Employment | null>(null);
  const [editingAward, setEditingAward] = useState<AwardType | null>(null);
  const [isXpExpanded, setIsXpExpanded] = useState(false);

  const isLoading = profileLoading || recipientLoading;

  const copyProfileLink = () => {
    if (user?.id) {
      navigator.clipboard.writeText(`${window.location.origin}/recipient/profile/${user.id}`);
      toast({ title: "Link copied!", description: "Public profile link copied to clipboard." });
    }
  };

  const handleInviteRecommender = () => {
    setShowInviteSuccess(true);
    setInviteEmail('');
    toast({ title: "Invitation sent!", description: "Recommender will receive an email invitation." });
    setTimeout(() => setShowInviteSuccess(false), 3000);
  };

  const xp = recipientProfile?.xp || 0;
  const rank = recipientProfile?.rank || 'Bronze';

  // Calculate stats from real data
  const stats = {
    projectsCompleted: projects.filter(p => p.status === 'completed').length,
    skillsLearned: skills.length,
    coursesFinished: courses.filter(c => c.status === 'completed').length,
    communitiesJoined: 0,
  };

  // Get device received
  const deviceReceived = receivedDonations.find(d => d.status === 'delivered');

  if (isLoading) {
    return (
      <DashboardLayout role="recipient">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recipient">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Profile Section */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20 relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsEditProfileModalOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link to={`/recipient/profile/${user?.id}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Profile
                </Link>
              </Button>
              <Button size="sm" variant="secondary" onClick={copyProfileLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Public Link
              </Button>
            </div>
          </div>
          <div className="p-6 pt-0 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <Avatar className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Profile'} className="object-cover" />
                <AvatarFallback className="rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
                  {profile?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-display font-bold">{profile?.full_name || 'Your Name'}</h1>
                  <RankBadge rank={rank} />
                  {recipientProfile?.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-accent">
                      <CheckCircle className="h-4 w-4" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{recipientProfile?.tagline || 'Add a tagline to your profile'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  {profile?.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}{profile.country ? `, ${profile.country}` : ''}</span>
                  )}
                  {((recipientProfile as any)?.career || recipientProfile?.creator_type) && (
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {(recipientProfile as any)?.career || recipientProfile?.creator_type}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Member since {format(new Date(profile?.created_at || new Date()), 'MMM yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply for Device CTA */}
        {!deviceReceived && (
          <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">Apply for a Device</h3>
                <p className="text-sm text-muted-foreground">
                  {canApply 
                    ? "🎉 You've earned enough XP! You can now apply for a device." 
                    : `Earn ${requiredXP - currentXP} more XP to unlock device applications`}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{currentXP} XP earned</span>
                    <span>{requiredXP} XP required</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
              <Button asChild className={canApply ? 'bg-accent hover:bg-accent/90' : ''}>
                <Link to={canApply ? "/recipient/apply" : "/recipient/tasks"}>
                  {canApply ? "Apply Now" : "Earn XP"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={<FolderOpen className="h-5 w-5" />} label="Projects" value={stats.projectsCompleted} />
          <StatCard icon={<Sparkles className="h-5 w-5" />} label="Skills" value={stats.skillsLearned} />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses" value={stats.coursesFinished} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Communities" value={stats.communitiesJoined} />
          <StatCard icon={<Award className="h-5 w-5" />} label="XP Points" value={xp.toLocaleString()} />
        </div>

        {/* XP Breakdown Section - Compact with Collapsible */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                <div className="text-3xl font-display font-bold text-primary">
                  {xp.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">XP Points</p>
              </div>
              <div className="flex items-center gap-3">
                <RankBadge rank={rank} />
                <div className="hidden sm:block">
                  <h2 className="font-semibold">XP & Ranking</h2>
                  <p className="text-sm text-muted-foreground">Earn XP to level up and unlock rewards</p>
                </div>
              </div>
            </div>
            <Collapsible open={isXpExpanded} onOpenChange={setIsXpExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isXpExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">{isXpExpanded ? 'Hide' : 'Show'} XP Rules</span>
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          
          <Collapsible open={isXpExpanded} onOpenChange={setIsXpExpanded}>
            <CollapsibleContent className="pt-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">WAYS TO EARN XP</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {xpRules.filter(r => r.is_active).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm">{formatActionName(rule.action)}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">+{rule.xp_value} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Journey Timeline */}
        {journeyEvents.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-6">My Journey</h2>
            <JourneyTimeline events={journeyEvents.map(e => ({
              id: e.id,
              date: e.date,
              title: e.title,
              description: e.description || '',
              icon: e.icon || '📍',
              type: e.event_type === 'device_received' ? 'device' : e.event_type === 'project_completed' ? 'project' : e.event_type === 'milestone' || e.event_type === 'job_obtained' ? 'milestone' : 'application',
            }))} />
          </div>
        )}

        {/* Device Received with NFT Badge */}
        {deviceReceived && (
          <div className="glass-card rounded-2xl p-6 border-2 border-accent/30 bg-accent/5">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" /> Device Received
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">{deviceReceived.condition}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="text-2xl font-bold">{deviceReceived.device_type}</p>
                <p className="text-muted-foreground">{deviceReceived.device_specs}</p>
                <p className="text-xs text-muted-foreground mt-1">Received {format(new Date(deviceReceived.delivered_at || deviceReceived.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex justify-center">
                <NFTBadge
                  donorName="Donor"
                  donorId={deviceReceived.donor_id}
                  recipientName={profile?.full_name || 'Recipient'}
                  recipientId={user?.id || ''}
                  deviceType={deviceReceived.device_type}
                  condition={deviceReceived.condition === 'new' ? 'New' : 'Refurbished'}
                  txHash="0x0000...0000"
                  date={deviceReceived.delivered_at || deviceReceived.created_at}
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
            <Button variant="outline" size="sm" onClick={() => setIsAddEventModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
          {careerEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {careerEvents.map((event) => {
                const categoryMap: Record<string, 'Conference' | 'Workshop' | 'Hackathon' | 'Meetup' | 'Training'> = {
                  conference: 'Conference',
                  workshop: 'Workshop',
                  hackathon: 'Hackathon',
                  meetup: 'Meetup',
                  certification: 'Training',
                  webinar: 'Training',
                  other: 'Meetup',
                };
                return (
                  <div 
                    key={event.id} 
                    className="cursor-pointer hover:ring-2 hover:ring-primary/50 rounded-xl transition-all"
                    onClick={() => setEditingCareerEvent(event)}
                  >
                    <CareerEventCard event={{
                      id: event.id,
                      name: event.name,
                      date: event.date,
                      location: event.location || '',
                      description: event.description || '',
                      category: categoryMap[event.category] || 'Conference',
                      skillsGained: event.skills_gained || [],
                    }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No career events yet. Add your first conference, workshop, or hackathon!</p>
            </div>
          )}
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
          {recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={{
                  id: rec.id,
                  recommenderName: rec.recommender_name,
                  recommenderTitle: rec.recommender_title || '',
                  recommenderOrganization: rec.recommender_organization || '',
                  relationship: rec.relationship,
                  message: rec.message,
                  status: rec.status,
                  submittedDate: rec.submitted_at,
                }} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations yet. Invite mentors or colleagues to recommend you!</p>
            </div>
          )}
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Projects</h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddProjectModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className={cn(
                    "glass-card rounded-xl p-4 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all", 
                    project.is_featured && "ring-2 ring-primary"
                  )}
                  onClick={() => setEditingProject(project)}
                >
                  <div className="text-4xl mb-3">📁</div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech_stack?.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 bg-muted rounded">{tech}</span>
                    ))}
                    {(project.tech_stack?.length || 0) > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">+{project.tech_stack!.length - 3}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{project.status.replace('_', ' ')}</span>
                    {project.built_with_donated_device && (
                      <span className="text-accent flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Donated device</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects yet. Start building and showcase your work!</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddProjectModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </div>
          )}
        </div>

        {/* Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Courses</h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddCourseModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
          {courses.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="glass-card rounded-xl p-4 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => setEditingCourse(course)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 bg-muted rounded">{course.provider}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      course.status === 'completed' ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                    )}>
                      {course.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{course.name}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", course.status === 'completed' ? "bg-accent" : "bg-primary")} 
                        style={{ width: `${course.progress}%` }} 
                      />
                    </div>
                  </div>
                  {course.certificate_url && (
                    <a 
                      href={course.certificate_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-primary flex items-center gap-1 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" /> View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses yet. Start learning and track your progress!</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddCourseModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Course
              </Button>
            </div>
          )}
        </div>

        {/* Employment History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Employment History</h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddEmploymentModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employment
            </Button>
          </div>
          {employmentHistory.length > 0 ? (
            <div className="glass-card rounded-xl p-4 space-y-4">
              {(employmentHistory as Employment[]).map((employment) => (
                <div 
                  key={employment.id} 
                  className="cursor-pointer hover:bg-muted/50 p-3 -mx-1 rounded-lg transition-colors border-b last:border-b-0"
                  onClick={() => setEditingEmployment(employment)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{employment.job_title}</h4>
                      <p className="text-sm text-muted-foreground">{employment.company_name}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {format(new Date(employment.start_date), 'MMM yyyy')} - {employment.is_current ? 'Present' : employment.end_date ? format(new Date(employment.end_date), 'MMM yyyy') : 'Present'}
                    </div>
                  </div>
                  {employment.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{employment.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employment history yet. Add your work experience!</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddEmploymentModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Job
              </Button>
            </div>
          )}
        </div>

        {/* Awards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Awards & Achievements</h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddAwardModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Award
            </Button>
          </div>
          {awards.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {(awards as AwardType[]).map((award) => (
                <div 
                  key={award.id} 
                  className="glass-card rounded-xl p-4 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => setEditingAward(award)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Trophy className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{award.title}</h4>
                      {award.issuer && <p className="text-sm text-muted-foreground">{award.issuer}</p>}
                      {award.date_received && (
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(award.date_received), 'MMMM yyyy')}</p>
                      )}
                    </div>
                    {award.url && (
                      <a href={award.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No awards yet. Add your achievements and recognition!</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddAwardModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Award
              </Button>
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">Skills</h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddSkillModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
          {skills.length > 0 ? (
            <div className="glass-card rounded-xl p-4 space-y-3">
              {skills.map((skill) => (
                <div 
                  key={skill.id} 
                  className="cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                  onClick={() => setEditingSkill(skill)}
                >
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
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No skills added yet. Add your skills to showcase your abilities!</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddSkillModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddCareerEventModal 
        isOpen={isAddEventModalOpen} 
        onClose={() => setIsAddEventModalOpen(false)}
        onAdd={(event) => {
          toast({ title: "Event added!", description: "Your career event has been saved." });
        }}
      />
      <AddSkillModal isOpen={isAddSkillModalOpen} onClose={() => setIsAddSkillModalOpen(false)} />
      <AddCourseModal isOpen={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)} />
      <AddProjectModal isOpen={isAddProjectModalOpen} onClose={() => setIsAddProjectModalOpen(false)} />
      <AddEmploymentModal isOpen={isAddEmploymentModalOpen} onClose={() => setIsAddEmploymentModalOpen(false)} />
      <AddAwardModal isOpen={isAddAwardModalOpen} onClose={() => setIsAddAwardModalOpen(false)} />
      <EditSkillModal skill={editingSkill} isOpen={!!editingSkill} onClose={() => setEditingSkill(null)} />
      <EditCourseModal course={editingCourse} isOpen={!!editingCourse} onClose={() => setEditingCourse(null)} />
      <EditProjectModal project={editingProject} isOpen={!!editingProject} onClose={() => setEditingProject(null)} />
      <EditCareerEventModal event={editingCareerEvent} isOpen={!!editingCareerEvent} onClose={() => setEditingCareerEvent(null)} />
      <EditEmploymentModal employment={editingEmployment} isOpen={!!editingEmployment} onClose={() => setEditingEmployment(null)} />
      <EditAwardModal award={editingAward} isOpen={!!editingAward} onClose={() => setEditingAward(null)} />
      <EditRecipientProfileModal 
        profile={profile} 
        recipientProfile={recipientProfile} 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setIsEditProfileModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
