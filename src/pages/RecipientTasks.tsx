import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Zap, 
  Trophy, 
  Twitter, 
  User, 
  FileText, 
  Star, 
  Lock, 
  Unlock,
  Smartphone,
  ArrowRight,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTasksWithProgress, useStartTask, useCanApplyForDevice, TaskWithProgress } from '@/hooks/useRecipientTasks';
import { useMyProfile, useMyRecipientProfile } from '@/hooks/useProfiles';
import { useMySkills, useMyProjects, useMyCourses, useMyCareerEvents, useMyRecommendations } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const XP_THRESHOLD = 100;

// Map task types to icons
const taskTypeIcons: Record<string, React.ReactNode> = {
  social: <Twitter className="h-5 w-5" />,
  profile: <User className="h-5 w-5" />,
  platform: <Star className="h-5 w-5" />,
  custom: <FileText className="h-5 w-5" />,
};

function TaskCard({ 
  task, 
  onStart, 
  isStarting,
  isAutoCompleted
}: { 
  task: TaskWithProgress; 
  onStart: (taskId: string) => void;
  isStarting: boolean;
  isAutoCompleted: boolean;
}) {
  const status = task.recipientTask?.status || 'not_started';
  const isCompleted = status === 'completed' || isAutoCompleted;
  const isPending = status === 'pending_verification';
  const isInProgress = status === 'in_progress';
  
  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-accent text-accent-foreground">Completed</Badge>;
    }
    if (isPending) {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
    if (isInProgress) {
      return <Badge variant="outline">In Progress</Badge>;
    }
    return null;
  };

  const handleAction = () => {
    if (task.task_type === 'social' && task.action_url) {
      window.open(task.action_url, '_blank');
    }
    onStart(task.id);
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      isCompleted && "bg-accent/5 border-accent/30",
      !isCompleted && "hover:shadow-md hover:border-primary/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
            isCompleted ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"
          )}>
            {isCompleted ? <CheckCircle className="h-6 w-6" /> : taskTypeIcons[task.task_type] || <Zap className="h-6 w-6" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={cn(
                  "font-semibold",
                  isCompleted && "text-muted-foreground line-through"
                )}>
                  {task.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {task.description}
                </p>
              </div>
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Zap className="h-4 w-4" />
                +{task.xp_value} XP
              </div>
              
              {!isCompleted && !isPending && (
                <Button 
                  size="sm" 
                  variant={isInProgress ? "default" : "outline"}
                  onClick={handleAction}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isInProgress ? (
                    <>Complete</>
                  ) : task.task_type === 'social' ? (
                    <>
                      Open <ExternalLink className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    <>Start Task</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecipientTasks() {
  const { data: tasks, isLoading } = useTasksWithProgress();
  const { canApply, currentXP, progress } = useCanApplyForDevice();
  const { data: profile } = useMyProfile();
  const { data: recipientProfile } = useMyRecipientProfile();
  const { data: skills = [] } = useMySkills();
  const { data: projects = [] } = useMyProjects();
  const { data: courses = [] } = useMyCourses();
  const { data: careerEvents = [] } = useMyCareerEvents();
  const { data: recommendations = [] } = useMyRecommendations();
  
  const startTask = useStartTask();
  const [startingTaskId, setStartingTaskId] = useState<string | null>(null);

  // Check auto-completion conditions based on profile data
  const getAutoCompletedTasks = () => {
    const autoCompleted: Record<string, boolean> = {};
    
    tasks.forEach(task => {
      const title = task.title.toLowerCase();
      
      // Check profile-based auto-completions
      if (title.includes('bio') && recipientProfile?.bio) {
        autoCompleted[task.id] = true;
      }
      if (title.includes('location') && profile?.location) {
        autoCompleted[task.id] = true;
      }
      if (title.includes('tagline') && recipientProfile?.tagline) {
        autoCompleted[task.id] = true;
      }
      if (title.includes('skill') && skills.length > 0) {
        autoCompleted[task.id] = true;
      }
      if (title.includes('project') && projects.length > 0) {
        autoCompleted[task.id] = true;
      }
      if (title.includes('course') && courses.length > 0) {
        autoCompleted[task.id] = true;
      }
      if (title.includes('career event') && careerEvents.length > 0) {
        autoCompleted[task.id] = true;
      }
      if (title.includes('recommendation') && recommendations.length > 0) {
        autoCompleted[task.id] = true;
      }
    });
    
    return autoCompleted;
  };

  const autoCompletedTasks = getAutoCompletedTasks();
  
  // Calculate actual XP including auto-completed tasks
  const calculateTotalXP = () => {
    let total = currentXP;
    tasks.forEach(task => {
      if (autoCompletedTasks[task.id] && task.recipientTask?.status !== 'completed') {
        total += task.xp_value;
      }
    });
    return total;
  };
  
  const totalXP = calculateTotalXP();
  const actualProgress = Math.min((totalXP / XP_THRESHOLD) * 100, 100);
  const actualCanApply = totalXP >= XP_THRESHOLD;

  const handleStartTask = async (taskId: string) => {
    setStartingTaskId(taskId);
    try {
      await startTask.mutateAsync(taskId);
      toast({
        title: "Task started!",
        description: "Complete this task to earn XP.",
      });
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "Error",
        description: "Failed to start task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setStartingTaskId(null);
    }
  };

  // Group tasks by type
  const socialTasks = tasks.filter(t => t.task_type === 'social');
  const profileTasks = tasks.filter(t => t.task_type === 'profile');
  const platformTasks = tasks.filter(t => t.task_type === 'platform');

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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section - XP Progress */}
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Earn XP to Apply for a Device</h1>
              <p className="text-muted-foreground">Complete tasks below to unlock your device application</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{totalXP} / {XP_THRESHOLD} XP</span>
              <span className="text-muted-foreground">{Math.round(actualProgress)}% complete</span>
            </div>
            <Progress value={actualProgress} className="h-4" />
          </div>
          
          {/* Unlock Status */}
          <div className={cn(
            "mt-6 p-4 rounded-xl flex items-center gap-4",
            actualCanApply 
              ? "bg-accent/10 border border-accent/30" 
              : "bg-muted/50 border border-border"
          )}>
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              actualCanApply ? "bg-accent text-accent-foreground" : "bg-muted-foreground/20"
            )}>
              {actualCanApply ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold",
                actualCanApply ? "text-accent" : "text-muted-foreground"
              )}>
                {actualCanApply ? "Device Application Unlocked!" : "Device Application Locked"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {actualCanApply 
                  ? "You've earned enough XP! Apply for a device now." 
                  : `Earn ${XP_THRESHOLD - totalXP} more XP to unlock device applications.`}
              </p>
            </div>
            {actualCanApply && (
              <Button asChild>
                <Link to="/recipient/apply">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Apply Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Social Tasks */}
        {socialTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Twitter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-display font-semibold">Social Tasks</h2>
              <Badge variant="secondary" className="ml-2">
                {socialTasks.filter(t => t.recipientTask?.status === 'completed').length}/{socialTasks.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {socialTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStart={handleStartTask}
                  isStarting={startingTaskId === task.id}
                  isAutoCompleted={autoCompletedTasks[task.id] || false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Profile Tasks */}
        {profileTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-display font-semibold">Profile Tasks</h2>
              <Badge variant="secondary" className="ml-2">
                {profileTasks.filter(t => t.recipientTask?.status === 'completed' || autoCompletedTasks[t.id]).length}/{profileTasks.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {profileTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStart={handleStartTask}
                  isStarting={startingTaskId === task.id}
                  isAutoCompleted={autoCompletedTasks[task.id] || false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Platform Tasks */}
        {platformTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-display font-semibold">Platform Tasks</h2>
              <Badge variant="secondary" className="ml-2">
                {platformTasks.filter(t => t.recipientTask?.status === 'completed' || autoCompletedTasks[t.id]).length}/{platformTasks.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {platformTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStart={handleStartTask}
                  isStarting={startingTaskId === task.id}
                  isAutoCompleted={autoCompletedTasks[task.id] || false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
