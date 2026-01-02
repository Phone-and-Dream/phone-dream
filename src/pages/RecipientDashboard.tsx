import { Link } from 'react-router-dom';
import { Copy, CheckCircle, ExternalLink, Calendar, MapPin, Award, Briefcase, BookOpen, FolderOpen, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RankBadge } from '@/components/ui/rank-badge';
import { StatCard } from '@/components/ui/stat-card';
import { mockRecipients, formatDate } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function RecipientDashboard() {
  const recipient = mockRecipients[0]; // Demo: use first recipient

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/recipient/profile/${recipient.id}`);
  };

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

        {/* Device Received */}
        {recipient.deviceReceived && (
          <div className="glass-card rounded-2xl p-6 border-2 border-accent/30 bg-accent/5">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" /> Device Received
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">{recipient.deviceReceived.condition}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-2xl font-bold">{recipient.deviceReceived.type}</p>
                <p className="text-muted-foreground">{recipient.deviceReceived.specs}</p>
                <p className="text-sm mt-2">Donated by <Link to={`/donor/${recipient.deviceReceived.donorId}`} className="text-primary hover:underline">{recipient.deviceReceived.donorName}</Link></p>
                <p className="text-xs text-muted-foreground mt-1">Received {formatDate(recipient.deviceReceived.dateReceived)}</p>
              </div>
              <div className="bg-card rounded-xl p-4 italic text-muted-foreground">
                "{recipient.deviceReceived.quote}"
              </div>
            </div>
          </div>
        )}

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
